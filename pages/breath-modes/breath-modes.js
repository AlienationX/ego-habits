// pages/breath-modes/breath-modes.js - Breathing mode selector
const i18n = require('../../utils/i18n.js');
const breath = require('../../utils/breath.js');

Page({
  data: {
    themeClass: '',
    modes: [],
    selected: 'box',

    // Free breathing config sheet
    showFreeSheet: false,
    freeIn: 4,
    freeHold: 4,
    freeOut: 4,
    freeHoldOut: 0,
    freeDurMin: 3,
    freeSummarySeq: '',
    freeSummarySub: '',
    sliderColor: '#4FA65A',

    tTag: '',
    tHeadline: '',
    tCurrent: '',
    tDisclaimer: '',
    tInhale: '',
    tHold: '',
    tExhale: '',
    tFreeTitle: '',
    tFreeHint: '',
    tFreeHoldIn: '',
    tFreeHoldOut: '',
    tFreeDuration: '',
    tFreeSave: '',
    tSecUnit: '',
    tMinUnit: ''
  },

  onLoad() {
    this.updateTheme();
    this.loadModes();

    this.unsubI18n = i18n.onLanguageChange(() => {
      this.loadModes();
    });
  },

  onShow() {
    this.updateTheme();
    this.loadModes();
  },

  onUnload() {
    if (this.unsubI18n) this.unsubI18n();
  },

  updateTheme(theme) {
    if (!theme) {
      const app = getApp();
      theme = (app && app.globalData.theme) || 'light';
    }
    this.setData({
      themeClass: `theme-${theme}`,
      sliderColor: theme === 'dark' ? '#54B560' : '#4FA65A'
    });
  },

  loadModes() {
    const selected = breath.getSavedMode();
    const freeCfg = breath.getFreeConfig();
    const modes = breath.MODES.map(m => ({
      id: m.id,
      name: i18n.t(m.nameKey),
      desc: i18n.t(m.descKey),
      pattern: i18n.t(m.patternKey),
      tint: m.tint,
      inUse: m.id === selected
    }));

    this.setData({
      modes,
      selected,
      freeIn: freeCfg.inhale || 4,
      freeHold: freeCfg.hold || 0,
      freeOut: freeCfg.exhale || 4,
      freeHoldOut: freeCfg.holdOut || 0,
      freeDurMin: freeCfg.durationMin || 3,
      tTag: i18n.t('breath.tag'),
      tHeadline: i18n.t('breath.headline'),
      tCurrent: i18n.t('breath.current'),
      tDisclaimer: i18n.t('breath.disclaimer'),
      tInhale: i18n.t('breath.phases.inhale'),
      tHold: i18n.t('breath.phases.hold'),
      tExhale: i18n.t('breath.phases.exhale'),
      tFreeTitle: i18n.t('breath.freeSheet.title'),
      tFreeHint: i18n.t('breath.freeSheet.hint'),
      tFreeHoldIn: i18n.t('breath.freeSheet.holdIn'),
      tFreeHoldOut: i18n.t('breath.freeSheet.holdOut'),
      tFreeDuration: i18n.t('breath.freeSheet.duration'),
      tFreeSave: i18n.t('breath.freeSheet.saveStart'),
      tSecUnit: i18n.t('breath.freeSheet.secUnit'),
      tMinUnit: i18n.t('units.min')
    });
  },

  onSelectMode(e) {
    const id = e.currentTarget.dataset.id;

    // Preset modes: tap enters the practice directly.
    if (id !== 'free') {
      breath.saveMode(id);
      wx.navigateTo({ url: `/pages/breath-player/breath-player?mode=${id}` });
      return;
    }

    // Free mode: open the custom rhythm sheet.
    this.setData({ selected: 'free', showFreeSheet: true });
    this.updateFreeSummary();
  },

  noop() {},

  onCloseFreeSheet() {
    this.setData({ showFreeSheet: false });
  },

  onFreeSlider(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({ [field]: value });
    this.updateFreeSummary();
  },

  updateFreeSummary() {
    const d = this.data;
    const secUnit = d.tSecUnit;
    const parts = [`${d.tInhale} ${d.freeIn}${secUnit}`];
    if (d.freeHold > 0) parts.push(`${d.tHold} ${d.freeHold}${secUnit}`);
    parts.push(`${d.tExhale} ${d.freeOut}${secUnit}`);
    if (d.freeHoldOut > 0) parts.push(`${d.tHold} ${d.freeHoldOut}${secUnit}`);

    const round = d.freeIn
      + (d.freeHold > 0 ? d.freeHold : 0)
      + d.freeOut
      + (d.freeHoldOut > 0 ? d.freeHoldOut : 0);
    const rounds = Math.max(1, Math.floor((d.freeDurMin * 60) / round));
    const lang = i18n.getLanguage();
    const sub = lang === 'zh'
      ? `每轮 ${round} 秒 · 约 ${rounds} 轮`
      : `${round}s per round · about ${rounds} rounds`;

    this.setData({
      freeSummarySeq: parts.join(' → '),
      freeSummarySub: sub
    });
  },

  onStartFree() {
    const d = this.data;
    const cfg = {
      inhale: d.freeIn,
      hold: d.freeHold,
      exhale: d.freeOut,
      holdOut: d.freeHoldOut,
      durationMin: d.freeDurMin
    };
    breath.saveMode('free');
    breath.saveFreeConfig(cfg);
    this.setData({ showFreeSheet: false });
    wx.navigateTo({
      url: `/pages/breath-player/breath-player?mode=free&in=${cfg.inhale}&hold=${cfg.hold}&out=${cfg.exhale}&holdOut=${cfg.holdOut}&dur=${cfg.durationMin * 60}`
    });
  }
});
