// app.js
const i18n = require('./utils/i18n.js');
const storage = require('./utils/storage.js');

App({
  onLaunch() {
    this.initTheme();
  },

  initTheme() {
    const savedTheme = storage.getTheme();
    this.applyTheme(savedTheme);

    // Listen to system theme change
    if (wx.onThemeChange) {
      wx.onThemeChange(res => {
        const currentPref = storage.getTheme();
        if (currentPref === 'auto') {
          this.applyTheme('auto', res.theme);
        }
      });
    }
  },

  applyTheme(pref, systemTheme) {
    let sysTheme = systemTheme;
    if (!sysTheme && wx.getAppBaseInfo) {
      sysTheme = wx.getAppBaseInfo().theme;
    }
    const resolvedTheme = pref === 'auto' ? (sysTheme === 'dark' ? 'dark' : 'light') : pref;
    this.globalData.theme = resolvedTheme;
    this.globalData.themePreference = pref;
  },

  globalData: {
    theme: 'light',
    themePreference: 'auto',
    currentTab: 'today'
  }
});
