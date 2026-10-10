// pages/index/index.js
const i18n = require('../../utils/i18n.js');
const storage = require('../../utils/storage.js');

Page({
  data: {
    themeClass: '',
    dateString: '',
    tGreeting: '',
    tHeroTitle: '',
    tHeroSub: '',
    tGetStarted: '',
    tSectionTitle: '',
    todayHabits: []
  },

  onLoad() {
    this.updateTheme();
    this.updateContent();

    // Listen to language changes
    this.unsubI18n = i18n.onLanguageChange(() => {
      this.updateContent();
    });

    // Listen to habit completion changes
    this.unsubHabits = storage.onHabitChange(() => {
      this.loadHabits();
    });
  },

  onShow() {
    this.updateTheme();
    this.loadHabits();
  },

  onUnload() {
    if (this.unsubI18n) this.unsubI18n();
    if (this.unsubHabits) this.unsubHabits();
  },

  updateTheme() {
    const app = getApp();
    const theme = (app && app.globalData.theme) || 'light';
    this.setData({
      themeClass: `theme-${theme}`
    });
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

  updateContent() {
    this.setData({
      dateString: this.formatDateHeader(),
      tGreeting: i18n.t('today.greeting'),
      tHeroTitle: i18n.t('today.heroTitle'),
      tHeroSub: i18n.t('today.heroSub'),
      tGetStarted: i18n.t('today.getStarted'),
      tSectionTitle: i18n.t('today.sectionTitle')
    });
    this.loadHabits();
  },

  loadHabits() {
    const allHabits = storage.getHabits();
    // The top 3 primary habits on Today screen
    const primary = allHabits.slice(0, 3);
    const todayHabits = primary.map(h => ({
      id: h.id,
      title: i18n.t(h.cardTitleKey),
      sub: i18n.t(h.cardSubKey),
      character: h.character,
      tint: h.tint,
      completed: storage.isHabitCompletedToday(h.id)
    }));

    this.setData({ todayHabits });
  },

  onGetStarted() {
    wx.reLaunch({
      url: '/pages/habits/habits',
      fail: () => {
        wx.navigateTo({ url: '/pages/habits/habits' });
      }
    });
  },

  onOpenHabit(e) {
    const habitId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/habit-detail/habit-detail?id=${habitId}`
    });
  }
});
