// pages/habits/habits.js
Page({
  onLoad() {
    wx.reLaunch({
      url: '/pages/index/index?tab=habits'
    });
  }
});
