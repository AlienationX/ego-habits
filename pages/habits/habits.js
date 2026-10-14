// pages/habits/habits.js - Habits Library Tab (native tabBar page #1)
const i18n = require('../../utils/i18n.js');
const storage = require('../../utils/storage.js');

const TAB_INDEX = 1;

Page({
  data: {
    themeClass: '',

    tLibraryTitle: '',
    tLibraryHeadline: '',
    currentCategory: 'all',
    categories: [],
    allHabits: [],
    filteredHabits: []
  },

  onLoad() {
    this.updateTheme();
    this.loadHabitsLibraryData();

    this.unsubI18n = i18n.onLanguageChange(() => {
      this.loadHabitsLibraryData();
    });
  },

  onShow() {
    this.updateTheme();
    this.syncTabBar();
  },

  onUnload() {
    if (this.unsubI18n) this.unsubI18n();
  },

  syncTabBar() {
    const tabBar = this.getTabBar && this.getTabBar();
    if (tabBar && tabBar.setSelected) tabBar.setSelected(TAB_INDEX);
  },

  updateTheme(theme) {
    const app = getApp();
    if (!theme) {
      theme = (app && app.globalData.theme) || 'light';
    }
    this.setData({ themeClass: `theme-${theme}` });
    if (app && app.applyStatusBar) app.applyStatusBar(theme);
  },

  loadHabitsLibraryData() {
    const categories = [
      { key: 'all', label: i18n.t('habits.filterAll') },
      { key: 'move', label: i18n.t('habits.filterMove') },
      { key: 'rest', label: i18n.t('habits.filterRest') },
      { key: 'focus', label: i18n.t('habits.filterFocus') }
    ];

    const rawList = storage.getHabits();
    const allHabits = rawList.map(h => {
      // Show the configured default amount (last check-in value) when set;
      // otherwise keep the original static copy (e.g. "1 杯").
      const last = storage.getLastCheckin(h.id);
      let amount = i18n.t(h.amountKey);
      if (last && last.amount) {
        const parsed = storage.parseAmount(last.amount);
        const unitLabel = parsed.unit ? i18n.t(`units.${parsed.unit}`, parsed.unit) : '';
        amount = parsed.unit ? `${parsed.value} ${unitLabel}` : last.amount;
      }
      return { ...h, name: i18n.t(h.nameKey), amount };
    });

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

  onSelectHabit(e) {
    const habitId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/habit-detail/habit-detail?id=${habitId}`
    });
  }
});
