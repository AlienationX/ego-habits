/**
 * EgoHabits - Internationalization (i18n) Engine
 */
const en = require('../locales/en.js');
const zh = require('../locales/zh.js');

const STORAGE_LANG_KEY = 'egohabits_lang';
const listeners = [];

// User preference: 'auto' (follow system) | 'en' | 'zh'
let langPreference = 'auto';
let currentLang = 'en';

// Resolve the preference to a concrete language.
// 'auto' follows the system language (zh* -> zh, otherwise en).
function resolveLang(pref) {
  if (pref === 'en' || pref === 'zh') return pref;
  try {
    let lang = '';
    if (wx.getAppBaseInfo) {
      lang = wx.getAppBaseInfo().language || '';
    }
    return lang.startsWith('zh') ? 'zh' : 'en';
  } catch (e) {
    return 'en';
  }
}

try {
  const saved = wx.getStorageSync(STORAGE_LANG_KEY);
  if (saved === 'zh' || saved === 'en' || saved === 'auto') {
    langPreference = saved;
  }
} catch (e) {}

currentLang = resolveLang(langPreference);

function getDictionary() {
  return currentLang === 'zh' ? zh : en;
}

function t(path, fallback) {
  if (!path) return fallback !== undefined ? fallback : path;
  const dict = getDictionary();
  const keys = path.split('.');
  let curr = dict;
  for (const k of keys) {
    if (curr && typeof curr === 'object' && k in curr) {
      curr = curr[k];
    } else {
      // Explicit '' fallback means "missing -> empty"; otherwise echo the
      // path so missing keys stay visible during development.
      return fallback !== undefined ? fallback : path;
    }
  }
  return curr;
}

function getLanguage() {
  return currentLang;
}

function getLanguagePreference() {
  return langPreference;
}

function setLanguage(lang) {
  if (lang !== 'en' && lang !== 'zh' && lang !== 'auto') return;
  langPreference = lang;
  currentLang = resolveLang(lang);
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
  getLanguagePreference,
  setLanguage,
  onLanguageChange,
  getDictionary
};
