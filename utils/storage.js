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
    tint: 'mint',
    metricAmount: '10 min',
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
    tint: 'sage',
    metricAmount: '5 pages',
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
    tint: 'mint-soft',
    metricAmount: '2 min',
    module: 'timer',
    durationSec: 120,
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
    tint: 'sage-soft',
    metricAmount: '15 min',
    module: 'timer',
    durationSec: 900,
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
    tint: 'blue-soft',
    metricAmount: '1 min',
    module: 'breathing',
    isPrimary: false
  }
];

const DEFAULT_PROFILE = {
  nickname: 'Avery Lane',
  handle: '@averytakesitsteady',
  avatar: 'avatar',
  totalCompleted: 0,
  streakDays: 0
};

function formatDateKey(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getTodayString() {
  return formatDateKey(new Date());
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
  let stored = null;
  try {
    const data = wx.getStorageSync(STORAGE_KEYS.HABITS);
    if (data && Array.isArray(data) && data.length > 0) stored = data;
  } catch (e) {}

  if (!stored) return DEFAULT_HABITS;

  // Migration: habits saved by older versions lack fields added later
  // (module, durationSec…). Merge stored values over the defaults so new
  // fields always exist, then keep any custom habits.
  const storedById = {};
  stored.forEach(h => {
    if (h && h.id) storedById[h.id] = h;
  });

  const merged = DEFAULT_HABITS.map(def => (
    storedById[def.id] ? { ...def, ...storedById[def.id] } : { ...def }
  ));

  const defIds = new Set(DEFAULT_HABITS.map(d => d.id));
  stored.forEach(h => {
    if (h && h.id && !defIds.has(h.id)) merged.push(h);
  });

  return merged;
}

function getCheckins() {
  try {
    const data = wx.getStorageSync(STORAGE_KEYS.CHECKINS);
    if (data && typeof data === 'object' && !Array.isArray(data)) return data;
  } catch (e) {}
  return {};
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
    try {
      wx.setStorageSync(STORAGE_KEYS.CHECKINS, checkins);
    } catch (e) {}
  }
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

// Real profile stats computed from check-in records (no demo seed)
function getStats() {
  const checkins = getCheckins();
  let total = 0;
  Object.keys(checkins).forEach(key => {
    const list = checkins[key];
    if (Array.isArray(list)) total += list.length;
  });

  const dayMs = 86400000;
  const hasCheckin = (date) => {
    const list = checkins[formatDateKey(date)];
    return Array.isArray(list) && list.length > 0;
  };

  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  // A streak survives if today is not logged yet but yesterday was
  if (!hasCheckin(cursor)) cursor = new Date(cursor.getTime() - dayMs);

  let streak = 0;
  while (hasCheckin(cursor)) {
    streak++;
    cursor = new Date(cursor.getTime() - dayMs);
  }

  return { total, streak };
}

// Current week (Mon..Sun) summary computed from real check-ins
function getWeekSummary() {
  const checkins = getCheckins();
  const catById = {};
  getHabits().forEach(h => { catById[h.id] = h.category; });

  const now = new Date();
  const dow = now.getDay(); // 0 = Sunday
  const monOffset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() + monOffset);

  const dayMs = 86400000;
  const dayLetters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const bars = [];
  let total = 0;
  let restCount = 0;
  let moveCount = 0;

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday.getTime() + i * dayMs);
    const key = formatDateKey(d);
    const list = Array.isArray(checkins[key]) ? checkins[key] : [];
    list.forEach(id => {
      const cat = catById[id];
      if (cat === 'move' || cat === 'focus') moveCount++;
      else restCount++;
    });
    total += list.length;
    bars.push({ id: key, day: dayLetters[i], count: list.length, active: false });
  }

  // Highlight the strongest day of the week
  let maxIdx = -1;
  let maxCount = 0;
  bars.forEach((b, i) => {
    if (b.count > maxCount) {
      maxCount = b.count;
      maxIdx = i;
    }
  });
  if (maxIdx > -1) bars[maxIdx].active = true;

  return { bars, total, restCount, moveCount };
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

// Full local wipe: habits + check-ins + preferences + module settings.
// Language preference is kept (it is a user setting, not cache).
function clearAllData() {
  const keys = [
    STORAGE_KEYS.HABITS,
    STORAGE_KEYS.CHECKINS,
    STORAGE_KEYS.PROFILE,
    STORAGE_KEYS.THEME,
    'egohabits_breath_mode',
    'egohabits_breath_free'
  ];
  try {
    keys.forEach(k => wx.removeStorageSync(k));
  } catch (e) {}
  notifyHabitChange();
}

module.exports = {
  getHabits,
  getCheckins,
  isHabitCompletedToday,
  logHabit,
  toggleHabit,
  getStats,
  getWeekSummary,
  getProfile,
  saveProfile,
  getTheme,
  setTheme,
  clearAllData,
  onHabitChange,
  getTodayString
};
