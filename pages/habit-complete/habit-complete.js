// pages/habit-complete/habit-complete.js
const i18n = require('../../utils/i18n.js');
const storage = require('../../utils/storage.js');

const CONFETTI_COLORS = ['var(--green)', 'var(--sage)', 'var(--blue)', 'var(--mint)', 'var(--cream)'];

// Fixed confetti layout: { x/y: % position, w/h: rpx, shape: ''|'dot', ci: color index, d: delay }
const CONFETTI = [
  { x: 6, y: 16, w: 16, h: 30, shape: '', ci: 0, d: 0 },
  { x: 18, y: 6, w: 14, h: 14, shape: 'dot', ci: 2, d: 0.4 },
  { x: 30, y: 18, w: 20, h: 12, shape: '', ci: 1, d: 0.9 },
  { x: 46, y: 4, w: 16, h: 16, shape: 'dot', ci: 3, d: 0.2 },
  { x: 62, y: 14, w: 18, h: 32, shape: '', ci: 4, d: 1.1 },
  { x: 78, y: 6, w: 14, h: 14, shape: 'dot', ci: 0, d: 0.7 },
  { x: 88, y: 22, w: 20, h: 12, shape: '', ci: 2, d: 0.3 },
  { x: 8, y: 48, w: 18, h: 12, shape: '', ci: 3, d: 1.3 },
  { x: 86, y: 52, w: 16, h: 30, shape: '', ci: 1, d: 0.5 },
  { x: 20, y: 76, w: 14, h: 14, shape: 'dot', ci: 4, d: 0.8 },
  { x: 40, y: 86, w: 18, h: 12, shape: '', ci: 0, d: 0.1 },
  { x: 58, y: 80, w: 16, h: 16, shape: 'dot', ci: 2, d: 1 },
  { x: 74, y: 88, w: 20, h: 12, shape: '', ci: 3, d: 0.6 },
  { x: 90, y: 72, w: 14, h: 14, shape: 'dot', ci: 1, d: 1.4 }
].map(c => ({ ...c, color: CONFETTI_COLORS[c.ci] }));

// Resolve per-habit copy with a common fallback chain:
// complete.<id>.<key> -> complete.common.<key> -> ''
function completeText(id, key) {
  const specific = i18n.t(`complete.${id}.${key}`, '');
  if (specific) return specific;
  return i18n.t(`complete.common.${key}`, '');
}

Page({
  data: {
    themeClass: '',
    habitId: 'water',
    metricAdded: '+250 ml',
    note: '',
    barAnimated: false,
    useBadge: false,
    confetti: [],

    tTag: '',
    tHeadline: '',
    tMetricLabel: '',
    tCardTitle: '',
    tCardSub: '',
    tBtnBack: '',
    tBtnViewWeek: '',
    tFooterText: ''
  },

  onLoad(options) {
    const habitId = options.id || 'water';
    this.setData({ habitId });
    this.updateTheme();
    this.loadContent();

    this.unsubI18n = i18n.onLanguageChange(() => {
      this.loadContent();
    });

    // Trigger progress bar animation after small delay
    setTimeout(() => {
      this.setData({ barAnimated: true });
    }, 150);
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

  loadContent() {
    const allHabits = storage.getHabits();
    const habit = allHabits.find(h => h.id === this.data.habitId) || allHabits[0];
    const id = habit.id;
    const last = storage.getLastCheckin(id);
    const amountStr = (last && last.amount) || habit.metricAmount;
    const parsed = storage.parseAmount(amountStr);
    const unitLabel = parsed.unit ? i18n.t(`units.${parsed.unit}`, parsed.unit) : '';
    const metricAdded = parsed.unit
      ? `+${parsed.value} ${unitLabel}`
      : (amountStr ? `+${amountStr}` : '+250 ml');

    // Water keeps its celebrate character; other habits get a check badge + confetti.
    const useBadge = id !== 'water';

    this.setData({
      metricAdded,
      note: (last && last.note) || '',
      useBadge,
      confetti: CONFETTI,
      tTag: completeText(id, 'tag'),
      tHeadline: completeText(id, 'headline'),
      tMetricLabel: completeText(id, 'metricLabel'),
      tCardTitle: completeText(id, 'cardTitle'),
      tCardSub: completeText(id, 'cardSub'),
      tBtnBack: completeText(id, 'btnBack'),
      tBtnViewWeek: completeText(id, 'btnViewWeek'),
      tFooterText: completeText(id, 'footerText')
    });
  },

  onBackToToday() {
    wx.switchTab({ url: '/pages/index/index' });
  },

  onViewWeek() {
    wx.switchTab({
      url: '/pages/week/week',
      fail: () => {
        wx.navigateTo({ url: '/pages/week/week' });
      }
    });
  }
});
