// pages/habits/habits.js - Habits Library Tab (native tabBar page #1)
const i18n = require('../../utils/i18n.js');
const storage = require('../../utils/storage.js');

const TAB_INDEX = 1;

const AVAILABLE_CHARACTERS = [
  'medal', 'avatar', 'guide', 'water', 'shoe', 'book', 'pillow', 'hourglass', 'cloud', 'celebrate'
];

const AVAILABLE_TINTS = ['sage', 'mint', 'blue', 'cream'];

Page({
  data: {
    themeClass: '',

    tLibraryTitle: '',
    tLibraryHeadline: '',
    tAddHabit: '',
    currentCategory: 'all',
    categories: [],
    allHabits: [],
    filteredHabits: [],

    // Create Modal
    showCreateModal: false,
    newHabitName: '',
    newHabitSub: '',
    newHabitAmount: '10 min',
    newCategory: 'focus',
    newCharacter: 'medal',
    newTint: 'sage',
    newPinToToday: true,
    availableCharacters: AVAILABLE_CHARACTERS,
    availableTints: AVAILABLE_TINTS,

    // Modal translations
    tCreateTitle: '',
    tNameLabel: '',
    tNamePlaceholder: '',
    tSubLabel: '',
    tSubPlaceholder: '',
    tAmountLabel: '',
    tAmountPlaceholder: '',
    tCategoryLabel: '',
    tCharacterLabel: '',
    tTintLabel: '',
    tPinLabel: '',
    tPinHint: '',
    tCreateBtn: '',
    tCancel: ''
  },

  onLoad() {
    this.updateTheme();
    this.loadHabitsLibraryData();

    this.unsubI18n = i18n.onLanguageChange(() => {
      this.loadHabitsLibraryData();
    });

    this.unsubHabits = storage.onHabitChange(() => {
      this.loadHabitsLibraryData();
    });
  },

  onShow() {
    this.updateTheme();
    this.syncTabBar();
    this.loadHabitsLibraryData();
    if (this.data.showCreateModal) {
      this.toggleTabBar(true);
    }
  },

  onHide() {
    this.toggleTabBar(false);
  },

  onUnload() {
    this.toggleTabBar(false);
    if (this.unsubI18n) this.unsubI18n();
    if (this.unsubHabits) this.unsubHabits();
  },

  syncTabBar() {
    const tabBar = this.getTabBar && this.getTabBar();
    if (tabBar && tabBar.setSelected) tabBar.setSelected(TAB_INDEX);
  },

  updateTheme(theme) {
    const app = getApp();
    if (!theme) {
      theme = (app && app.globalData.theme) || 'light';
    }
    this.setData({ themeClass: `theme-${theme}` });
    if (app && app.applyStatusBar) app.applyStatusBar(theme);
  },

  loadHabitsLibraryData() {
    const categories = [
      { key: 'all', label: i18n.t('habits.filterAll') },
      { key: 'move', label: i18n.t('habits.filterMove') },
      { key: 'rest', label: i18n.t('habits.filterRest') },
      { key: 'focus', label: i18n.t('habits.filterFocus') }
    ];

    const rawList = storage.getHabits();
    const allHabits = rawList.map(h => {
      const last = storage.getLastCheckin(h.id);
      let amount = h.amountKey ? i18n.t(h.amountKey) : (h.amount || h.metricAmount);
      if (last && last.amount) {
        const parsed = storage.parseAmount(last.amount);
        const unitLabel = parsed.unit ? i18n.t(`units.${parsed.unit}`, parsed.unit) : '';
        amount = parsed.unit ? `${parsed.value} ${unitLabel}` : last.amount;
      }
      const name = h.nameKey ? i18n.t(h.nameKey) : (h.name || h.cardTitle);
      return {
        ...h,
        name,
        amount,
        isPrimary: !!h.isPrimary
      };
    });

    this.setData({
      tLibraryTitle: i18n.t('habits.libraryTitle'),
      tLibraryHeadline: i18n.t('habits.libraryHeadline'),
      tAddHabit: i18n.t('custom.addHabitBtn', '+ Add'),

      tCreateTitle: i18n.t('custom.createTitle'),
      tNameLabel: i18n.t('custom.nameLabel'),
      tNamePlaceholder: i18n.t('custom.namePlaceholder'),
      tSubLabel: i18n.t('custom.subLabel', '小标题'),
      tSubPlaceholder: i18n.t('custom.subPlaceholder', '例如：随时随地，不慌不忙 / 属于故事的宁静时刻'),
      tAmountLabel: i18n.t('custom.amountLabel'),
      tAmountPlaceholder: i18n.t('custom.amountPlaceholder'),
      tCategoryLabel: i18n.t('custom.categoryLabel'),
      tCharacterLabel: i18n.t('custom.characterLabel'),
      tTintLabel: i18n.t('custom.tintLabel'),
      tPinLabel: i18n.t('custom.pinLabel'),
      tPinHint: i18n.t('custom.pinHint'),
      tCreateBtn: i18n.t('custom.createBtn'),
      tCancel: i18n.t('common.cancel'),

      categories,
      allHabits
    });
    this.applyCategoryFilter();
  },

  onSelectCategory(e) {
    const category = e.currentTarget.dataset.key;
    this.setData({ currentCategory: category });
    this.applyCategoryFilter();
  },

  applyCategoryFilter() {
    const cat = this.data.currentCategory;
    if (cat === 'all') {
      this.setData({ filteredHabits: this.data.allHabits });
    } else {
      const filtered = this.data.allHabits.filter(h => h.category === cat);
      this.setData({ filteredHabits: filtered });
    }
  },

  onSelectHabit(e) {
    const habitId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/habit-detail/habit-detail?id=${habitId}`
    });
  },

  // Open Modal to create new habit
  onOpenCreateModal() {
    this.toggleTabBar(true);
    this.setData({
      showCreateModal: true,
      newHabitName: '',
      newHabitSub: '',
      newHabitAmount: '10 min',
      newCategory: 'focus',
      newCharacter: 'medal',
      newTint: 'sage',
      newPinToToday: true
    });
  },

  onCloseCreateModal() {
    this.toggleTabBar(false);
    this.setData({ showCreateModal: false });
  },

  onInputName(e) {
    this.setData({ newHabitName: e.detail.value });
  },

  onInputSub(e) {
    this.setData({ newHabitSub: e.detail.value });
  },

  onInputAmount(e) {
    this.setData({ newHabitAmount: e.detail.value });
  },

  onPickCategory(e) {
    this.setData({ newCategory: e.currentTarget.dataset.cat });
  },

  onPickCharacter(e) {
    this.setData({ newCharacter: e.currentTarget.dataset.char });
  },

  onPickTint(e) {
    this.setData({ newTint: e.currentTarget.dataset.tint });
  },

  onToggleNewPin() {
    this.setData({ newPinToToday: !this.data.newPinToToday });
  },

  onSubmitCreateHabit() {
    const name = (this.data.newHabitName || '').trim();
    if (!name) {
      wx.showToast({
        title: i18n.t('custom.namePlaceholder', 'Please enter habit name'),
        icon: 'none'
      });
      return;
    }

    storage.addCustomHabit({
      name,
      sub: (this.data.newHabitSub || '').trim(),
      amount: (this.data.newHabitAmount || '').trim() || '10 min',
      category: this.data.newCategory,
      character: this.data.newCharacter,
      tint: this.data.newTint,
      isPrimary: this.data.newPinToToday
    });

    try {
      if (wx.vibrateShort) wx.vibrateShort({ type: 'medium' });
    } catch (e) {}

    this.toggleTabBar(false);

    this.setData({ showCreateModal: false });
    this.loadHabitsLibraryData();
    wx.showToast({
      title: i18n.t('common.save', 'Saved!'),
      icon: 'success'
    });
  },

  toggleTabBar(hidden) {
    const tabBar = this.getTabBar && this.getTabBar();
    if (tabBar && tabBar.setHidden) tabBar.setHidden(hidden);
  },

  preventProp() {}
});
