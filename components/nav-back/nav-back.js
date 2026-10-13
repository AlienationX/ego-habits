// components/nav-back/nav-back.js - Circular back button for sub-pages
Component({
  methods: {
    onBack() {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        wx.navigateBack({ delta: 1 });
      } else {
        // Direct entry (share / scan): fall back to the Today tab
        wx.switchTab({ url: '/pages/index/index' });
      }
    }
  }
});
