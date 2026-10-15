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

    // Check-in input (amount + generic note + custom subtitle)
    showEditor: false,
    displayAmount: '',
    amountValue: 0,
    amountUnit: '',
    amountUnitLabel: '',
    amountStep: 1,
    noteValue: '',
    customSubValue: '',
    tSubLabel: '',
    tSubPlaceholder: '',
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
    const app = getApp();
    if (!theme) {
      theme = (app && app.globalData.theme) || 'light';
    }
    this.setData({ themeClass: `theme-${theme}` });
    if (app && app.applyStatusBar) app.applyStatusBar(theme);
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
      tHeadline: detailText(id, 'headline') || (habit.cardTitleKey ? i18n.t(habit.cardTitleKey) : (habit.name || habit.cardTitle)),
      tHeroTitle: detailText(id, 'heroTitle'),
      tHeroSub: habit.sub || detailText(id, 'heroSub') || (habit.cardSub ? habit.cardSub.replace(/^.*?·\s*/, '') : ''),
      tMetricAmountLabel: detailText(id, 'metricAmountLabel'),
      tMetricRhythm: detailText(id, 'rhythmDaily'),
      tMetricRhythmLabel: detailText(id, 'metricRhythmLabel'),
      tGuideTitle: detailText(id, 'guideTitle'),
      steps,
      tLogButton: habit.module
        ? i18n.t(`detail.module.${habit.module}`)
        : detailText(id, 'logButton'),
      tAlreadyLogged: detailText(id, 'alreadyLogged'),
      tDeleteHabit: i18n.t('custom.deleteBtn', 'Delete habit'),
      displayAmount: displayText,
      amountValue: parsed.value,
      amountUnit: parsed.unit,
      amountUnitLabel: unitLabel,
      amountStep: habit.step || 1,
      noteValue: (last && last.note) || '',
      customSubValue: habit.sub || (habit.cardSub ? habit.cardSub.replace(/^.*?·\s*/, '') : ''),
      tSubLabel: i18n.t('custom.subLabel', '小标题'),
      tSubPlaceholder: i18n.t('custom.subPlaceholder', '例如：随时随地，不慌不忙 / 属于故事的宁静时刻'),
      tAmountLabel: detailText(id, 'amountLabel'),
      tEditDefault: detailText(id, 'editDefaultLabel'),
      tNoteLabel: detailText(id, 'noteLabel'),
      tNotePlaceholder: detailText(id, 'notePlaceholder'),
      tCancel: i18n.t('common.cancel'),
      tSave: i18n.t('common.save')
    });
  },

  onDeleteCustomHabit() {
    const isZh = i18n.getLanguage() === 'zh';
    wx.showModal({
      title: isZh ? '删除习惯' : 'Delete Habit',
      content: i18n.t('custom.deleteConfirm'),
      confirmText: isZh ? '删除' : 'Delete',
      confirmColor: '#FF5A5F',
      cancelText: i18n.t('common.cancel'),
      success: (res) => {
        if (res.confirm) {
          storage.deleteCustomHabit(this.data.habitId);
          wx.showToast({ title: isZh ? '已删除' : 'Deleted', icon: 'success' });
          setTimeout(() => {
            wx.navigateBack({ delta: 1 });
          }, 350);
        }
      }
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

  onCustomSubInput(e) {
    this.setData({ customSubValue: e.detail.value });
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
    const habit = this.data.habit;
    if (habit.isCustom) {
      storage.updateHabit(this.data.habitId, {
        amount: this.buildAmountString(),
        sub: (this.data.customSubValue || '').trim()
      });
    }
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
