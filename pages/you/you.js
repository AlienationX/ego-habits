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
    tSettingsSection: '',
    tGentleReminders: '',
    tPreferences: '',


    // Milestone Badges
    badges: [],
    selectedBadge: null,
    showBadgeModal: false,
    tBadgeGallery: '',
    tUnlocked: '',
    tLocked: '',

    // Habit Notes Stream
    checkinNotes: [],
    tNotesSection: '',
    tNotesEmpty: '',

    // Reminders Modal
    showRemindersModal: false,
    reminders: {
      morningEnabled: false,
      morningTime: '08:30',
      eveningEnabled: false,
      eveningTime: '21:30'
    },
    tRemindersTitle: '',
    tRemindersSub: '',
    tMorning: '',
    tMorningSub: '',
    tEvening: '',
    tEveningSub: '',
    tAddToCalendar: '',
    tSubscribeMsg: '',

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

    if (wx.showShareMenu) {
      wx.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
      });
    }

    this.unsubI18n = i18n.onLanguageChange(() => {
      this.loadProfileData();
    });

    this.unsubHabits = storage.onHabitChange(() => {
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
    if (this.unsubHabits) this.unsubHabits();
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

    // Load Badges
    const rawBadges = storage.getBadges();
    const badges = rawBadges.map(b => ({
      ...b,
      title: i18n.t(b.nameKey),
      desc: i18n.t(b.descKey)
    }));

    // Load Check-in Notes
    const habits = storage.getHabits();
    const habitMap = {};
    habits.forEach(h => {
      habitMap[h.id] = {
        name: h.nameKey ? i18n.t(h.nameKey) : (h.name || h.cardTitle),
        character: h.character || 'medal'
      };
    });

    const rawNotes = storage.getCheckinNotes(30);
    const checkinNotes = rawNotes.map(n => ({
      ...n,
      habitName: (habitMap[n.habitId] && habitMap[n.habitId].name) || n.habitId,
      character: (habitMap[n.habitId] && habitMap[n.habitId].character) || 'medal'
    }));

    const reminders = storage.getReminders();

    this.setData({
      profile,
      badges,
      checkinNotes,
      reminders,
      currentLang: i18n.getLanguage(),
      langPref: i18n.getLanguagePreference(),
      currentTheme: storage.getTheme(),

      tTag: i18n.t('you.tag'),
      tYouHeadline: i18n.t('you.headline'),
      tStatCompletedLabel: i18n.t('you.statCompletedLabel'),
      tStatStreakLabel: i18n.t('you.statStreakLabel'),
      tMilestoneSection: i18n.t('badges.title', 'Milestone Badges'),
      tBadgeGallery: i18n.t('badges.allTitle', 'All Badges'),
      tUnlocked: i18n.t('badges.unlocked', 'Unlocked'),
      tLocked: i18n.t('badges.locked', 'Locked'),

      tNotesSection: i18n.t('notes.sectionTitle', 'Habit Notes'),
      tNotesEmpty: i18n.t('notes.empty', 'No notes yet'),

      tSettingsSection: i18n.t('you.settingsSection'),
      tGentleReminders: i18n.t('you.gentleReminders'),
      tPreferences: i18n.t('you.preferences'),
      tPrefTitle: i18n.t('you.prefTitle'),
      tLanguage: i18n.t('you.language'),
      tTheme: i18n.t('you.theme'),
      tClearData: i18n.t('you.clearData'),

      tRemindersTitle: i18n.t('reminders.title', 'Gentle Reminders'),
      tRemindersSub: i18n.t('reminders.sub', 'Mindful pauses throughout your day'),
      tMorning: i18n.t('reminders.morning', 'Morning Awake'),
      tMorningSub: i18n.t('reminders.morningSub', 'Light care to begin'),
      tEvening: i18n.t('reminders.evening', 'Evening Reflection'),
      tEveningSub: i18n.t('reminders.eveningSub', 'Peaceful pause before rest'),
      tAddToCalendar: i18n.t('reminders.addToCalendar', 'Add to System Calendar'),
      tSubscribeMsg: i18n.t('reminders.subscribeMsg', 'Subscribe Notice')
    });
  },

  // ---- Badge Detail Modal ----
  onTapBadge(e) {
    const id = e.currentTarget.dataset.id;
    const badge = this.data.badges.find(b => b.id === id);
    if (!badge) return;
    this.setData({ selectedBadge: badge, showBadgeModal: true });
    this.toggleTabBar(true);
  },

  onCloseBadgeModal() {
    this.setData({ showBadgeModal: false });
    this.toggleTabBar(false);
  },

  // ---- Reminders Modal ----
  onTapReminders() {
    this.setData({ showRemindersModal: true });
    this.toggleTabBar(true);
  },

  onCloseReminders() {
    this.setData({ showRemindersModal: false });
    this.toggleTabBar(false);
  },

  onToggleMorning(e) {
    const reminders = { ...this.data.reminders, morningEnabled: e.detail.value };
    this.setData({ reminders });
    storage.saveReminders(reminders);
  },

  onChangeMorningTime(e) {
    const reminders = { ...this.data.reminders, morningTime: e.detail.value };
    this.setData({ reminders });
    storage.saveReminders(reminders);
  },

  onToggleEvening(e) {
    const reminders = { ...this.data.reminders, eveningEnabled: e.detail.value };
    this.setData({ reminders });
    storage.saveReminders(reminders);
  },

  onChangeEveningTime(e) {
    const reminders = { ...this.data.reminders, eveningTime: e.detail.value };
    this.setData({ reminders });
    storage.saveReminders(reminders);
  },

  onAddCalendarReminders() {
    const isZh = i18n.getLanguage() === 'zh';
    const now = new Date();
    const morningParts = (this.data.reminders.morningTime || '08:30').split(':');
    const startHour = parseInt(morningParts[0], 10) || 8;
    const startMin = parseInt(morningParts[1], 10) || 30;

    const eventDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour, startMin);
    const startTimeSec = Math.floor(eventDate.getTime() / 1000);

    if (wx.addPhoneRepeatCalendar) {
      wx.addPhoneRepeatCalendar({
        title: isZh ? 'EgoHabits 晨间温柔微习惯' : 'EgoHabits Morning Care',
        startTime: startTimeSec,
        repeatInterval: 'day',
        description: isZh ? '按你自己的节奏，喝一口水，轻抚身心。' : 'Start your day with gentle care.',
        success: () => {
          wx.showToast({ title: i18n.t('reminders.calendarSuccess', 'Calendar added!'), icon: 'success' });
        },
        fail: () => {
          this.fallbackCalendar(isZh, startTimeSec);
        }
      });
    } else {
      this.fallbackCalendar(isZh, startTimeSec);
    }
  },

  fallbackCalendar(isZh, startTimeSec) {
    if (wx.addPhoneCalendar) {
      wx.addPhoneCalendar({
        title: isZh ? 'EgoHabits 晨间温柔微习惯' : 'EgoHabits Morning Care',
        startTime: startTimeSec,
        description: isZh ? '按你自己的节奏，喝一口水，轻抚身心。' : 'Start your day with gentle care.',
        success: () => {
          wx.showToast({ title: i18n.t('reminders.calendarSuccess', 'Calendar added!'), icon: 'success' });
        },
        fail: () => {
          wx.showToast({ title: i18n.t('reminders.calendarFail', 'Calendar permission required'), icon: 'none' });
        }
      });
    } else {
      wx.showToast({ title: i18n.t('reminders.calendarSuccess', 'Calendar reminder saved!'), icon: 'success' });
    }
  },

  onSubscribeNotice() {
    wx.showToast({
      title: i18n.t('reminders.subscribed', 'Gentle notice subscribed!'),
      icon: 'success'
    });
  },

  // ---- Preferences Modal ----
  onOpenPreferences() {
    this.setData({ showPrefModal: true });
    this.toggleTabBar(true);
  },

  onClosePreferences() {
    this.setData({ showPrefModal: false });
    this.toggleTabBar(false);
  },

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
  },

  onShareAppMessage() {
    const profile = storage.getProfile();
    const name = profile.nickname || 'Avery';
    const title = i18n.getLanguage() === 'zh'
      ? `${name} 邀你一起开启慢调微习惯生活`
      : `${name} invites you to cultivate gentle micro-habits on EgoHabits`;
    return {
      title,
      path: '/pages/index/index?from=you_share'
    };
  },

  onShareTimeline() {
    const title = i18n.getLanguage() === 'zh'
      ? 'EgoHabits · 为生活做一点小习惯，从容向前'
      : 'EgoHabits · Small habits. Room to grow.';
    return {
      title,
      query: 'from=timeline'
    };
  }
});
