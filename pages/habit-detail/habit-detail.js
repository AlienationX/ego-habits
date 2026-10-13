// pages/habit-detail/habit-detail.js
const i18n = require('../../utils/i18n.js');
const storage = require('../../utils/storage.js');

// Resolve per-habit copy with a common fallback chain:
// detail.<id>.<key> -> detail.common.<key> -> ''
function detailText(id, key) {
  const specific = i18n.t(`detail.${id}.${key}`, '');
  if (specific) return specific;
  return i18n.t(`detail.common.${key}`, '');
}

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
    tMetricAmountLabel: '',
    tMetricRhythm: '',
    tMetricRhythmLabel: '',
    tGuideTitle: '',
    steps: [],
    tLogButton: '',
    tAlreadyLogged: '',
    moduleLabel: ''
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

  updateTheme(theme) {
    if (!theme) {
      const app = getApp();
      theme = (app && app.globalData.theme) || 'light';
    }
    this.setData({ themeClass: `theme-${theme}` });
  },

  checkCompletion() {
    const isCompleted = storage.isHabitCompletedToday(this.data.habitId);
    this.setData({ isCompleted });
  },

  loadHabitData() {
    const allHabits = storage.getHabits();
    const habit = allHabits.find(h => h.id === this.data.habitId) || allHabits[0];
    const id = habit.id;

    const steps = [1, 2, 3].map(i => ({
      num: i,
      title: detailText(id, `step${i}Title`),
      desc: detailText(id, `step${i}Desc`)
    }));

    this.setData({
      habit,
      isCompleted: storage.isHabitCompletedToday(habit.id),
      tTag: detailText(id, 'tag'),
      tHeadline: detailText(id, 'headline') || i18n.t(habit.cardTitleKey),
      tHeroTitle: detailText(id, 'heroTitle'),
      tHeroSub: detailText(id, 'heroSub'),
      tMetricAmountLabel: detailText(id, 'metricAmountLabel'),
      tMetricRhythm: detailText(id, 'rhythmDaily'),
      tMetricRhythmLabel: detailText(id, 'metricRhythmLabel'),
      tGuideTitle: detailText(id, 'guideTitle'),
      steps,
      tLogButton: detailText(id, 'logButton'),
      tAlreadyLogged: detailText(id, 'alreadyLogged'),
      moduleLabel: habit.module ? i18n.t(`detail.module.${habit.module}`, '') : ''
    });
  },

  onOpenModule() {
    const habit = this.data.habit;
    if (!habit.module) return;
    if (habit.module === 'breathing') {
      wx.navigateTo({ url: '/pages/breath-modes/breath-modes' });
    } else if (habit.module === 'timer') {
      wx.navigateTo({ url: `/pages/timer/timer?id=${habit.id}` });
    }
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
