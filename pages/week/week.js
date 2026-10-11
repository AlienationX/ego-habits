// pages/week/week.js
Page({
  onLoad() {
    wx.reLaunch({
      url: '/pages/index/index?tab=week'
    });
  }
});
