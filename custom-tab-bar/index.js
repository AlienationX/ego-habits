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
      // Read the shared selection up-front so the freshly-created tab bar
      // renders the correct active tab immediately (no "flash" to index).
      this.setData({
        theme: (app && app.globalData.theme) || 'light',
        selected: (app && app.globalData.tabIndex) || 0,
        tabs: this.buildTabs()
      });

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
    buildTabs() {
      return [
        { key: 'today', icon: 'home', label: i18n.t('tabs.today', 'Today'), path: '/pages/index/index' },
        { key: 'habits', icon: 'grid', label: i18n.t('tabs.habits', 'Habits'), path: '/pages/habits/habits' },
        { key: 'week', icon: 'chart', label: i18n.t('tabs.week', 'Week'), path: '/pages/week/week' },
        { key: 'you', icon: 'user', label: i18n.t('tabs.you', 'You'), path: '/pages/you/you' }
      ];
    },

    updateTabs() {
      this.setData({ tabs: this.buildTabs() });
    },

    // Called by each tab page in onShow to highlight the active tab
    setSelected(index) {
      const app = getApp();
      if (app) app.globalData.tabIndex = index;
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

      // Persist the selection so the target page's new tab-bar instance
      // can render the active tab directly, avoiding an icon flash.
      const app = getApp();
      if (app) app.globalData.tabIndex = index;

      this.setData({ selected: index });
      wx.switchTab({ url: path });
    }
  }
});
