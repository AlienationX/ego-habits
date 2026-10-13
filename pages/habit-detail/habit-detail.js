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

    // Check-in input (amount + generic note)
    showEditor: false,
    displayAmount: '',
    amountValue: 0,
    amountUnit: '',
    amountUnitLabel: '',
    amountStep: 1,
    noteValue: '',
    tAmountLabel: '',
    tEditDefault: '',
    tNoteLabel: '',
    tNotePlaceholder: '',
    tCancel: '',
    tSave: ''
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

    // Remembered last check-in amount becomes the new default (seamless).
    const last = storage.getLastCheckin(id);
    const amountStr = (last && last.amount) || habit.metricAmount || '';
    const parsed = storage.parseAmount(amountStr);
    // Units are stored canonically ("5 pages"); display them localized.
    const unitLabel = parsed.unit ? i18n.t(`units.${parsed.unit}`, parsed.unit) : '';
    const displayText = parsed.unit ? `${parsed.value} ${unitLabel}` : amountStr;

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
      tLogButton: habit.module
        ? i18n.t(`detail.module.${habit.module}`)
        : detailText(id, 'logButton'),
      tAlreadyLogged: detailText(id, 'alreadyLogged'),
      displayAmount: displayText,
      amountValue: parsed.value,
      amountUnit: parsed.unit,
      amountUnitLabel: unitLabel,
      amountStep: habit.step || 1,
      noteValue: (last && last.note) || '',
      tAmountLabel: detailText(id, 'amountLabel'),
      tEditDefault: detailText(id, 'editDefaultLabel'),
      tNoteLabel: detailText(id, 'noteLabel'),
      tNotePlaceholder: detailText(id, 'notePlaceholder'),
      tCancel: i18n.t('common.cancel'),
      tSave: i18n.t('common.save')
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

  onDecreaseAmount() {
    const step = this.data.amountStep;
    const next = Math.max(step, this.data.amountValue - step);
    this.setData({ amountValue: next });
  },

  onIncreaseAmount() {
    this.setData({ amountValue: this.data.amountValue + this.data.amountStep });
  },

  onNoteInput(e) {
    this.setData({ noteValue: e.detail.value });
  },

  noop() {},

  onOpenEditor() {
    this.setData({ showEditor: true });
  },

  onCloseEditor() {
    // Discard edits: restore values from storage.
    this.loadHabitData();
    this.setData({ showEditor: false });
  },

  onConfirmEditor() {
    storage.setLastCheckin(this.data.habitId, {
      amount: this.buildAmountString(),
      note: (this.data.noteValue || '').trim()
    });
    this.loadHabitData();
    this.setData({ showEditor: false });
  },

  buildAmountString() {
    const v = this.data.amountValue;
    const u = this.data.amountUnit;
    return u ? `${v} ${u}` : String(v);
  },

  onLogHabit() {
    // Module habits (timer / breathing): the CTA starts the practice directly.
    if (this.data.habit.module) {
      this.onOpenModule();
      return;
    }

    const amount = this.buildAmountString();
    const note = (this.data.noteValue || '').trim();
    storage.logHabit(this.data.habitId, amount, note);
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
