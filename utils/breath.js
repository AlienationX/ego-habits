/**
 * EgoHabits - Breathing Exercise Engine
 * Local-first: no audio, no backend. Drives a phase state machine via
 * a flat, looping timeline of { key, secs, scale } steps.
 */
const STORAGE_MODE = 'egohabits_breath_mode';
const STORAGE_FREE = 'egohabits_breath_free';

const PHASE = {
  inhale: 'breath.phases.inhale',
  inhaleAgain: 'breath.phases.inhaleAgain',
  hold: 'breath.phases.hold',
  exhale: 'breath.phases.exhale'
};

const MODES = [
  {
    id: 'box',
    nameKey: 'breath.mode.box.name',
    descKey: 'breath.mode.box.desc',
    patternKey: 'breath.mode.box.pattern',
    tint: 'blue',
    phases: [
      { key: 'inhale', secs: 4, scale: 1.35 },
      { key: 'hold', secs: 4, scale: 1.35 },
      { key: 'exhale', secs: 4, scale: 1.0 },
      { key: 'hold', secs: 4, scale: 1.0 }
    ]
  },
  {
    id: 'relax',
    nameKey: 'breath.mode.relax.name',
    descKey: 'breath.mode.relax.desc',
    patternKey: 'breath.mode.relax.pattern',
    tint: 'sage',
    phases: [
      { key: 'inhale', secs: 4, scale: 1.35 },
      { key: 'hold', secs: 7, scale: 1.35 },
      { key: 'exhale', secs: 8, scale: 1.0 }
    ]
  },
  {
    id: 'resonance',
    nameKey: 'breath.mode.resonance.name',
    descKey: 'breath.mode.resonance.desc',
    patternKey: 'breath.mode.resonance.pattern',
    tint: 'mint',
    phases: [
      { key: 'inhale', secs: 5.5, scale: 1.35 },
      { key: 'exhale', secs: 5.5, scale: 1.0 }
    ]
  },
  {
    id: 'sigh',
    nameKey: 'breath.mode.sigh.name',
    descKey: 'breath.mode.sigh.desc',
    patternKey: 'breath.mode.sigh.pattern',
    tint: 'cream',
    phases: [
      { key: 'inhale', secs: 1.5, scale: 1.35 },
      { key: 'inhaleAgain', secs: 1.5, scale: 1.5 },
      { key: 'exhale', secs: 6, scale: 1.0 }
    ]
  },
  {
    id: 'wimhof',
    nameKey: 'breath.mode.wimhof.name',
    descKey: 'breath.mode.wimhof.desc',
    patternKey: 'breath.mode.wimhof.pattern',
    tint: 'blue-soft',
    special: 'wimhof'
  },
  {
    id: 'free',
    nameKey: 'breath.mode.free.name',
    descKey: 'breath.mode.free.desc',
    patternKey: 'breath.mode.free.pattern',
    tint: 'sage-soft',
    special: 'free'
  }
];

function getMode(id) {
  return MODES.find(m => m.id === id) || MODES[0];
}

// One full "round" of Wim Hof: 30 rapid breaths + retention + recovery breath
function buildWimhofTimeline() {
  const t = [];
  for (let b = 0; b < 30; b++) {
    t.push({ key: 'inhale', secs: 1.1, scale: 1.15 });
    t.push({ key: 'exhale', secs: 1.1, scale: 0.95 });
  }
  t.push({ key: 'exhale', secs: 1, scale: 0.9 });
  t.push({ key: 'hold', secs: 15, scale: 0.9 });
  t.push({ key: 'inhale', secs: 2, scale: 1.4 });
  t.push({ key: 'hold', secs: 10, scale: 1.4 });
  return t;
}

function buildFreeTimeline(cfg) {
  const c = cfg || {};
  const inSecs = num(c.inhale, 4);
  const holdIn = num0(c.hold, 4);
  const outSecs = num(c.exhale, 4);
  const holdOut = num0(c.holdOut, 0);
  const steps = [{ key: 'inhale', secs: inSecs, scale: 1.35 }];
  if (holdIn > 0) steps.push({ key: 'hold', secs: holdIn, scale: 1.35 });
  steps.push({ key: 'exhale', secs: outSecs, scale: 1.0 });
  if (holdOut > 0) steps.push({ key: 'hold', secs: holdOut, scale: 1.0 });
  return steps;
}

function num(v, def) {
  const n = Number(v);
  return isFinite(n) && n > 0 ? n : def;
}

// Like num() but allows 0 (used for skippable hold phases).
function num0(v, def) {
  const n = Number(v);
  return isFinite(n) && n >= 0 ? n : def;
}

// Resolve a mode into its looping timeline (one cycle)
function buildTimeline(mode, freeConfig) {
  if (mode.special === 'wimhof') return buildWimhofTimeline();
  if (mode.special === 'free') return buildFreeTimeline(freeConfig);
  return mode.phases.map(p => ({ key: p.key, secs: p.secs, scale: p.scale }));
}

function getSavedMode() {
  try {
    const id = wx.getStorageSync(STORAGE_MODE);
    if (id && getMode(id)) return id;
  } catch (e) {}
  return 'box';
}

function saveMode(id) {
  try { wx.setStorageSync(STORAGE_MODE, id); } catch (e) {}
}

function getFreeConfig() {
  try {
    const c = wx.getStorageSync(STORAGE_FREE);
    if (c && typeof c === 'object') return c;
  } catch (e) {}
  return { inhale: 4, hold: 4, exhale: 4, holdOut: 0, durationMin: 3 };
}

function saveFreeConfig(cfg) {
  try { wx.setStorageSync(STORAGE_FREE, cfg); } catch (e) {}
}

module.exports = {
  PHASE,
  MODES,
  getMode,
  buildTimeline,
  getSavedMode,
  saveMode,
  getFreeConfig,
  saveFreeConfig
};
