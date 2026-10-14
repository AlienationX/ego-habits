// pages/index/index.js - Today Tab (native tabBar page #0)
const i18n = require('../../utils/i18n.js');
const storage = require('../../utils/storage.js');

const TAB_INDEX = 0;

Page({
  data: {
    themeClass: '',

    dateString: '',
    tGreeting: '',
    tHeroTitle: '',
    tHeroSub: '',
    tGetStarted: '',
    tSectionTitle: '',
    todayHabits: [],
    availableHabits: [],
    showManageModal: false,
    tManageModalTitle: '',
    tManageModalSub: '',
    tPinnedSectionTitle: '',
    tAvailableSectionTitle: '',
    tUnpin: '',
    tPin: '',
    tDone: ''
  },

  onLoad() {
    this.updateTheme();
    this.loadTodayData();

    if (wx.showShareMenu) {
      wx.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
      });
    }

    this.unsubI18n = i18n.onLanguageChange(() => {
      this.loadTodayData();
    });

    this.unsubHabits = storage.onHabitChange(() => {
      this.loadTodayHabits();
    });
  },

  onShow() {
    this.updateTheme();
    this.syncTabBar();
    this.loadTodayHabits();
  },

  onUnload() {
    if (this.unsubI18n) this.unsubI18n();
    if (this.unsubHabits) this.unsubHabits();
  },

  // Highlight this tab in the custom tab bar (one instance per page)
  syncTabBar() {
    const tabBar = this.getTabBar && this.getTabBar();
    if (tabBar && tabBar.setSelected) tabBar.setSelected(TAB_INDEX);
  },

  updateTheme(theme) {
    const app = getApp();
    if (!theme) {
      theme = (app && app.globalData.theme) || 'light';
    }
    this.setData({
      themeClass: `theme-${theme}`
    });
    if (app && app.applyStatusBar) app.applyStatusBar(theme);
  },

  formatDateHeader() {
    const lang = i18n.getLanguage();
    const d = new Date();
    if (lang === 'zh') {
      const month = d.getMonth() + 1;
      const day = d.getDate();
      const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      return `EGOHABITS / ${month}月${day}日 ${weekDays[d.getDay()]}`;
    } else {
      const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
      const weekDays = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      return `EGOHABITS / ${weekDays[d.getDay()]}, ${months[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}`;
    }
  },

  loadTodayData() {
    this.setData({
      dateString: this.formatDateHeader(),
      tGreeting: i18n.t('today.greeting'),
      tHeroTitle: i18n.t('today.heroTitle'),
      tHeroSub: i18n.t('today.heroSub'),
      tGetStarted: i18n.t('today.getStarted'),
      tSectionTitle: i18n.t('today.sectionTitle'),
      tManage: i18n.t('today.manage', '管理今日'),
      tManageModalTitle: i18n.t('today.manageModalTitle', '管理今日微习惯'),
      tManageModalSub: i18n.t('today.manageModalSub', '从容专注：建议保留 1~4 件小事'),
      tPinnedSectionTitle: i18n.t('today.pinnedSectionTitle', '已在今日的微习惯'),
      tAvailableSectionTitle: i18n.t('today.availableSectionTitle', '习惯库其他微习惯'),
      tUnpin: i18n.t('today.unpin', '移出'),
      tPin: i18n.t('today.pin', '加入今日'),
      tDone: i18n.t('today.done', '完成')
    });
    this.loadTodayHabits();
  },

  loadTodayHabits() {
    const all = storage.getHabits();
    const formatHabit = (h) => {
      const last = storage.getLastCheckin(h.id);
      const amountStr = (last && last.amount) || h.metricAmount || h.amount || '';
      const parsed = storage.parseAmount(amountStr);
      const unitLabel = parsed.unit ? i18n.t(`units.${parsed.unit}`, parsed.unit) : '';
      const amountText = parsed.unit ? `${parsed.value} ${unitLabel}` : amountStr;

      let title = h.nameKey ? i18n.t(h.cardTitleKey || h.nameKey) : (h.cardTitle || h.name);
      
      // Determine tagline (小标题内容)
      let tagline = '';
      if (typeof h.sub === 'string' && h.sub.trim()) {
        tagline = h.sub.trim();
      } else {
        const rawSub = h.cardSubKey ? i18n.t(h.cardSubKey) : (h.cardSub || '');
        const sepIndex = rawSub ? rawSub.indexOf(' · ') : -1;
        if (sepIndex > -1) {
          tagline = rawSub.slice(sepIndex + 3).trim();
        }
      }
      const sub = tagline ? `${amountText} · ${tagline}` : amountText;

      return {
        id: h.id,
        title,
        sub,
        character: h.character || 'medal',
        tint: h.tint || 'sage',
        isPrimary: !!h.isPrimary,
        completed: storage.isHabitCompletedToday(h.id)
      };
    };

    const formattedAll = all.map(formatHabit);
    const todayHabits = formattedAll.filter(h => h.isPrimary);
    const availableHabits = formattedAll.filter(h => !h.isPrimary);

    this.setData({ todayHabits, availableHabits });
  },

  onGetStarted() {
    wx.switchTab({ url: '/pages/habits/habits' });
  },

  onManageHabits() {
    this.loadTodayHabits();
    this.toggleTabBar(true);
    this.setData({ showManageModal: true });
  },

  onCloseManageModal() {
    this.toggleTabBar(false);
    this.setData({ showManageModal: false });
    this.loadTodayHabits();
  },

  onTogglePinFromModal(e) {
    const habitId = e.currentTarget.dataset.id;
    const ok = storage.togglePinHabit(habitId);
    if (!ok) {
      const isPinned = this.data.todayHabits.some(h => h.id === habitId);
      wx.showToast({
        title: isPinned 
          ? i18n.t('today.minLimitToast', '至少保留 1 个今日习惯') 
          : i18n.t('today.maxLimitToast', '建议今日最多保留 4 个习惯'),
        icon: 'none'
      });
      return;
    }
    this.loadTodayHabits();
  },

  toggleTabBar(hidden) {
    const tabBar = this.getTabBar && this.getTabBar();
    if (tabBar && tabBar.setHidden) tabBar.setHidden(hidden);
  },

  preventProp() {},

  onOpenHabit(e) {
    const habitId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/habit-detail/habit-detail?id=${habitId}`
    });
  },

  onShareAppMessage() {
    const profile = storage.getProfile();
    const name = profile.nickname || 'Avery';
    const title = i18n.getLanguage() === 'zh'
      ? `${name} 邀你一起开启生活微习惯，从容过好每一天`
      : `${name} invites you to cultivate gentle micro-habits together on EgoHabits`;
    return {
      title,
      path: '/pages/index/index?from=app_share'
    };
  },

  onShareTimeline() {
    const title = i18n.getLanguage() === 'zh'
      ? 'EgoHabits · 为生活做一点小习惯，从容向前'
      : 'EgoHabits · Small habits. Room to grow.';
    return {
      title,
      query: 'from=timeline'
    };
  }
});
