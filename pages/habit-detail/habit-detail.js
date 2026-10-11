// pages/habit-detail/habit-detail.js
const i18n = require('../../utils/i18n.js');
const storage = require('../../utils/storage.js');

Page({
  data: {
    themeClass: '',
    habitId: 'water',
    habit: {},
    isCompleted: false,

    tTag: '',
    tHeadline: '',
    tHeroTitle: '',
    tHeroSub: '',
    tMetricAmount: '',
    tMetricAmountLabel: '',
    tMetricRhythm: '',
    tMetricRhythmLabel: '',
    tGuideTitle: '',
    tStep1Title: '',
    tStep1Desc: '',
    tStep2Title: '',
    tStep2Desc: '',
    tStep3Title: '',
    tStep3Desc: '',
    tLogButton: '',
    tAlreadyLogged: ''
  },

  onLoad(options) {
    const habitId = options.id || 'water';
    this.setData({ habitId });
    this.updateTheme();
    this.loadHabitData();

    this.unsubI18n = i18n.onLanguageChange(() => {
      this.loadHabitData();
    });
  },

  onShow() {
    this.updateTheme();
    this.checkCompletion();
  },

  onUnload() {
    if (this.unsubI18n) this.unsubI18n();
  },

  updateTheme() {
    const app = getApp();
    const theme = (app && app.globalData.theme) || 'light';
    this.setData({ themeClass: `theme-${theme}` });
  },

  checkCompletion() {
    const isCompleted = storage.isHabitCompletedToday(this.data.habitId);
    this.setData({ isCompleted });
  },

  loadHabitData() {
    const allHabits = storage.getHabits();
    const habit = allHabits.find(h => h.id === this.data.habitId) || allHabits[0];

    this.setData({
      habit,
      isCompleted: storage.isHabitCompletedToday(habit.id),
      tTag: i18n.t('detail.tag'),
      tHeadline: habit.id === 'water' ? i18n.t('detail.headline') : i18n.t(habit.cardTitleKey),
      tHeroTitle: i18n.t('detail.heroTitle'),
      tHeroSub: i18n.t('detail.heroSub'),
      tMetricAmount: habit.metricAmount || i18n.t('detail.metricAmount'),
      tMetricAmountLabel: i18n.t('detail.metricAmountLabel'),
      tMetricRhythm: habit.metricRhythm || i18n.t('detail.metricRhythm'),
      tMetricRhythmLabel: i18n.t('detail.metricRhythmLabel'),
      tGuideTitle: i18n.t('detail.guideTitle'),
      tStep1Title: i18n.t('detail.step1Title'),
      tStep1Desc: i18n.t('detail.step1Desc'),
      tStep2Title: i18n.t('detail.step2Title'),
      tStep2Desc: i18n.t('detail.step2Desc'),
      tStep3Title: i18n.t('detail.step3Title'),
      tStep3Desc: i18n.t('detail.step3Desc'),
      tLogButton: i18n.t('detail.logButton'),
      tAlreadyLogged: i18n.t('detail.alreadyLogged')
    });
  },

  onLogHabit() {
    storage.logHabit(this.data.habitId);
    this.setData({ isCompleted: true });

    // Haptic feedback
    if (wx.vibrateShort) wx.vibrateShort({ type: 'medium' });

    // Navigate to completion screen
    setTimeout(() => {
      wx.navigateTo({
        url: `/pages/habit-complete/habit-complete?id=${this.data.habitId}`
      });
    }, 180);
  }
});
