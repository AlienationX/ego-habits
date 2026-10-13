// pages/breath-player/breath-player.js - Breathing player
const i18n = require('../../utils/i18n.js');
const breath = require('../../utils/breath.js');
const storage = require('../../utils/storage.js');

const DURATIONS = [
  { secs: 30, key: 'breath.durations.s30' },
  { secs: 60, key: 'breath.durations.m1' },
  { secs: 180, key: 'breath.durations.m3' },
  { secs: 300, key: 'breath.durations.m5' },
  { secs: 600, key: 'breath.durations.m10' }
];

function formatTime(total) {
  const s = Math.max(0, Math.round(total));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

Page({
  data: {
    themeClass: '',
    modeId: 'box',
    modeName: '',
    tint: 'blue',
    durations: [],
    selectedDuration: 60,
    running: false,
    phaseLabel: '',
    phaseCountdown: 0,
    phaseSecs: 4,
    scale: 1.0,
    remainingText: '1:00',
    rounds: 0,

    tTag: '',
    tRemaining: '',
    tRounds: '',
    tEnd: '',
    tReady: '',
    tDuration: ''
  },

  onLoad(options) {
    this.modeId = options.mode || 'box';
    const mode = breath.getMode(this.modeId);
    const freeConfig = { inhale: options.in, hold: options.hold, exhale: options.out };
    this.timeline = breath.buildTimeline(mode, freeConfig);
    this.timer = null;
    this.stepIndex = 0;
    this.elapsed = 0;
    this.rounds = 0;

    this.updateTheme();
    this.refreshLabels();
    this.resetSession();

    this.unsubI18n = i18n.onLanguageChange(() => {
      this.refreshLabels();
      if (!this.data.running) this.applyStep(this.stepIndex);
    });
  },

  onShow() {
    this.updateTheme();
  },

  onHide() {
    this.stopTimer();
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

  refreshLabels() {
    const mode = breath.getMode(this.modeId);
    this.setData({
      modeName: i18n.t(mode.nameKey),
      tint: mode.tint,
      durations: DURATIONS.map(d => ({ secs: d.secs, label: i18n.t(d.key) })),
      tTag: i18n.t('breath.tag'),
      tRemaining: i18n.t('breath.player.remaining'),
      tRounds: i18n.t('breath.player.rounds'),
      tEnd: i18n.t('breath.player.end'),
      tReady: i18n.t('breath.player.ready'),
      tDuration: i18n.t('breath.player.duration')
    });
  },

  resetSession() {
    this.elapsed = 0;
    this.stepIndex = 0;
    this.rounds = 0;
    this.setData({
      running: false,
      remainingText: formatTime(this.data.selectedDuration),
      rounds: 0
    });
    this.applyStep(0);
  },

  applyStep(idx) {
    const step = this.timeline[idx % this.timeline.length];
    this.phaseSecs = step.secs;
    this.phaseLeft = step.secs;
    this.setData({
      phaseLabel: i18n.t(breath.PHASE[step.key] || step.key),
      phaseCountdown: Math.ceil(step.secs),
      phaseSecs: step.secs,
      scale: step.scale
    });
  },

  onSelectDuration(e) {
    if (this.data.running) return;
    const secs = Number(e.currentTarget.dataset.secs);
    this.setData({ selectedDuration: secs });
    this.resetSession();
  },

  onStart() {
    if (this.data.running) return;
    this.elapsed = 0;
    this.rounds = 0;
    this.setData({
      running: true,
      remainingText: formatTime(this.data.selectedDuration),
      rounds: 0
    });
    this.applyStep(0);
    this.startTimer();
  },

  startTimer() {
    this.stopTimer();
    this.timer = setInterval(() => this.tick(), 100);
  },

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },

  tick() {
    this.elapsed += 0.1;
    this.phaseLeft -= 0.1;

    const remaining = this.data.selectedDuration - this.elapsed;
    if (remaining <= 0) {
      this.finish();
      return;
    }

    if (this.phaseLeft <= 0) {
      this.stepIndex++;
      if (this.stepIndex > 0 && this.stepIndex % this.timeline.length === 0) {
        this.rounds++;
        this.setData({ rounds: this.rounds });
      }
      this.applyStep(this.stepIndex);
    } else {
      this.setData({ phaseCountdown: Math.ceil(this.phaseLeft) });
    }

    this.setData({ remainingText: formatTime(remaining) });
  },

  finish() {
    this.stopTimer();
    this.setData({ running: false, remainingText: '0:00', phaseCountdown: 0 });
    storage.logHabit('breathe');
    setTimeout(() => {
      wx.redirectTo({ url: '/pages/habit-complete/habit-complete?id=breathe' });
    }, 300);
  },

  onEnd() {
    this.stopTimer();
    this.setData({ running: false });
    storage.logHabit('breathe');
    wx.redirectTo({ url: '/pages/habit-complete/habit-complete?id=breathe' });
  }
});
