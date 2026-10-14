/**
 * EgoHabits - Procedural Ambient Soundscape Engine
 * 100% offline WebAudio soundscapes: Rain, Waves, Singing Bowl, Forest Wind
 */

const storage = require('./storage.js');

let audioCtx = null;
let currentSourceNodes = [];
let masterGain = null;
let currentSound = 'none'; // 'none' | 'rain' | 'waves' | 'bowl' | 'forest'
let isPlaying = false;
let currentVolume = 0.5;

function getAudioContext() {
  if (!audioCtx) {
    try {
      if (typeof wx !== 'undefined' && wx.createWebAudioContext) {
        audioCtx = wx.createWebAudioContext();
      }
    } catch (e) {
      console.warn('WebAudioContext not available:', e);
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    try {
      audioCtx.resume();
    } catch (e) {}
  }
  return audioCtx;
}

function stopCurrent() {
  currentSourceNodes.forEach(node => {
    try {
      if (node.stop) node.stop();
      if (node.disconnect) node.disconnect();
    } catch (e) {}
  });
  currentSourceNodes = [];
  isPlaying = false;
  currentSound = 'none';
}

// Generate pink/brown noise buffer for natural rain and wind
function createNoiseBuffer(ctx, duration = 4) {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
    b6 = white * 0.115926;
  }
  return buffer;
}

// 1. Gentle Rain (晨曦微雨)
function startRain(ctx) {
  const noiseBuf = createNoiseBuffer(ctx, 4);
  const source = ctx.createBufferSource();
  source.buffer = noiseBuf;
  source.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 1100;

  const gain = ctx.createGain();
  gain.gain.value = currentVolume * 0.7;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  source.start(0);
  currentSourceNodes.push(source, filter, gain);
}

// 2. Ocean Waves (潮起潮落) - LFO swept tidal swells
function startWaves(ctx) {
  const noiseBuf = createNoiseBuffer(ctx, 5);
  const source = ctx.createBufferSource();
  source.buffer = noiseBuf;
  source.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 400;

  // LFO for wave swelling
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.14; // ~7 second wave cycle

  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 250;
  lfo.connect(filter.frequency);

  const gain = ctx.createGain();
  gain.gain.value = currentVolume * 0.8;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  source.start(0);
  lfo.start(0);
  currentSourceNodes.push(source, lfo, filter, gain);
}

// 3. Singing Bowl (颂钵 432Hz 疗愈谐波)
function startBowl(ctx) {
  let intervalTimer = null;

  function strikeBowl() {
    if (!isPlaying) return;
    const now = ctx.currentTime;
    const freqs = [432, 864, 1296];
    const decays = [4.5, 3.2, 2.0];
    const amps = [0.35, 0.15, 0.06];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;

      oscGain.gain.setValueAtTime(amps[idx] * currentVolume, now);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + decays[idx]);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + decays[idx]);
    });
  }

  strikeBowl();
  intervalTimer = setInterval(() => {
    if (isPlaying && currentSound === 'bowl') {
      strikeBowl();
    } else {
      clearInterval(intervalTimer);
    }
  }, 7500);

  currentSourceNodes.push({
    stop: () => clearInterval(intervalTimer),
    disconnect: () => {}
  });
}

// 4. Forest Wind (林间清风)
function startForest(ctx) {
  const noiseBuf = createNoiseBuffer(ctx, 4);
  const source = ctx.createBufferSource();
  source.buffer = noiseBuf;
  source.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 450;
  filter.Q.value = 1.2;

  const gain = ctx.createGain();
  gain.gain.value = currentVolume * 0.6;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  source.start(0);
  currentSourceNodes.push(source, filter, gain);
}

function play(soundName, volume = 50) {
  currentVolume = Math.max(0, Math.min(1, volume / 100));
  if (soundName === 'none') {
    stopCurrent();
    storage.saveSoundscapeSetting({ sound: 'none', volume, playing: false });
    return;
  }

  stopCurrent();
  const ctx = getAudioContext();
  if (!ctx) return;

  isPlaying = true;
  currentSound = soundName;

  try {
    switch (soundName) {
      case 'rain':
        startRain(ctx);
        break;
      case 'waves':
        startWaves(ctx);
        break;
      case 'bowl':
        startBowl(ctx);
        break;
      case 'forest':
        startForest(ctx);
        break;
      default:
        stopCurrent();
        break;
    }
    storage.saveSoundscapeSetting({ sound: soundName, volume, playing: true });
  } catch (e) {
    console.warn('Failed to start soundscape:', e);
    stopCurrent();
  }
}

function setVolume(volume) {
  currentVolume = Math.max(0, Math.min(1, volume / 100));
  if (isPlaying && currentSound !== 'none') {
    play(currentSound, volume);
  }
}

function toggle(soundName, volume = 50) {
  if (isPlaying && currentSound === soundName) {
    stopCurrent();
    storage.saveSoundscapeSetting({ sound: 'none', volume, playing: false });
    return false;
  } else {
    play(soundName, volume);
    return true;
  }
}

function getStatus() {
  return {
    isPlaying,
    currentSound,
    volume: Math.round(currentVolume * 100)
  };
}

module.exports = {
  play,
  stop: stopCurrent,
  toggle,
  setVolume,
  getStatus
};
