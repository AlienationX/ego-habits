/**
 * promo/rng.js
 * 基于日期字符串的确定性随机：同一天跑脚本结果稳定，不同天自动轮换。
 */
function hashString(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeRng(seedStr) {
  const rng = mulberry32(hashString(String(seedStr)));
  return {
    next: rng,
    // 从数组里稳定取一个
    pick: (arr) => arr[Math.floor(rng() * arr.length)],
    // 0..n-1
    int: (n) => Math.floor(rng() * n),
  };
}

module.exports = { makeRng, hashString };
