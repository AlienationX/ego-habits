/**
 * promo/templates.js
 * 把选题 + 确定性随机，组装成两套成稿：
 *  - composeGongzhonghao：公众号长文（标题/封面描述/导语/正文/金句/结尾 CTA/话题）
 *  - composeXiaohongshu：小红书笔记（emoji 钩子标题/口语化正文/互动/话题）
 *
 * 文案取自 app 真实调性（治愈、温和、不焦虑）。同一天输出稳定，
 * 不同天因 rng 轮换而自然变化，长期也不会完全重复。
 */

const APP_NAME = 'EgoHabits微习惯';
const SLOGAN = '微习惯，慢慢成长。';

// ---------- 公众号 ----------
const GZH_TITLE = [
  (t) => `「${t.title}」：${t.hero}`,
  (t) => `微习惯日记｜${t.title}，慢慢来就好`,
  (t) => `每天只做一件小事：${t.title}`,
  (t) => `不逼自己自律，试试「${t.title}」`,
  (t) => `被低估的温柔小事：${t.title}`,
];

const GZH_LEAD = [
  (t) =>
    `很多人以为，改变生活需要很大的决心。但在 ${APP_NAME}，我们相信：一个微小的动作，就值得被温柔铭记。今天想和你聊聊「${t.title}」。`,
  (t) =>
    `不需要宏大的计划，也不需要咬牙坚持。${t.hero}——这是 ${APP_NAME} 想陪你慢慢养成的，一件小到不会失败的事。`,
  (t) =>
    `如果你也常觉得「自律好难」，也许不是你的问题，而是目标太大了。试试把期待调小：从「${t.title}」开始。`,
];

const QUOTES = [
  '微习惯，慢慢成长。',
  '不慌不忙，也是一种力量。',
  '你不需要很厉害才能开始，只需要开始一点点。',
  '温柔地对待自己，从一件小事开始。',
  '少一点负担，多一点在场。',
];

const GZH_CTA = [
  `在微信搜一搜「${APP_NAME}」，或打开小程序，从今天的一件小事开始。`,
  `想体验这种「不焦虑的自律」？微信搜「${APP_NAME}」，三个小习惯，按你的节奏来。`,
  `把温柔留给自己。微信搜索「${APP_NAME}」，慢慢来，我们一起。`,
];

// ---------- 小红书 ----------
const XHS_TITLE = [
  (t) => `🥹终于不逼自己自律了｜${t.title}`,
  (t) => `打工人续命小习惯｜${t.title}✨`,
  (t) => `每天1件小事治愈内耗｜${t.title}`,
  (t) => `谁懂啊😭这个小习惯真的有用｜${t.title}`,
  (t) => `微习惯打卡日记｜${t.title}`,
];

const XHS_OPEN = [
  '不知道你有没有这种感觉——',
  '最近真的被这个小程序治愈到了😌',
  '分享一个我最近在用的、超轻松的微习惯👇',
  '不是自律打卡那种压迫感，是真的很温柔——',
];

const XHS_END = [
  '你今天做了吗？评论区聊聊呀～',
  '一起慢慢来，不着急💚',
  '关注我，每天一个不费力的小习惯✨',
  '把这条囤起来，明天就试试吧～',
];

const BASE_TAGS = ['#EgoHabits', '#微习惯', '#自我关怀', '#治愈系', '#生活方式', '#自律'];

// ---------- 组装 ----------
function composeGongzhonghao(topic, rng) {
  const title = rng.pick(GZH_TITLE)(topic);
  const lead = rng.pick(GZH_LEAD)(topic);
  const quote = rng.pick(QUOTES);
  const cta = rng.pick(GZH_CTA);

  const body = topic.points
    .map((pt) => `### ${pt.h}\n${pt.p}`)
    .join('\n\n');

  const tags = [...BASE_TAGS, ...(topic.tags || [])];
  const tagLine = tags.map((t) => '`#' + t.replace(/^#/, '') + '`').join(' ');

  const md = `# ${title}

> ${SLOGAN}

${lead}

${body}

---

> ${quote}

${cta}

---

话题：${tagLine}
`;

  return { title, coverDesc: topic.coverScene, body, md };
}

function composeXiaohongshu(topic, rng) {
  const title = rng.pick(XHS_TITLE)(topic);
  const open = rng.pick(XHS_OPEN);
  const end = rng.pick(XHS_END);
  const quote = rng.pick(QUOTES);

  const bullets = topic.points
    .map((pt) => `✅ ${pt.h}\n${pt.p}`)
    .join('\n\n');

  const tags = [...BASE_TAGS, ...(topic.tags || [])];
  const tagLine = tags.join(' ');

  const md = `${title}

${open}

「${topic.title}」——${topic.hero}

${bullets}

💬 ${quote}

${end}

${tagLine}
`;

  return { title, md };
}

module.exports = { composeGongzhonghao, composeXiaohongshu, APP_NAME, SLOGAN };
