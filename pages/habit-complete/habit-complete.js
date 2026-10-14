// pages/habit-complete/habit-complete.js
const i18n = require('../../utils/i18n.js');
const storage = require('../../utils/storage.js');
const poster = require('../../utils/poster.js');

// Wavy ribbon streamers (SVG assets in /assets/confetti/)
const CELEBRATION_STREAMERS = [
  { id: 's1', src: '/assets/confetti/ribbon-pink.svg', x: 4, y: 10, w: 48, h: 96, rot: 15, d: 0.1, dur: 3.0 },
  { id: 's2', src: '/assets/confetti/ribbon-cyan.svg', x: 86, y: 8, w: 46, h: 92, rot: -20, d: 0.4, dur: 3.4 },
  { id: 's3', src: '/assets/confetti/ribbon-yellow.svg', x: 10, y: 52, w: 44, h: 88, rot: 25, d: 0.7, dur: 2.8 },
  { id: 's4', src: '/assets/confetti/ribbon-pink.svg', x: 84, y: 58, w: 46, h: 92, rot: -15, d: 0.3, dur: 3.2 }
];

// Rich celebratory confetti pieces (rect, square, dot, star) inspired by attachments
const CELEBRATION_PIECES = [
  // Top canopy
  { id: 'p1', x: 8, y: 3, w: 18, h: 32, type: 'rect', color: '#FF5A5F', rot: 25, d: 0.1, dur: 2.6 },
  { id: 'p2', x: 22, y: 6, w: 16, h: 16, type: 'square', color: '#00C2CB', rot: -15, d: 0.4, dur: 2.9 },
  { id: 'p3', x: 36, y: 1, w: 22, h: 22, type: 'star', color: '#FFB800', rot: 10, d: 0.2, dur: 2.5 },
  { id: 'p4', x: 50, y: 5, w: 14, h: 14, type: 'dot', color: '#FF2D55', rot: 0, d: 0.6, dur: 3.1 },
  { id: 'p5', x: 68, y: 2, w: 22, h: 14, type: 'rect', color: '#00C2CB', rot: -30, d: 0.3, dur: 2.7 },
  { id: 'p6', x: 92, y: 5, w: 16, h: 16, type: 'square', color: '#FFB800', rot: 45, d: 0.7, dur: 3.3 },

  // Mid surrounding the badge
  { id: 'p7', x: 6, y: 26, w: 14, h: 14, type: 'dot', color: '#7952DE', rot: 0, d: 0.5, dur: 2.8 },
  { id: 'p8', x: 18, y: 20, w: 22, h: 14, type: 'rect', color: '#FF5A5F', rot: -20, d: 0.9, dur: 3.0 },
  { id: 'p9', x: 78, y: 22, w: 20, h: 20, type: 'star', color: '#FFB800', rot: 35, d: 0.3, dur: 2.4 },
  { id: 'p10', x: 92, y: 30, w: 16, h: 28, type: 'rect', color: '#00C2CB', rot: 15, d: 0.8, dur: 2.9 },

  // Flanking & around shield
  { id: 'p11', x: 12, y: 42, w: 22, h: 14, type: 'rect', color: '#FFB800', rot: 40, d: 0.2, dur: 3.2 },
  { id: 'p12', x: 22, y: 36, w: 14, h: 14, type: 'dot', color: '#4FA65A', rot: 0, d: 1.1, dur: 2.7 },
  { id: 'p13', x: 78, y: 40, w: 16, h: 16, type: 'square', color: '#FF2D55', rot: -25, d: 0.6, dur: 3.0 },
  { id: 'p14', x: 88, y: 46, w: 20, h: 20, type: 'star', color: '#00C2CB', rot: 10, d: 0.4, dur: 2.5 },

  // Lower field
  { id: 'p15', x: 14, y: 70, w: 18, h: 30, type: 'rect', color: '#7952DE', rot: -15, d: 0.7, dur: 2.8 },
  { id: 'p16', x: 28, y: 62, w: 14, h: 14, type: 'dot', color: '#FF5A5F', rot: 0, d: 1.0, dur: 3.1 },
  { id: 'p17', x: 72, y: 68, w: 22, h: 14, type: 'rect', color: '#4FA65A', rot: 30, d: 0.3, dur: 2.6 },
  { id: 'p18', x: 86, y: 74, w: 16, h: 16, type: 'square', color: '#FFB800', rot: -40, d: 0.9, dur: 3.2 }
];

