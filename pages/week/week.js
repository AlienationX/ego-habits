// pages/week/week.js - Weekly Reflection Tab (native tabBar page #2)
const i18n = require('../../utils/i18n.js');
const storage = require('../../utils/storage.js');

const TAB_INDEX = 2;

const EN_MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

const CAL_HEAD_ZH = [
  { k: 0, l: '一' }, { k: 1, l: '二' }, { k: 2, l: '三' }, { k: 3, l: '四' },
  { k: 4, l: '五' }, { k: 5, l: '六' }, { k: 6, l: '日' }
];
const CAL_HEAD_EN = [
  { k: 0, l: 'M' }, { k: 1, l: 'T' }, { k: 2, l: 'W' }, { k: 3, l: 'T' },
  { k: 4, l: 'F' }, { k: 5, l: 'S' }, { k: 6, l: 'S' }
];

function formatDayKey(d) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${dd}`;
}

Page({
  data: {
    themeClass: '',

    tTag: '',
    tDateRange: '',
    tHeadline: '',
    tCompletedNumber: '0',
    tCompletedLabel: '',
    tMilestoneTitle: '',
    tMilestoneDays: '',
    tBreakdownTitle: '',
    tCatWater: '',
    tCatWaterCount: '',
    tCatMove: '',
    tCatMoveCount: '',
    tBackToThisWeek: '',
    tViewChart: '',
    tViewCalendar: '',
    tNoRecord: '',
    weeklyBars: [],
    weekOffset: 0,
    canGoNext: false,

    // Calendar view
    viewMode: 'chart', // 'chart' | 'calendar'
    calOffset: 0,
    calTitle: '',
    calHead: [],
    calWeeks: [],
    canNextMonth: false,
    selectedKey: '',
    selectedLabel: '',
    selectedHabits: []
  },

  onLoad() {
    this.updateTheme();
    this.loadWeekData();

    this.unsubI18n = i18n.onLanguageChange(() => {
      this.loadWeekData();
    });
  },

  onShow() {
    this.updateTheme();
    this.syncTabBar();
    this.loadWeekData();
  },

  onUnload() {
    if (this.unsubI18n) this.unsubI18n();
  },

  syncTabBar() {
    const tabBar = this.getTabBar && this.getTabBar();
    if (tabBar && tabBar.setSelected) tabBar.setSelected(TAB_INDEX);
  },

  updateTheme(theme) {
    const app = getApp();
    if (!theme) {
      theme = (app && app.globalData.theme) || 'light';
    }
    this.setData({ themeClass: `theme-${theme}` });
    if (app && app.applyStatusBar) app.applyStatusBar(theme);
  },

  formatDateRange(lang, weekOffset) {
    const offset = weekOffset || 0;
    const now = new Date();
    const dow = now.getDay();
    const monOffset = dow === 0 ? -6 : 1 - dow;
    const monday = new Date(now);
    monday.setDate(now.getDate() + monOffset + offset * 7);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const fmt = (d) => {
      const m = d.getMonth() + 1;
      const dd = String(d.getDate()).padStart(2, '0');
      if (lang === 'zh') return `${m}月${dd}日`;
      return `${EN_MONTHS[d.getMonth()]} ${dd}`;
    };

    return `${fmt(monday)} - ${fmt(sunday)}`;
  },

  loadWeekData() {
    const offset = this.data.weekOffset;
    const summary = storage.getWeekSummary(offset);
    const lang = i18n.getLanguage();
    const unit = i18n.t('week.unitTimes');

    this.setData({
      tTag: i18n.t('week.tag'),
      tDateRange: this.formatDateRange(lang, offset),
      tHeadline: i18n.t('week.headline'),
      tCompletedNumber: String(summary.total),
      tCompletedLabel: i18n.t('week.completedLabel'),
      tMilestoneTitle: i18n.t('week.milestoneTitle'),
      tMilestoneDays: i18n.t('week.milestoneDays'),
      tBreakdownTitle: i18n.t('week.breakdownTitle'),
      tCatWater: i18n.t('week.catWater'),
      tCatWaterCount: `${summary.restCount} ${unit}`,
      tCatMove: i18n.t('week.catMove'),
      tCatMoveCount: `${summary.moveCount} ${unit}`,
      tBackToThisWeek: i18n.t('week.backToThisWeek'),
      tViewChart: i18n.t('week.viewChart'),
      tViewCalendar: i18n.t('week.viewCalendar'),
      tNoRecord: i18n.t('week.noRecord'),
      weeklyBars: summary.bars,
      canGoNext: offset < 0
    });

    if (this.data.viewMode === 'calendar') this.loadCalendarData();
  },

  onPrevWeek() {
    this.setData({ weekOffset: this.data.weekOffset - 1 });
    this.loadWeekData();
  },

  onNextWeek() {
    if (this.data.weekOffset >= 0) return;
    this.setData({ weekOffset: this.data.weekOffset + 1 });
    this.loadWeekData();
  },

  onBackToThisWeek() {
    this.setData({ weekOffset: 0 });
    this.loadWeekData();
  },

  // ---- View toggle ----

  onSwitchView(e) {
    const mode = e.currentTarget.dataset.mode;
    if (mode !== 'chart' && mode !== 'calendar') return;
    this.setData({ viewMode: mode, selectedKey: '', selectedLabel: '', selectedHabits: [] });
    if (mode === 'calendar') this.loadCalendarData();
  },

  // ---- Calendar view ----

  loadCalendarData() {
    const offset = this.data.calOffset;
    const lang = i18n.getLanguage();
    const now = new Date();
    const base = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const year = base.getFullYear();
    const monthIdx = base.getMonth();
    const todayKey = storage.getTodayString();

    const title = lang === 'zh'
      ? `${year}年${monthIdx + 1}月`
      : `${EN_MONTHS[monthIdx]} ${year}`;

    // Grid starts on the Monday of the week containing the 1st.
    const first = new Date(year, monthIdx, 1);
    const dow = first.getDay(); // 0 = Sunday
    const monOffset = dow === 0 ? -6 : 1 - dow;

    const checkins = storage.getCheckins();
    const cursor = new Date(year, monthIdx, 1 + monOffset);

    const weeks = [];
    for (let w = 0; w < 6; w++) {
      const days = [];
      for (let d = 0; d < 7; d++) {
        const key = formatDayKey(cursor);
        const list = checkins[key];
        days.push({
          key,
          day: cursor.getDate(),
          inMonth: cursor.getMonth() === monthIdx,
          future: key > todayKey,
          isToday: key === todayKey,
          count: Array.isArray(list) ? list.length : 0
        });
        cursor.setDate(cursor.getDate() + 1);
      }
      weeks.push({ key: `w${w}`, days });
    }

    this.setData({
      calTitle: title,
      calHead: lang === 'zh' ? CAL_HEAD_ZH : CAL_HEAD_EN,
      calWeeks: weeks,
      canNextMonth: offset < 0
    });
  },

  onPrevMonth() {
    this.setData({ calOffset: this.data.calOffset - 1, selectedKey: '', selectedLabel: '', selectedHabits: [] });
    this.loadCalendarData();
  },

  onNextMonth() {
    if (this.data.calOffset >= 0) return;
    this.setData({ calOffset: this.data.calOffset + 1, selectedKey: '', selectedLabel: '', selectedHabits: [] });
    this.loadCalendarData();
  },

  onDayTap(e) {
    const key = e.currentTarget.dataset.key;
    if (!key) return;
    const checkins = storage.getCheckins();
    const list = checkins[key] || [];
    const nameById = {};
    storage.getHabits().forEach(h => { nameById[h.id] = i18n.t(h.nameKey); });

    const parts = key.split('-');
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const lang = i18n.getLanguage();
    const label = lang === 'zh' ? `${monthIdx + 1}月${day}日` : `${EN_MONTHS[monthIdx]} ${day}`;

    this.setData({
      selectedKey: key,
      selectedLabel: label,
      selectedHabits: list.map(id => nameById[id] || id)
    });
  }
});
