/**
 * EgoHabits - Storage & Local-First Habit Service
 */

const STORAGE_KEYS = {
  HABITS: 'egohabits_list',
  CHECKINS: 'egohabits_checkins',
  PROFILE: 'egohabits_profile',
  THEME: 'egohabits_theme'
};

const DEFAULT_HABITS = [
  {
    id: 'water',
    nameKey: 'habits.water.name',
    amountKey: 'habits.water.amount',
    cardTitleKey: 'habits.water.cardTitle',
    cardSubKey: 'habits.water.cardSub',
    category: 'rest',
    character: 'water',
    tint: 'blue',
    metricAmount: '250 ml',
    metricRhythm: 'Daily',
    isPrimary: true
  },
  {
    id: 'outside',
    nameKey: 'habits.outside.name',
    amountKey: 'habits.outside.amount',
    cardTitleKey: 'habits.outside.cardTitle',
    cardSubKey: 'habits.outside.cardSub',
    category: 'move',
    character: 'shoe',
    tint: 'sage',
    metricAmount: '10 min',
    metricRhythm: 'Daily',
    isPrimary: true
  },
  {
    id: 'read',
    nameKey: 'habits.read.name',
    amountKey: 'habits.read.amount',
    cardTitleKey: 'habits.read.cardTitle',
    cardSubKey: 'habits.read.cardSub',
    category: 'focus',
    character: 'book',
    tint: 'mint',
    metricAmount: '5 pages',
    metricRhythm: 'Daily',
    isPrimary: true
  },
  {
    id: 'eyes',
    nameKey: 'habits.eyes.name',
    amountKey: 'habits.eyes.amount',
    cardTitleKey: 'habits.eyes.cardTitle',
    cardSubKey: 'habits.eyes.cardSub',
    category: 'rest',
    character: 'pillow',
    tint: 'mint',
    metricAmount: '2 min',
    metricRhythm: 'Daily',
    isPrimary: false
  },
  {
    id: 'task',
    nameKey: 'habits.task.name',
    amountKey: 'habits.task.amount',
    cardTitleKey: 'habits.task.cardTitle',
    cardSubKey: 'habits.task.cardSub',
    category: 'focus',
    character: 'hourglass',
    tint: 'sage',
    metricAmount: '15 min',
    metricRhythm: 'Daily',
    isPrimary: false
  },
  {
    id: 'breathe',
    nameKey: 'habits.breathe.name',
    amountKey: 'habits.breathe.amount',
    cardTitleKey: 'habits.breathe.cardTitle',
    cardSubKey: 'habits.breathe.cardSub',
    category: 'rest',
    character: 'cloud',
    tint: 'blue',
    metricAmount: '1 min',
    metricRhythm: 'Daily',
    isPrimary: false
  }
];

const DEFAULT_PROFILE = {
  nickname: 'Avery Lane',
  handle: '@averytakesitsteady',
  avatar: 'avatar',
  totalCompleted: 28,
  streakDays: 7
};

function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const habitListeners = [];
function notifyHabitChange() {
  habitListeners.forEach(fn => {
    try { fn(); } catch (e) {}
  });
}

function onHabitChange(fn) {
  if (typeof fn === 'function') habitListeners.push(fn);
  return () => {
    const idx = habitListeners.indexOf(fn);
    if (idx > -1) habitListeners.splice(idx, 1);
  };
}

function getHabits() {
  try {
    const stored = wx.getStorageSync(STORAGE_KEYS.HABITS);
    if (stored && Array.isArray(stored) && stored.length > 0) {
      return stored;
    }
  } catch (e) {}
  return DEFAULT_HABITS;
}

function getCheckins() {
  try {
    const data = wx.getStorageSync(STORAGE_KEYS.CHECKINS);
    if (data && typeof data === 'object') return data;
  } catch (e) {}
  // Default sample history matching 12 habits in Week 06 view
  return {
    '2026-08-31': ['water'],
    '2026-09-01': ['water', 'outside'],
    '2026-09-02': ['read'],
    '2026-09-03': ['water', 'outside'],
    '2026-09-04': ['read', 'outside'],
    '2026-09-05': ['water', 'outside', 'task'],
    '2026-09-06': ['water']
  };
}

function isHabitCompletedToday(habitId) {
  const today = getTodayString();
  const checkins = getCheckins();
  const todayList = checkins[today] || [];
  return todayList.includes(habitId);
}

function logHabit(habitId) {
  const today = getTodayString();
  const checkins = getCheckins();
  if (!checkins[today]) checkins[today] = [];
  if (!checkins[today].includes(habitId)) {
    checkins[today].push(habitId);
  }
  try {
    wx.setStorageSync(STORAGE_KEYS.CHECKINS, checkins);
  } catch (e) {}

  // Update profile count
  const profile = getProfile();
  profile.totalCompleted = (profile.totalCompleted || 28) + 1;
  saveProfile(profile);

  notifyHabitChange();
  return true;
}

function toggleHabit(habitId) {
  const today = getTodayString();
  const checkins = getCheckins();
  if (!checkins[today]) checkins[today] = [];
  const idx = checkins[today].indexOf(habitId);
  let completed = false;
  if (idx > -1) {
    checkins[today].splice(idx, 1);
    completed = false;
  } else {
    checkins[today].push(habitId);
    completed = true;
  }
  try {
    wx.setStorageSync(STORAGE_KEYS.CHECKINS, checkins);
  } catch (e) {}
  notifyHabitChange();
  return completed;
}

function getWeeklyData() {
  // Returns 7 days data for the chart [Mon..Sun] matching Image 06
  return [
    { id: 'mon', day: 'M', count: 1, active: false },
    { id: 'tue', day: 'T', count: 2, active: false },
    { id: 'wed', day: 'W', count: 1, active: false },
    { id: 'thu', day: 'T', count: 2, active: false },
    { id: 'fri', day: 'F', count: 2, active: false },
    { id: 'sat', day: 'S', count: 3, active: true }, // Highest highlighted Saturday
    { id: 'sun', day: 'S', count: 1, active: false }
  ];
}

function getProfile() {
  try {
    const data = wx.getStorageSync(STORAGE_KEYS.PROFILE);
    if (data && typeof data === 'object') return { ...DEFAULT_PROFILE, ...data };
  } catch (e) {}
  return DEFAULT_PROFILE;
}

function saveProfile(profile) {
  try {
    wx.setStorageSync(STORAGE_KEYS.PROFILE, profile);
  } catch (e) {}
}

function getTheme() {
  try {
    const theme = wx.getStorageSync(STORAGE_KEYS.THEME);
    if (theme) return theme;
  } catch (e) {}
  return 'auto'; // 'auto' | 'light' | 'dark'
}

function setTheme(theme) {
  try {
    wx.setStorageSync(STORAGE_KEYS.THEME, theme);
  } catch (e) {}
}

function resetDemoData() {
  try {
    wx.removeStorageSync(STORAGE_KEYS.HABITS);
    wx.removeStorageSync(STORAGE_KEYS.CHECKINS);
    wx.removeStorageSync(STORAGE_KEYS.PROFILE);
  } catch (e) {}
  notifyHabitChange();
}

module.exports = {
  getHabits,
  getCheckins,
  isHabitCompletedToday,
  logHabit,
  toggleHabit,
  getWeeklyData,
  getProfile,
  saveProfile,
  getTheme,
  setTheme,
  resetDemoData,
  onHabitChange,
  getTodayString
};
