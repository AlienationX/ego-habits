// pages/index/index.js - Unified Zero-Flicker Tab Container
const i18n = require('../../utils/i18n.js');
const storage = require('../../utils/storage.js');

Page({
  data: {
    currentTab: 'today',
    themeClass: '',

    // Today Data
    dateString: '',
    tGreeting: '',
    tHeroTitle: '',
    tHeroSub: '',
    tGetStarted: '',
    tSectionTitle: '',
    todayHabits: [],

    // Habits Library Data
    tLibraryTitle: '',
    tLibraryHeadline: '',
    currentCategory: 'all',
    categories: [],
    allHabits: [],
    filteredHabits: [],

    // Week Data
    tDateRange: '',
    tHeadline: '',
    tCompletedNumber: '12',
    tCompletedLabel: '',
    tMilestoneTitle: '',
    tMilestoneDays: '',
    tBreakdownTitle: '',
    tCatWater: '',
    tCatWaterCount: '',
    tCatMove: '',
    tCatMoveCount: '',
    weeklyBars: [],

    // You Data
    tTag: '',
    tYouHeadline: '',
    profile: {},
    tStatCompletedLabel: '',
    tStatStreakLabel: '',
    tMilestoneSection: '',
    tBadgeTitle: '',
    tBadgeDesc: '',
    tSettingsSection: '',
    tGentleReminders: '',
    tPreferences: '',

    // Preferences Modal Data
    showPrefModal: false,
    currentLang: 'en',
    currentTheme: 'auto',
    tPrefTitle: '',
    tLanguage: '',
    tTheme: '',
    tResetData: ''
  },

  onLoad(options) {
    if (options && options.tab) {
      this.setData({ currentTab: options.tab });
    }
    this.updateTheme();
    this.refreshAllData();

    // Listen to language changes
    this.unsubI18n = i18n.onLanguageChange(() => {
      this.refreshAllData();
    });

    // Listen to habit completion changes
    this.unsubHabits = storage.onHabitChange(() => {
      this.loadTodayHabits();
      this.loadProfileData();
    });
  },

  onShow() {
    this.updateTheme();
    this.loadTodayHabits();
    this.loadProfileData();
    this.loadWeekData();
  },

  onUnload() {
    if (this.unsubI18n) this.unsubI18n();
    if (this.unsubHabits) this.unsubHabits();
  },

  // Instant Tab Switching (0ms latency, zero white screen, full memory cache)
  onSwitchTab(e) {
    const { key } = e.detail;
    if (key === this.data.currentTab) return;
    this.setData({ currentTab: key });
  },

  updateTheme() {
    const app = getApp();
    const theme = (app && app.globalData.theme) || 'light';
    this.setData({
      themeClass: `theme-${theme}`
    });
  },

  formatDateHeader() {
    const lang = i18n.getLanguage();
    const d = new Date();
    if (lang === 'zh') {
      const month = d.getMonth() + 1;
      const day = d.getDate();
      const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      return `EGOHABITS / ${month}月${day}日 ${weekDays[d.getDay()]}`;
    } else {
      const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
      const weekDays = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      return `EGOHABITS / ${weekDays[d.getDay()]}, ${months[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}`;
    }
  },

  refreshAllData() {
    this.loadTodayData();
    this.loadHabitsLibraryData();
    this.loadWeekData();
    this.loadProfileData();
  },

  // ==================== TODAY DATA ====================
  loadTodayData() {
    this.setData({
      dateString: this.formatDateHeader(),
      tGreeting: i18n.t('today.greeting'),
      tHeroTitle: i18n.t('today.heroTitle'),
      tHeroSub: i18n.t('today.heroSub'),
      tGetStarted: i18n.t('today.getStarted'),
      tSectionTitle: i18n.t('today.sectionTitle')
    });
    this.loadTodayHabits();
  },

  loadTodayHabits() {
    const allHabits = storage.getHabits();
    const primary = allHabits.slice(0, 3);
    const todayHabits = primary.map(h => ({
      id: h.id,
      title: i18n.t(h.cardTitleKey),
      sub: i18n.t(h.cardSubKey),
      character: h.character,
      tint: h.tint,
      completed: storage.isHabitCompletedToday(h.id)
    }));
    this.setData({ todayHabits });
  },

  onGetStarted() {
    this.setData({ currentTab: 'habits' });
  },

  onOpenHabit(e) {
    const habitId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/habit-detail/habit-detail?id=${habitId}`
    });
  },

  // ==================== HABITS LIBRARY DATA ====================
  loadHabitsLibraryData() {
    const categories = [
      { key: 'all', label: i18n.t('habits.filterAll') },
      { key: 'move', label: i18n.t('habits.filterMove') },
      { key: 'rest', label: i18n.t('habits.filterRest') },
      { key: 'focus', label: i18n.t('habits.filterFocus') }
    ];

    const rawList = storage.getHabits();
    const allHabits = rawList.map(h => ({
      ...h,
      name: i18n.t(h.nameKey),
      amount: i18n.t(h.amountKey)
    }));

    this.setData({
      tLibraryTitle: i18n.t('habits.libraryTitle'),
      tLibraryHeadline: i18n.t('habits.libraryHeadline'),
      categories,
      allHabits
    });
    this.applyCategoryFilter();
  },

  onSelectCategory(e) {
    const category = e.currentTarget.dataset.key;
    this.setData({ currentCategory: category });
    this.applyCategoryFilter();
  },

  applyCategoryFilter() {
    const cat = this.data.currentCategory;
    if (cat === 'all') {
      this.setData({ filteredHabits: this.data.allHabits });
    } else {
      const filtered = this.data.allHabits.filter(h => h.category === cat);
      this.setData({ filteredHabits: filtered });
    }
  },

  // ==================== WEEK DATA ====================
  loadWeekData() {
    const weeklyBars = storage.getWeeklyData();
    this.setData({
      tDateRange: i18n.t('week.dateRange'),
      tHeadline: i18n.t('week.headline'),
      tCompletedNumber: i18n.t('week.completedNumber'),
      tCompletedLabel: i18n.t('week.completedLabel'),
      tMilestoneTitle: i18n.t('week.milestoneTitle'),
      tMilestoneDays: i18n.t('week.milestoneDays'),
      tBreakdownTitle: i18n.t('week.breakdownTitle'),
      tCatWater: i18n.t('week.catWater'),
      tCatWaterCount: i18n.t('week.catWaterCount'),
      tCatMove: i18n.t('week.catMove'),
      tCatMoveCount: i18n.t('week.catMoveCount'),
      weeklyBars
    });
  },

  // ==================== YOU DATA ====================
  loadProfileData() {
    const profile = storage.getProfile();
    this.setData({
      profile,
      currentLang: i18n.getLanguage(),
      currentTheme: storage.getTheme(),
      tTag: i18n.t('you.tag'),
      tYouHeadline: i18n.t('you.headline'),
      tStatCompletedLabel: i18n.t('you.statCompletedLabel'),
      tStatStreakLabel: i18n.t('you.statStreakLabel'),
      tMilestoneSection: i18n.t('you.milestoneSection'),
      tBadgeTitle: i18n.t('you.badgeTitle'),
      tBadgeDesc: i18n.t('you.badgeDesc'),
      tSettingsSection: i18n.t('you.settingsSection'),
      tGentleReminders: i18n.t('you.gentleReminders'),
      tPreferences: i18n.t('you.preferences'),
      tPrefTitle: i18n.t('you.prefTitle'),
      tLanguage: i18n.t('you.language'),
      tTheme: i18n.t('you.theme'),
      tResetData: i18n.t('you.resetData')
    });
  },

  onTapReminders() {
    const isZh = i18n.getLanguage() === 'zh';
    wx.showToast({
      title: isZh ? '保持温柔与松弛' : 'Keep it gentle',
      icon: 'none'
    });
  },

  onOpenPreferences() {
    this.setData({ showPrefModal: true });
  },

  onClosePreferences() {
    this.setData({ showPrefModal: false });
  },

  preventProp() {},

  onSelectLanguage(e) {
    const lang = e.currentTarget.dataset.lang;
    i18n.setLanguage(lang);
    this.setData({ currentLang: lang });
    this.refreshAllData();
  },

  onSelectTheme(e) {
    const theme = e.currentTarget.dataset.theme;
    storage.setTheme(theme);
    const app = getApp();
    if (app) app.applyTheme(theme);
    this.setData({ currentTheme: theme });
    this.updateTheme();
  },

  onResetDemo() {
    storage.resetDemoData();
    const isZh = i18n.getLanguage() === 'zh';
    wx.showToast({
      title: isZh ? '数据已重置' : 'Data reset',
      icon: 'success'
    });
    this.refreshAllData();
    this.onClosePreferences();
  }
});