// Fallback confetti layout for water's celebration
const CONFETTI_COLORS = ['var(--green)', 'var(--sage)', 'var(--blue)', 'var(--mint)', 'var(--cream)'];
const WATER_CONFETTI = [
  { x: 6, y: 16, w: 16, h: 30, shape: '', ci: 0, d: 0 },
  { x: 18, y: 6, w: 14, h: 14, shape: 'dot', ci: 2, d: 0.4 },
  { x: 30, y: 18, w: 20, h: 12, shape: '', ci: 1, d: 0.9 },
  { x: 46, y: 4, w: 16, h: 16, shape: 'dot', ci: 3, d: 0.2 },
  { x: 62, y: 14, w: 18, h: 32, shape: '', ci: 4, d: 1.1 },
  { x: 78, y: 6, w: 14, h: 14, shape: 'dot', ci: 0, d: 0.7 },
  { x: 88, y: 22, w: 20, h: 12, shape: '', ci: 2, d: 0.3 }
].map(c => ({ ...c, color: CONFETTI_COLORS[c.ci] }));

// Resolve per-habit copy with a common fallback chain:
function completeText(id, key) {
  const specific = i18n.t(`complete.${id}.${key}`, '');
  if (specific) return specific;
  return i18n.t(`complete.common.${key}`, '');
}

