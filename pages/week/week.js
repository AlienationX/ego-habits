// pages/week/week.js - Weekly Reflection Tab (native tabBar page #2)
const i18n = require('../../utils/i18n.js');
const storage = require('../../utils/storage.js');
const poster = require('../../utils/poster.js');

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
    selectedHabits: [],

    // Poster Modal
    showPosterModal: false,
    posterImageUrl: '',
    posterLoading: false,
    posterSaving: false,
    tSharePosterBtn: '',
    tSaveImage: '',
    tSavingPoster: '',
    tShareToFriend: '',
    tCopyShareText: ''
  },

  onLoad() {
    this.updateTheme();
    this.loadWeekData();

    if (wx.showShareMenu) {
      wx.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
      });
    }

    this.unsubI18n = i18n.onLanguageChange(() => {
      this.loadWeekData();
    });

    this.unsubHabits = storage.onHabitChange(() => {
      this.loadWeekData();
    });
  },

  onShow() {
    this.updateTheme();
    this.syncTabBar();
    this.loadWeekData();
  },

  onHide() {
    const tabbar = this.getTabBar && this.getTabBar();
    if (tabbar && tabbar.setHidden) tabbar.setHidden(false);
  },

  onUnload() {
    const tabbar = this.getTabBar && this.getTabBar();
    if (tabbar && tabbar.setHidden) tabbar.setHidden(false);
    if (this.unsubI18n) this.unsubI18n();
    if (this.unsubHabits) this.unsubHabits();
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
      tShareWeekly: i18n.t('share.shareWeekly', '分享周报'),
      tSharePosterBtn: i18n.t('share.posterBtn', 'Share Poster'),
      tSaveImage: i18n.t('share.saveImage', 'Save to Album'),
      tSavingPoster: i18n.t('share.saving', 'Creating poster...'),
      tShareToFriend: i18n.t('share.shareToFriend', '分享给好友'),
      tCopyShareText: i18n.t('share.copyShareText', '复制分享文案'),
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

    const first = new Date(year, monthIdx, 1);
    const dow = first.getDay();
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

    if (this.data.selectedKey) {
      this.refreshSelectedDay(this.data.selectedKey);
    }
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
    this.refreshSelectedDay(key);
  },

  refreshSelectedDay(key) {
    const checkins = storage.getCheckins();
    const list = checkins[key] || [];
    const allHabits = storage.getHabits();
    const habitMap = {};
    allHabits.forEach(h => {
      habitMap[h.id] = {
        id: h.id,
        name: h.nameKey ? i18n.t(h.nameKey) : (h.name || h.cardTitle),
        character: h.character || 'medal'
      };
    });

    const parts = key.split('-');
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const lang = i18n.getLanguage();
    const label = lang === 'zh' ? `${monthIdx + 1}月${day}日` : `${EN_MONTHS[monthIdx]} ${day}`;

    const selectedHabits = list.map(id => habitMap[id] || { id, name: id, character: 'medal' });

    this.setData({
      selectedKey: key,
      selectedLabel: label,
      selectedHabits
    });
  },

  onOpenPosterModal() {
    const tabbar = this.getTabBar && this.getTabBar();
    if (tabbar && tabbar.setHidden) tabbar.setHidden(true);
    this.setData({
      showPosterModal: true,
      posterImageUrl: '',
      posterLoading: true
    });
    setTimeout(() => {
      this.drawWeekPoster();
    }, 100);
  },

  onClosePosterModal() {
    const tabbar = this.getTabBar && this.getTabBar();
    if (tabbar && tabbar.setHidden) tabbar.setHidden(false);
    this.setData({ showPosterModal: false });
  },

  drawWeekPoster() {
    const profile = storage.getProfile();
    const summary = storage.getWeekSummary(this.data.weekOffset);
    const allHabits = storage.getHabits();
    const habitMap = {};
    allHabits.forEach(h => { habitMap[h.id] = h; });

    const lang = i18n.getLanguage();
    const dayLabelsZh = ['一', '二', '三', '四', '五', '六', '日'];
    const dayLabelsEn = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const dayLabels = lang === 'zh' ? dayLabelsZh : dayLabelsEn;

    // Convert summary bars with localized day labels
    const bars = (summary.bars || []).map((b, idx) => ({
      ...b,
      day: dayLabels[idx] || b.day
    }));

    // Rank habits by real completions this week
    let topHabits = [];
    if (summary.habitRank && summary.habitRank.length > 0) {
      topHabits = summary.habitRank.slice(0, 3).map(item => {
        const h = habitMap[item.id] || {};
        const name = h.nameKey ? i18n.t(h.nameKey) : (h.name || h.cardTitle || item.id);
        const sub = h.cardSubKey ? i18n.t(h.cardSubKey) : (h.cardSub || h.sub || '');
        return {
          id: item.id,
          name,
          sub,
          count: item.count,
          amount: `${item.count} ${lang === 'zh' ? '次' : 'times'}`
        };
      });
    }

    // Fallback if user hasn't checked in yet this week: show pinned habits
    if (topHabits.length === 0) {
      topHabits = allHabits.filter(h => h.isPrimary).slice(0, 3).map(h => ({
        id: h.id,
        name: h.nameKey ? i18n.t(h.nameKey) : (h.name || h.cardTitle),
        sub: h.cardSubKey ? i18n.t(h.cardSubKey) : (h.cardSub || h.sub || ''),
        count: 0,
        amount: lang === 'zh' ? '本周开启中' : 'In progress'
      }));
    }

    wx.createSelectorQuery().in(this)
      .select('#weekShareCanvas')
      .fields({ node: true, size: true })
      .exec(res => {
        if (res && res[0] && res[0].node) {
          const canvas = res[0].node;
          poster.renderPoster(canvas, {
            type: 'week',
            tag: 'EGOHABITS / WEEKLY REPORT',
            title: i18n.t('share.weekTitle', 'Weekly Growth Report'),
            rhythmTitle: '7-Day Rhythm',
            topHabitsTitle: 'Top Habits',
            nickname: profile.nickname || 'Avery',
            dateStr: this.data.tDateRange,
            bars,
            total: summary.total || 0,
            restCount: summary.restCount || 0,
            moveCount: summary.moveCount || 0,
            restLabel: 'Rest',
            moveFocusLabel: 'Focus & Move',
            noCheckinsYet: lang === 'zh' ? '本周开启中' : 'In progress',
            habits: topHabits,
            streakText: `${summary.total || 0} ${lang === 'zh' ? '次微习惯达成' : 'habits completed'}`
          });

          poster.exportPosterImage(canvas)
            .then(tempFilePath => {
              this.setData({
                posterImageUrl: tempFilePath,
                posterLoading: false
              });
            })
            .catch(err => {
              console.error('[week] exportPosterImage failed:', err);
              this.setData({ posterLoading: false });
            });
        } else {
          this.setData({ posterLoading: false });
        }
      });
  },

  onSavePosterToAlbum() {
    if (!this.data.posterImageUrl) {
      wx.showToast({
        title: this.data.tSavingPoster || '正在生成海报...',
        icon: 'none'
      });
      return;
    }
    this.setData({ posterSaving: true });
    poster.saveImageToAlbum(this.data.posterImageUrl)
      .then(() => {
        const tabbar = this.getTabBar && this.getTabBar();
        if (tabbar && tabbar.setHidden) tabbar.setHidden(false);
        this.setData({ posterSaving: false, showPosterModal: false });
        wx.showToast({
          title: i18n.t('share.saved', 'Saved to photo album!'),
          icon: 'success'
        });
      })
      .catch((err) => {
        this.setData({ posterSaving: false });
      });
  },

  onCopyShareText() {
    const profile = storage.getProfile();
    const name = profile.nickname || 'Avery';
    const summary = storage.getWeekSummary(this.data.weekOffset);
    const lang = i18n.getLanguage();

    const text = lang === 'zh'
      ? `【EgoHabits 本周生活微步周报】\n记录者：${name}\n周期：${this.data.tDateRange}\n本周达成 ${summary.total} 次微习惯，慢慢成长，按自己的节奏从容前行。`
      : `[EgoHabits Weekly Growth Report]\nName: ${name}\nPeriod: ${this.data.tDateRange}\nAchieved ${summary.total} gentle habits this week. Small habits. Room to grow.`;

    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({
          title: lang === 'zh' ? '周报文案已复制' : 'Copied to clipboard',
          icon: 'success',
          duration: 1500
        });
      }
    });
  },

  onShareAppMessage() {
    const profile = storage.getProfile();
    const summary = storage.getWeekSummary(this.data.weekOffset);
    const name = profile.nickname || 'Avery';
    const title = i18n.getLanguage() === 'zh'
      ? `${name} 本周已达成 ${summary.total} 次生活微步，邀你一起从容成长`
      : `${name} completed ${summary.total} gentle habits this week on EgoHabits`;
    return {
      title,
      path: '/pages/index/index?from=week_share',
      imageUrl: this.data.posterImageUrl || ''
    };
  },

  onShareTimeline() {
    const summary = storage.getWeekSummary(this.data.weekOffset);
    const title = i18n.getLanguage() === 'zh'
      ? `这一周，悄悄成长。已达成 ${summary.total} 个生活微步`
      : `Room to grow. ${summary.total} gentle habits completed this week`;
    return {
      title,
      query: 'from=timeline',
      imageUrl: this.data.posterImageUrl || ''
    };
  },

  preventProp() {}
});
