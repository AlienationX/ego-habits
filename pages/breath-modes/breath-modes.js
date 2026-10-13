// pages/breath-modes/breath-modes.js - Breathing mode selector
const i18n = require('../../utils/i18n.js');
const breath = require('../../utils/breath.js');

Page({
  data: {
    themeClass: '',
    modes: [],
    selected: 'box',
    showFree: false,
    freeIn: 4,
    freeHold: 4,
    freeOut: 4,

    tTag: '',
    tHeadline: '',
    tStart: '',
    tCurrent: '',
    tDisclaimer: '',
    tInhale: '',
    tHold: '',
    tExhale: ''
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
      showFree: selected === 'free',
      freeIn: freeCfg.inhale,
      freeHold: freeCfg.hold,
      freeOut: freeCfg.exhale,
      tTag: i18n.t('breath.tag'),
      tHeadline: i18n.t('breath.headline'),
      tStart: i18n.t('breath.start'),
      tCurrent: i18n.t('breath.current'),
      tDisclaimer: i18n.t('breath.disclaimer'),
      tInhale: i18n.t('breath.phases.inhale'),
      tHold: i18n.t('breath.phases.hold'),
      tExhale: i18n.t('breath.phases.exhale')
    });
  },

  onSelectMode(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ selected: id, showFree: id === 'free' });
  },

  onFreeChange(e) {
    const field = e.currentTarget.dataset.field;
    const delta = Number(e.currentTarget.dataset.delta);
    let next = (this.data[field] || 4) + delta;
    if (next < 1) next = 1;
    if (next > 30) next = 30;
    this.setData({ [field]: next });
  },

  onStart() {
    const id = this.data.selected;
    breath.saveMode(id);
    if (id === 'free') {
      const cfg = {
        inhale: this.data.freeIn,
        hold: this.data.freeHold,
        exhale: this.data.freeOut
      };
      breath.saveFreeConfig(cfg);
      wx.navigateTo({
        url: `/pages/breath-player/breath-player?mode=free&in=${cfg.inhale}&hold=${cfg.hold}&out=${cfg.exhale}`
      });
    } else {
      wx.navigateTo({
        url: `/pages/breath-player/breath-player?mode=${id}`
      });
    }
  }
});