Page({
  data: {
    themeClass: '',
    habitId: 'water',
    isWater: true,

    // Habit Details
    habitName: '',
    habitCharacter: 'medal',
    metricAdded: '+250 ml',
    note: '',
    barAnimated: false,

    // Award Shield properties (Attachments 1 & 2)
    badgeMetricVal: '10',
    badgeMetricUnit: 'min',
    badgeSub: 'OUTSIDE',
    streakText: '',
    awardTitle: '',
    awardSub: '',

    // Dynamic celebration & interaction
    streamers: [],
    confettiPieces: [],
    waterConfetti: [],
    burstSparks: [],
    cheerCount: 0,
    badgePunched: false,
    cheerPillVisible: false,

    // Poster Modal
    showPosterModal: false,
    posterImageUrl: '',
    posterLoading: false,
    posterSaving: false,
    tSharePosterBtn: '',
    tSaveImage: '',
    tSavingPoster: '',
    tShareToFriend: '',
    tCopyShareText: '',

    // Localized strings
    tDone: '',
    tTapToCheer: '',
    tCheerPraise: '',
    tTag: '',
    tHeadline: '',
    tMetricLabel: '',
    tCardTitle: '',
    tCardSub: '',
    tBtnBack: '',
    tBtnViewWeek: '',
    tFooterText: ''
  },

  onLoad(options) {
    const habitId = options.id || 'water';
    this.setData({ habitId });
    this.updateTheme();
    this.loadContent();

    if (wx.showShareMenu) {
      wx.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
      });
    }

    this.unsubI18n = i18n.onLanguageChange(() => {
      this.loadContent();
    });

    // Trigger water progress bar animation after small delay
    setTimeout(() => {
      this.setData({ barAnimated: true });
    }, 150);
  },

  onShow() {
    this.updateTheme();
  },

  onUnload() {
    if (this.unsubI18n) this.unsubI18n();
    if (this.toastTimer) clearTimeout(this.toastTimer);
    if (this.punchTimer) clearTimeout(this.punchTimer);
  },

  updateTheme(theme) {
    if (!theme) {
      const app = getApp();
      theme = (app && app.globalData.theme) || 'light';
    }
    this.setData({ themeClass: `theme-${theme}` });
  },

  loadContent() {
    const allHabits = storage.getHabits();
    const habit = allHabits.find(h => h.id === this.data.habitId) || allHabits[0];
    const id = habit.id;
    const isWater = id === 'water';

    const last = storage.getLastCheckin(id);
    const amountStr = (last && last.amount) || habit.metricAmount || '';
    const parsed = storage.parseAmount(amountStr);
    const unitLabel = parsed.unit ? i18n.t(`units.${parsed.unit}`, parsed.unit) : '';

    const metricAdded = parsed.unit
      ? `+${parsed.value} ${unitLabel}`
      : (amountStr ? `+${amountStr}` : '+1');

    // Shield Metric display: e.g. "10km", "10 min", "5 pages" (Attachment 2)
    const badgeMetricVal = parsed.value ? `${parsed.value}` : (amountStr || '1');
    const badgeMetricUnit = unitLabel || (parsed.unit || '');

    // Profile & Streak info
    const profile = storage.getProfile();
    const nickname = profile.nickname || 'Avery';
    const stats = storage.getStats();
    const streak = stats.streak || 1;
    const streakText = streak > 1
      ? `${streak} ${i18n.t('complete.common.streakPill', 'Day Streak')}`
      : `${i18n.t('complete.common.goalCompletedPill', 'Goal Complete')}`;

    // Titles & personalized sub copy
    const awardTitle = completeText(id, 'awardTitle') || i18n.t('complete.common.awardBadgeTitle', 'New Award');
    const awardSubRaw = completeText(id, 'awardSub') || i18n.t('complete.common.awardSub', '');
    const awardSub = awardSubRaw.replace('{name}', nickname);

    // Habit uppercase tag or category on badge (e.g. RUNNING, OUTSIDE, READING)
    const badgeSub = completeText(id, 'badgeLabel') || (habit.category ? habit.category.toUpperCase() : 'AWARD');
    const habitName = i18n.t(habit.nameKey, habit.id);

    this.setData({
      isWater,
      habitName,
      habitCharacter: habit.character || 'medal',
      metricAdded,
      badgeMetricVal,
      badgeMetricUnit,
      badgeSub,
      streakText,
      awardTitle,
      awardSub,
      note: (last && last.note) || '',
      streamers: CELEBRATION_STREAMERS,
      confettiPieces: CELEBRATION_PIECES,
      waterConfetti: WATER_CONFETTI,

      tDone: i18n.t('complete.common.done', 'Done'),
      tTapToCheer: i18n.t('complete.common.tapToCheer', 'Tap badge to cheer!'),
      tCheerPraise: i18n.t('complete.common.cheerPraise', 'Way to go!'),
      tSharePosterBtn: i18n.t('share.posterBtn', '生成分享海报'),
      tSaveImage: i18n.t('share.saveImage', '保存海报到相册'),
      tSavingPoster: i18n.t('share.saving', '正在生成海报...'),
      tShareToFriend: i18n.t('share.shareToFriend', '分享给好友'),
      tCopyShareText: i18n.t('share.copyShareText', '复制分享文案'),

      // Fallback for water page
      tTag: completeText(id, 'tag'),
      tHeadline: completeText(id, 'headline'),
      tMetricLabel: completeText(id, 'metricLabel'),
      tCardTitle: completeText(id, 'cardTitle'),
      tCardSub: completeText(id, 'cardSub'),
      tBtnBack: completeText(id, 'btnBack'),
      tBtnViewWeek: completeText(id, 'btnViewWeek'),
      tFooterText: completeText(id, 'footerText')
    });
  },

  // Interactive tap celebration on the Award Badge
  onTapBadge() {
    // Tactile haptic feedback
    try {
      if (wx.vibrateShort) {
        wx.vibrateShort({ type: 'medium' });
      }
    } catch (e) {}

    const newCount = this.data.cheerCount + 1;
    const sparks = this.generateSparks();

    this.setData({
      badgePunched: true,
      cheerCount: newCount,
      cheerPillVisible: true,
      burstSparks: sparks
    });

    if (this.punchTimer) clearTimeout(this.punchTimer);
    this.punchTimer = setTimeout(() => {
      this.setData({ badgePunched: false });
    }, 400);

    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.setData({ cheerPillVisible: false, burstSparks: [] });
    }, 1200);
  },

  // Generate radial burst particles around the badge
  generateSparks() {
    const colors = ['#FF5A5F', '#00C2CB', '#FFB800', '#FF2D55', '#7952DE', '#4FA65A'];
    const sparks = [];
    const count = 12;
    for (let i = 0; i < count; i++) {
      const angle = (i * (360 / count) + (Math.random() * 20 - 10)) * (Math.PI / 180);
      const dist = 140 + Math.random() * 90;
      sparks.push({
        id: `s_${Date.now()}_${i}`,
        tx: Math.round(Math.cos(angle) * dist),
        ty: Math.round(Math.sin(angle) * dist),
        rot: Math.round(Math.random() * 360),
        scale: (0.5 + Math.random() * 0.7).toFixed(2),
        color: colors[i % colors.length]
      });
    }
    return sparks;
  },

  onBackToToday() {
    wx.switchTab({ url: '/pages/index/index' });
  },

  onViewWeek() {
    wx.switchTab({ url: '/pages/week/week' });
  },

  // Share Poster Generation & Saving
  onOpenPosterModal() {
    this.setData({
      showPosterModal: true,
      posterImageUrl: '',
      posterLoading: true
    });
    setTimeout(() => {
      this.drawCompletePoster();
    }, 100);
  },

  onClosePosterModal() {
    this.setData({ showPosterModal: false });
  },

  drawCompletePoster() {
    const profile = storage.getProfile();
    const stats = storage.getStats();
    const streak = stats.streak || 1;
    const streakText = streak > 1
      ? `连续达成 ${streak} 天 · 每一步都有回响`
      : '每一个微小习惯，都在重塑从容的自己';

    const todayHabits = storage.getHabits().filter(h => h.completedToday).map(h => ({
      name: h.nameKey ? i18n.t(h.nameKey) : (h.name || h.cardTitle),
      amount: h.metricAmount || h.amount || '已达成'
    }));

    // Ensure current habit is present in poster list
    const currentName = this.data.habitName;
    if (!todayHabits.some(h => h.name === currentName)) {
      todayHabits.unshift({
        name: currentName,
        amount: this.data.metricAdded || '已达成'
      });
    }

    const d = new Date();
    const dateStr = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;

    wx.createSelectorQuery().in(this)
      .select('#completeShareCanvas')
      .fields({ node: true, size: true })
      .exec(res => {
        if (res && res[0] && res[0].node) {
          const canvas = res[0].node;
          poster.renderPoster(canvas, {
            tag: 'EGOHABITS / TODAY ACHIEVED',
            title: i18n.t('share.todayTitle', '今日微习惯达成'),
            nickname: profile.nickname || 'Avery',
            dateStr,
            habits: todayHabits,
            streakText
          });

          poster.exportPosterImage(canvas)
            .then(tempFilePath => {
              this.setData({
                posterImageUrl: tempFilePath,
                posterLoading: false
              });
            })
            .catch(err => {
              console.error('[habit-complete] exportPosterImage failed:', err);
              this.setData({ posterLoading: false });
            });
        } else {
          this.setData({ posterLoading: false });
        }
      });
  },

  onSavePosterToAlbum() {
    if (!this.data.posterImageUrl) {
      wx.showToast({
        title: this.data.tSavingPoster || '正在生成海报...',
        icon: 'none'
      });
      return;
    }
    this.setData({ posterSaving: true });
    poster.saveImageToAlbum(this.data.posterImageUrl)
      .then(() => {
        this.setData({ posterSaving: false, showPosterModal: false });
        wx.showToast({
          title: i18n.t('share.saved', '海报已保存至相册！'),
          icon: 'success'
        });
      })
      .catch((err) => {
        this.setData({ posterSaving: false });
      });
  },

  onCopyShareText() {
    const habitName = this.data.habitName || '微习惯';
    const lang = i18n.getLanguage();
    const text = lang === 'zh'
      ? `今天在 EgoHabits 达成了【${habitName}】。微习惯，慢慢成长。`
      : `Achieved [${habitName}] on EgoHabits today. Small habits. Room to grow.`;

    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({
          title: lang === 'zh' ? '文案已复制' : 'Copied to clipboard',
          icon: 'success',
          duration: 1500
        });
      }
    });
  },

  onShareAppMessage() {
    const profile = storage.getProfile();
    const habitName = this.data.habitName || '微习惯';
    const name = profile.nickname || 'Avery';
    const title = i18n.getLanguage() === 'zh'
      ? `${name} 刚刚达成了【${habitName}】，邀你一起慢慢成长`
      : `${name} just achieved [${habitName}] on EgoHabits`;
    return {
      title,
      path: '/pages/index/index?from=complete_share',
      imageUrl: this.data.posterImageUrl || ''
    };
  },

  onShareTimeline() {
    const habitName = this.data.habitName || '微习惯';
    const title = i18n.getLanguage() === 'zh'
      ? `今日微习惯达成：${habitName}。从容前行，按自己的节奏。`
      : `Gentle step achieved: ${habitName}. Room to grow.`;
    return {
      title,
      query: 'from=timeline',
      imageUrl: this.data.posterImageUrl || ''
    };
  },

  preventProp() {}
});
