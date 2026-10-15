// pages/breath-player/breath-player.js - Breathing player
const i18n = require('../../utils/i18n.js');
const breath = require('../../utils/breath.js');
const storage = require('../../utils/storage.js');
const soundscape = require('../../utils/soundscape.js');

const DURATIONS = [
  { secs: 30, key: 'breath.durations.s30' },
  { secs: 60, key: 'breath.durations.m1' },
  { secs: 180, key: 'breath.durations.m3' },
  { secs: 300, key: 'breath.durations.m5' },
  { secs: 600, key: 'breath.durations.m10' }
];

const SOUND_OPTIONS = [
  { id: 'none', key: 'soundscape.none' },
  { id: 'rain', key: 'soundscape.rain' },
  { id: 'waves', key: 'soundscape.waves' },
  { id: 'bowl', key: 'soundscape.bowl' },
  { id: 'forest', key: 'soundscape.forest' }
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
    selectedSound: 'none',
    soundList: [],
    tSoundscape: '',
    running: false,
    phaseLabel: '',
    phaseCountdown: 0,
    phaseSecs: 4,
    scale: 1.0,
    remainingText: '1:00',
    rounds: 0,

    tTag: '',
    tStart: '',
    tRemaining: '',
    tRounds: '',
    tEnd: '',
    tReady: '',
    tDuration: ''
  },

  onLoad(options) {
    this.modeId = options.mode || 'box';
    const mode = breath.getMode(this.modeId);
    const freeConfig = {
      inhale: options.in,
      hold: options.hold,
      exhale: options.out,
      holdOut: options.holdOut
    };
    this.timeline = breath.buildTimeline(mode, freeConfig);
    this.timer = null;
    this.stepIndex = 0;
    this.elapsed = 0;
    this.rounds = 0;

    const savedSound = storage.getSoundscapeSetting ? storage.getSoundscapeSetting() : { sound: 'none' };

    this.updateTheme();
    this.refreshLabels();

    // Free mode: use the duration configured in the sheet.
    const dur = Number(options.dur);
    if (isFinite(dur) && dur >= 30) {
      this.setData({ selectedDuration: Math.round(dur) });
    }

    this.setData({ selectedSound: savedSound.sound || 'none' });
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
    soundscape.stop();
  },

  onUnload() {
    this.stopTimer();
    soundscape.stop();
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

  refreshLabels() {
    const mode = breath.getMode(this.modeId);
    this.setData({
      modeName: i18n.t(mode.nameKey),
      tint: mode.tint,
      durations: DURATIONS.map(d => ({ secs: d.secs, label: i18n.t(d.key) })),
      soundList: SOUND_OPTIONS.map(s => ({
        id: s.id,
        label: i18n.t(s.key, s.id)
      })),
      tSoundscape: i18n.t('soundscape.title', 'Ambient Soundscape'),
      tTag: i18n.t('breath.tag'),
      tStart: i18n.t('breath.start'),
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

    // Tactile haptic pulse on breathing phase shift for eyes-closed mindfulness
    try {
      if (wx.vibrateShort) {
        wx.vibrateShort({ type: 'light' });
      }
    } catch (e) {}
  },

  onSelectDuration(e) {
    if (this.data.running) return;
    const secs = Number(e.currentTarget.dataset.secs);
    this.setData({ selectedDuration: secs });
    this.resetSession();
  },

  onSelectSound(e) {
    const soundId = e.currentTarget.dataset.id;
    this.setData({ selectedSound: soundId });
    if (this.data.running) {
      soundscape.play(soundId, 50);
    } else {
      if (storage.saveSoundscapeSetting) {
        storage.saveSoundscapeSetting({ sound: soundId, volume: 50, playing: false });
      }
    }
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
    if (this.data.selectedSound && this.data.selectedSound !== 'none') {
      soundscape.play(this.data.selectedSound, 50);
    }
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
    soundscape.stop();
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
    soundscape.stop();
    this.setData({ running: false, remainingText: '0:00', phaseCountdown: 0 });
    storage.logHabit('breathe');
    setTimeout(() => {
      wx.redirectTo({ url: '/pages/habit-complete/habit-complete?id=breathe' });
    }, 300);
  },

  onEnd() {
    // Early stop: do NOT record or celebrate — only a full session counts.
    this.stopTimer();
    soundscape.stop();
    this.setData({ running: false });
    wx.navigateBack({ fail: () => wx.switchTab({ url: '/pages/index/index' }) });
  }
});
