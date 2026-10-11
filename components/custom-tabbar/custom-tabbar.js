const i18n = require('../../utils/i18n.js');

Component({
  properties: {
    current: {
      type: String,
      value: 'today'
    }
  },

  data: {
    tabs: []
  },

  lifetimes: {
    attached() {
      this.updateTabs();
      this.unsubI18n = i18n.onLanguageChange(() => {
        this.updateTabs();
      });
    },

    detached() {
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

    onTabSelect(e) {
      const { key, path } = e.currentTarget.dataset;
      if (key === this.properties.current) return;

      const app = getApp();
      if (app) app.globalData.currentTab = key;

      // Always trigger tabchange event for container page (0ms switch, zero white screen)
      this.triggerEvent('tabchange', { key, path });

      // If called from a sub-page, navigate back to index with tab param
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      if (currentPage && currentPage.route !== 'pages/index/index') {
        wx.reLaunch({
          url: `/pages/index/index?tab=${key}`
        });
      }
    }
  }
});
