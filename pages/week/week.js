// pages/week/week.js
const i18n = require('../../utils/i18n.js');
const storage = require('../../utils/storage.js');

Page({
  data: {
    themeClass: '',
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
    weeklyBars: []
  },

  onLoad() {
    this.updateTheme();
    this.loadWeekData();

    this.unsubI18n = i18n.onLanguageChange(() => {
      this.loadWeekData();
    });
  },

  onShow() {
    this.updateTheme();
    this.loadWeekData();
  },

  onUnload() {
    if (this.unsubI18n) this.unsubI18n();
  },

  updateTheme() {
    const app = getApp();
    const theme = (app && app.globalData.theme) || 'light';
    this.setData({ themeClass: `theme-${theme}` });
  },

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
  }
});
