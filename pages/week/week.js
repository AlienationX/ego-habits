// pages/week/week.js - Weekly Reflection Tab (native tabBar page #2)
const i18n = require('../../utils/i18n.js');
const storage = require('../../utils/storage.js');

const TAB_INDEX = 2;

const EN_MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

Page({
  data: {
    themeClass: '',

    tDateRange: '',
    tHeadline: '',
    tCompletedNumber: '0',
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
    this.syncTabBar();
    this.loadWeekData();
  },

  onUnload() {
    if (this.unsubI18n) this.unsubI18n();
  },

  syncTabBar() {
    const tabBar = this.getTabBar && this.getTabBar();
    if (tabBar && tabBar.setSelected) tabBar.setSelected(TAB_INDEX);
  },

  updateTheme(theme) {
    if (!theme) {
      const app = getApp();
      theme = (app && app.globalData.theme) || 'light';
    }
    this.setData({ themeClass: `theme-${theme}` });
  },

  formatDateRange(lang) {
    const now = new Date();
    const dow = now.getDay();
    const monOffset = dow === 0 ? -6 : 1 - dow;
    const monday = new Date(now);
    monday.setDate(now.getDate() + monOffset);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const fmt = (d) => {
      const m = d.getMonth() + 1;
      const dd = String(d.getDate()).padStart(2, '0');
      if (lang === 'zh') return `${m}月${dd}日`;
      return `${EN_MONTHS[d.getMonth()]} ${dd}`;
    };

    return `${fmt(monday)} - ${fmt(sunday)}`;
  },

  loadWeekData() {
    const summary = storage.getWeekSummary();
    const lang = i18n.getLanguage();
    const unit = i18n.t('week.unitTimes');

    this.setData({
      tDateRange: this.formatDateRange(lang),
      tHeadline: i18n.t('week.headline'),
      tCompletedNumber: String(summary.total),
      tCompletedLabel: i18n.t('week.completedLabel'),
      tMilestoneTitle: i18n.t('week.milestoneTitle'),
      tMilestoneDays: i18n.t('week.milestoneDays'),
      tBreakdownTitle: i18n.t('week.breakdownTitle'),
      tCatWater: i18n.t('week.catWater'),
      tCatWaterCount: `${summary.restCount} ${unit}`,
      tCatMove: i18n.t('week.catMove'),
      tCatMoveCount: `${summary.moveCount} ${unit}`,
      weeklyBars: summary.bars
    });
  }
});
