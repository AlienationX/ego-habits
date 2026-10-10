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

      // Navigate
      wx.reLaunch({
        url: path,
        fail: () => {
          wx.navigateTo({ url: path });
        }
      });
    }
  }
});
