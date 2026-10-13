// custom-tab-bar/index.js - Floating Pill Tab Bar (native custom tabBar)
const i18n = require('../utils/i18n.js');

Component({
  data: {
    selected: 0,
    theme: 'light',
    hidden: false,
    tabs: []
  },

  lifetimes: {
    attached() {
      const app = getApp();
      this.setData({ theme: (app && app.globalData.theme) || 'light' });
      this.updateTabs();

      if (app && app.onThemeChange) {
        this.unsubTheme = app.onThemeChange(theme => {
          this.setData({ theme });
        });
      }
      this.unsubI18n = i18n.onLanguageChange(() => {
        this.updateTabs();
      });
    },

    detached() {
      if (this.unsubTheme) this.unsubTheme();
      if (this.unsubI18n) this.unsubI18n();
    }
  },

  methods: {
    updateTabs() {
      this.setData({
        tabs: [
          { key: 'today', icon: 'home', label: i18n.t('tabs.today', 'Today'), path: '/pages/index/index' },
          { key: 'habits', icon: 'grid', label: i18n.t('tabs.habits', 'Habits'), path: '/pages/habits/habits' },
          { key: 'week', icon: 'chart', label: i18n.t('tabs.week', 'Week'), path: '/pages/week/week' },
          { key: 'you', icon: 'user', label: i18n.t('tabs.you', 'You'), path: '/pages/you/you' }
        ]
      });
    },

    // Called by each tab page in onShow to highlight the active tab
    setSelected(index) {
      if (this.data.selected !== index) {
        this.setData({ selected: index });
      }
    },

    // Hide/show the bar (e.g. while a bottom-sheet modal is open)
    setHidden(hidden) {
      this.setData({ hidden: !!hidden });
    },

    onTabSelect(e) {
      const index = e.currentTarget.dataset.index;
      const path = e.currentTarget.dataset.path;
      if (index === this.data.selected) return;

      // Instant visual feedback; the target page's onShow re-syncs anyway
      this.setData({ selected: index });
      wx.switchTab({ url: path });
    }
  }
});
