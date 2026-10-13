// pages/habit-complete/habit-complete.js
const i18n = require('../../utils/i18n.js');
const storage = require('../../utils/storage.js');

// Resolve per-habit copy with a common fallback chain:
// complete.<id>.<key> -> complete.common.<key> -> ''
function completeText(id, key) {
  const specific = i18n.t(`complete.${id}.${key}`, '');
  if (specific) return specific;
  return i18n.t(`complete.common.${key}`, '');
}

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

    this.unsubI18n = i18n.onLanguageChange(() => {
      this.loadContent();
    });

    // Trigger progress bar animation after small delay
    setTimeout(() => {
      this.setData({ barAnimated: true });
    }, 150);
  },

  onShow() {
    this.updateTheme();
  },

  onUnload() {
    if (this.unsubI18n) this.unsubI18n();
  },

  updateTheme(theme) {
    if (!theme) {
      const app = getApp();
      theme = (app && app.globalData.theme) || 'light';
    }
    this.setData({ themeClass: `theme-${theme}` });
  },

  loadContent() {
    const allHabits = storage.getHabits();
    const habit = allHabits.find(h => h.id === this.data.habitId) || allHabits[0];
    const id = habit.id;
    const metricAdded = habit.metricAmount ? `+${habit.metricAmount}` : '+250 ml';

    this.setData({
      metricAdded,
      tTag: completeText(id, 'tag'),
      tHeadline: completeText(id, 'headline'),
      tMetricLabel: completeText(id, 'metricLabel'),
      tCardTitle: completeText(id, 'cardTitle'),
      tCardSub: completeText(id, 'cardSub'),
      tBtnBack: completeText(id, 'btnBack'),
      tBtnViewWeek: completeText(id, 'btnViewWeek'),
      tFooterText: completeText(id, 'footerText')
    });
  },

  onBackToToday() {
    wx.switchTab({ url: '/pages/index/index' });
  },

  onViewWeek() {
    wx.switchTab({
      url: '/pages/week/week',
      fail: () => {
        wx.navigateTo({ url: '/pages/week/week' });
      }
    });
  }
});
