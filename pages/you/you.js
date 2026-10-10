// pages/you/you.js
const i18n = require('../../utils/i18n.js');
const storage = require('../../utils/storage.js');

Page({
  data: {
    themeClass: '',
    profile: {},
    currentLang: 'en',
    currentTheme: 'auto',
    showPrefModal: false,

    tTag: '',
    tHeadline: '',
    tStatCompletedLabel: '',
    tStatStreakLabel: '',
    tMilestoneSection: '',
    tBadgeTitle: '',
    tBadgeDesc: '',
    tSettingsSection: '',
    tGentleReminders: '',
    tPreferences: '',

    tPrefTitle: '',
    tLanguage: '',
    tTheme: '',
    tResetData: ''
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
    this.loadProfile();
  },

  onUnload() {
    if (this.unsubI18n) this.unsubI18n();
  },

  updateTheme() {
    const app = getApp();
    const theme = (app && app.globalData.theme) || 'light';
    this.setData({ themeClass: `theme-${theme}` });
  },

  loadProfile() {
    const profile = storage.getProfile();
    this.setData({ profile });
  },

  loadData() {
    this.loadProfile();
    this.setData({
      currentLang: i18n.getLanguage(),
      currentTheme: storage.getTheme(),
      tTag: i18n.t('you.tag'),
      tHeadline: i18n.t('you.headline'),
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
    this.loadProfile();
    this.onClosePreferences();
  }
});
