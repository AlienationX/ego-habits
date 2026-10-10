// pages/habits/habits.js
const i18n = require('../../utils/i18n.js');
const storage = require('../../utils/storage.js');

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
    this.loadData();

    this.unsubI18n = i18n.onLanguageChange(() => {
      this.loadData();
    });
  },

  onShow() {
    this.updateTheme();
  },

  onUnload() {
    if (this.unsubI18n) this.unsubI18n();
  },

  updateTheme() {
    const app = getApp();
    const theme = (app && app.globalData.theme) || 'light';
    this.setData({ themeClass: `theme-${theme}` });
  },

  loadData() {
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

    this.applyFilter();
  },

  onSelectCategory(e) {
    const category = e.currentTarget.dataset.key;
    this.setData({ currentCategory: category });
    this.applyFilter();
  },

  applyFilter() {
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
