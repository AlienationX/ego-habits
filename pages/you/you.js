// pages/you/you.js - Your Space Tab (native tabBar page #3)
const i18n = require('../../utils/i18n.js');
const storage = require('../../utils/storage.js');

const TAB_INDEX = 3;

Page({
  data: {
    themeClass: '',

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

    // Preferences Modal
    showPrefModal: false,
    currentLang: 'en',
    langPref: 'auto',
    currentTheme: 'auto',
    tPrefTitle: '',
    tLanguage: '',
    tTheme: '',
    tClearData: ''
  },

  onLoad() {
    this.updateTheme();
    this.loadProfileData();

    this.unsubI18n = i18n.onLanguageChange(() => {
      this.loadProfileData();
    });
  },

  onShow() {
    this.updateTheme();
    this.syncTabBar();
    this.loadProfileData();
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

  loadProfileData() {
    const profile = storage.getProfile();
    const stats = storage.getStats();
    profile.totalCompleted = stats.total;
    profile.streakDays = stats.streak;

    this.setData({
      profile,
      currentLang: i18n.getLanguage(),
      langPref: i18n.getLanguagePreference(),
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
      tClearData: i18n.t('you.clearData')
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
    this.toggleTabBar(true);
  },

  onClosePreferences() {
    this.setData({ showPrefModal: false });
    this.toggleTabBar(false);
  },

  // The floating tab bar sits on top of the bottom-sheet modal
  toggleTabBar(hidden) {
    const tabBar = this.getTabBar && this.getTabBar();
    if (tabBar && tabBar.setHidden) tabBar.setHidden(hidden);
  },

  preventProp() {},

  onClearCache() {
    wx.showModal({
      title: i18n.t('you.clearData'),
      content: i18n.t('you.clearConfirmContent'),
      confirmText: i18n.t('common.confirm'),
      cancelText: i18n.t('common.cancel'),
      success: (res) => {
        if (!res.confirm) return;
        storage.clearAllData();
        const app = getApp();
        if (app) app.applyTheme(storage.getTheme());
        this.loadProfileData();
        this.onClosePreferences();
        wx.showToast({
          title: i18n.t('you.clearDone'),
          icon: 'success'
        });
      }
    });
  },

  onSelectLanguage(e) {
    const lang = e.currentTarget.dataset.lang;
    i18n.setLanguage(lang);
    this.setData({
      currentLang: i18n.getLanguage(),
      langPref: i18n.getLanguagePreference()
    });
    this.loadProfileData();
  },

  onSelectTheme(e) {
    const theme = e.currentTarget.dataset.theme;
    storage.setTheme(theme);
    const app = getApp();
    if (app) app.applyTheme(theme);
    this.setData({ currentTheme: theme });
    this.updateTheme();
  }
});
