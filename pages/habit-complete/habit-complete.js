// pages/habit-complete/habit-complete.js
const i18n = require('../../utils/i18n.js');
const storage = require('../../utils/storage.js');

Page({
  data: {
    themeClass: '',
    habitId: 'water',
    metricAdded: '+250 ml',
    barAnimated: false,

    tTag: '',
    tHeadline: '',
    tMetricLabel: '',
    tCardTitle: '',
    tCardSub: '',
    tBtnBack: '',
    tBtnViewWeek: '',
    tFooterText: ''
  },

  onLoad(options) {
    const habitId = options.id || 'water';
    this.setData({ habitId });
    this.updateTheme();
    this.loadContent();

    // Trigger progress bar animation after small delay
    setTimeout(() => {
      this.setData({ barAnimated: true });
    }, 150);
  },

  onShow() {
    this.updateTheme();
  },

  updateTheme() {
    const app = getApp();
    const theme = (app && app.globalData.theme) || 'light';
    this.setData({ themeClass: `theme-${theme}` });
  },

  loadContent() {
    const allHabits = storage.getHabits();
    const habit = allHabits.find(h => h.id === this.data.habitId) || allHabits[0];
    const metricAdded = habit.metricAmount ? `+${habit.metricAmount}` : '+250 ml';

    this.setData({
      metricAdded,
      tTag: i18n.t('complete.tag'),
      tHeadline: i18n.t('complete.headline'),
      tMetricLabel: i18n.t('complete.metricLabel'),
      tCardTitle: i18n.t('complete.cardTitle'),
      tCardSub: i18n.t('complete.cardSub'),
      tBtnBack: i18n.t('complete.btnBack'),
      tBtnViewWeek: i18n.t('complete.btnViewWeek'),
      tFooterText: i18n.t('complete.footerText')
    });
  },

  onBackToToday() {
    wx.reLaunch({
      url: '/pages/index/index'
    });
  },

  onViewWeek() {
    wx.reLaunch({
      url: '/pages/week/week',
      fail: () => {
        wx.navigateTo({ url: '/pages/week/week' });
      }
    });
  }
});
