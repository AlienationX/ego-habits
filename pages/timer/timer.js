// pages/timer/timer.js - Reusable timed session (eyes rest / quiet focus)
const i18n = require('../../utils/i18n.js');
const storage = require('../../utils/storage.js');

function formatTime(total) {
  const s = Math.max(0, Math.round(total));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

Page({
  data: {
    themeClass: '',
    habitId: 'eyes',
    habit: {},
    leftText: '2:00',
    status: 'idle', // idle | running | paused

    tName: '',
    tHint: '',
    tStart: '',
    tPause: '',
    tResume: '',
    tEnd: ''
  },

  onLoad(options) {
    this.habitId = options.id || 'eyes';
    const all = storage.getHabits();
    const habit = all.find(h => h.id === this.habitId) || all[0];

    // Countdown follows the configured default amount ("15 分钟" -> 15 min),
    // falling back to the habit's durationSec when nothing is parsable.
    const last = storage.getLastCheckin(habit.id);
    const amountStr = (last && last.amount) || habit.metricAmount || '';
    const parsed = storage.parseAmount(amountStr);
    const minutes = parsed.value > 0 ? parsed.value : 0;
    this.durationSec = minutes > 0 ? Math.round(minutes * 60) : (habit.durationSec || 120);
    this.left = this.durationSec;
    this.timer = null;

    this.updateTheme();
    this.loadLabels(habit);
    this.setData({ leftText: formatTime(this.left) });

    this.unsubI18n = i18n.onLanguageChange(() => {
      this.loadLabels(habit);
    });
  },

  onShow() {
    this.updateTheme();
  },

  onHide() {
    this.pauseTimer();
  },

  onUnload() {
    this.stopTimer();
    if (this.unsubI18n) this.unsubI18n();
  },

  updateTheme(theme) {
    if (!theme) {
      const app = getApp();
      theme = (app && app.globalData.theme) || 'light';
    }
    this.setData({ themeClass: `theme-${theme}` });
  },

  loadLabels(habit) {
    this.setData({
      habit,
      habitId: habit.id,
      tName: i18n.t(`session.${habit.id}.name`) || i18n.t(habit.cardTitleKey),
      tHint: i18n.t(`session.${habit.id}.hint`),
      tStart: i18n.t('session.start'),
      tPause: i18n.t('session.pause'),
      tResume: i18n.t('session.resume'),
      tEnd: i18n.t('session.end')
    });
  },

  onPrimary() {
    if (this.data.status === 'running') {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  },

  startTimer() {
    this.setData({ status: 'running' });
    this.stopTimer();
    this.timer = setInterval(() => this.tick(), 1000);
  },

  pauseTimer() {
    this.stopTimer();
    this.setData({ status: 'paused' });
  },

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },

  tick() {
    this.left -= 1;
    if (this.left <= 0) {
      this.finish();
      return;
    }
    this.setData({ leftText: formatTime(this.left) });
  },

  finish() {
    this.stopTimer();
    this.setData({ status: 'idle', leftText: '0:00' });
    storage.logHabit(this.habitId);
    setTimeout(() => {
      wx.redirectTo({ url: `/pages/habit-complete/habit-complete?id=${this.habitId}` });
    }, 300);
  },

  onEnd() {
    // Early stop: do NOT record or celebrate — only a full session counts.
    this.stopTimer();
    this.setData({ status: 'idle' });
    wx.navigateBack({ fail: () => wx.switchTab({ url: '/pages/index/index' }) });
  }
});
