// app.js
const i18n = require('./utils/i18n.js');
const storage = require('./utils/storage.js');

App({
  onLaunch() {
    this.initTheme();
  },

  // Theme-change pub/sub: pages subscribe here so they can re-render
  // their `themeClass` when the resolved theme changes (e.g. "auto" mode
  // following the system theme while the app is in the foreground).
  themeListeners: [],

  onThemeChange(fn) {
    if (typeof fn === 'function') this.themeListeners.push(fn);
    return () => {
      const idx = this.themeListeners.indexOf(fn);
      if (idx > -1) this.themeListeners.splice(idx, 1);
    };
  },

  _notifyThemeChange() {
    const theme = this.globalData.theme;

    // Explicit subscribers (e.g. components) still get notified.
    this.themeListeners.forEach(fn => {
      try { fn(theme); } catch (e) {}
    });

    // Global refresh: push the theme to every live page. Pages only need to
    // expose an `updateTheme(theme)` method — no per-page subscribe/unsubscribe.
    const pages = getCurrentPages();
    pages.forEach(page => {
      if (page && typeof page.updateTheme === 'function') {
        page.updateTheme(theme);
      }
    });
  },

  initTheme() {
    const savedTheme = storage.getTheme();
    this.applyTheme(savedTheme);

    // Listen to system theme change
    if (wx.onThemeChange) {
      wx.onThemeChange(res => {
        const currentPref = storage.getTheme();
        // In "auto" the resolved theme follows the system; otherwise re-assert
        // the manual theme so the status bar color stays correct after the
        // system re-applies the theme.json variables.
        this.applyTheme(currentPref, res.theme);
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

    // Keep the status bar (time/battery/signal) readable across themes.
    // With `navigationStyle: "custom"` the page content runs beneath the
    // status bar, so its text color must be flipped when the theme changes.
    this.applyStatusBar(resolvedTheme);

    this._notifyThemeChange();
  },

  // Explicitly set the status-bar foreground color for the CURRENT page.
  // `wx.setNavigationBarColor` only affects the page that calls it, so every
  // tab page must call this in its `updateTheme` (via onShow) as well — the
  // `@navTxtStyle` variable in theme.json is unreliable with `navigationStyle:
  // "custom"` on device, which leaves some tabs with black text in dark mode.
  applyStatusBar(theme) {
    if (!wx.setNavigationBarColor) return;
    const isDark = theme === 'dark';
    wx.setNavigationBarColor({
      frontColor: isDark ? '#ffffff' : '#000000',
      backgroundColor: isDark ? '#171917' : '#F6F5EE'
    });
  },

  globalData: {
    theme: 'light',
    themePreference: 'auto',
    tabIndex: 0
  }
});
