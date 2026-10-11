// pages/you/you.js
Page({
  onLoad() {
    wx.reLaunch({
      url: '/pages/index/index?tab=you'
    });
  }
});
