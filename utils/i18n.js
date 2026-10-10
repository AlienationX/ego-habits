/**
 * EgoHabits - Internationalization (i18n) Engine
 */
const en = require('../locales/en.js');
const zh = require('../locales/zh.js');

const STORAGE_LANG_KEY = 'egohabits_lang';
const listeners = [];

let currentLang = 'en';

try {
  const saved = wx.getStorageSync(STORAGE_LANG_KEY);
  if (saved === 'zh' || saved === 'en') {
    currentLang = saved;
  } else {
    // Check system language
    const sys = wx.getSystemInfoSync();
    if (sys.language && sys.language.startsWith('zh')) {
      currentLang = 'zh';
    }
  }
} catch (e) {
  currentLang = 'en';
}

function getDictionary() {
  return currentLang === 'zh' ? zh : en;
}

function t(path, fallback = '') {
  if (!path) return fallback;
  const dict = getDictionary();
  const keys = path.split('.');
  let curr = dict;
  for (const k of keys) {
    if (curr && typeof curr === 'object' && k in curr) {
      curr = curr[k];
    } else {
      return fallback || path;
    }
  }
  return curr;
}

function getLanguage() {
  return currentLang;
}

function setLanguage(lang) {
  if (lang !== 'en' && lang !== 'zh') return;
  currentLang = lang;
  try {
    wx.setStorageSync(STORAGE_LANG_KEY, lang);
  } catch (e) {}
  // Notify listeners
  listeners.forEach(fn => {
    try { fn(currentLang); } catch (err) {}
  });
}

function onLanguageChange(fn) {
  if (typeof fn === 'function') {
    listeners.push(fn);
  }
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx > -1) listeners.splice(idx, 1);
  };
}

module.exports = {
  t,
  getLanguage,
  setLanguage,
  onLanguageChange,
  getDictionary
};
