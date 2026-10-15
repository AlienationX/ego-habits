#!/usr/bin/env node
/**
 * promo/generate.js
 * 一键生成当天的双平台推广草稿（公众号长文 + 小红书笔记）+ 出图提示词。
 *
 * 用法：
 *   node promo/generate.js                 # 用今天日期，按内容日历自动选选题
 *   node promo/generate.js --date 2026-10-15
 *   node promo/generate.js --topic water   # 指定选题
 *   node promo/generate.js --list          # 列出所有选题
 *   node promo/generate.js --help
 *
 * 输出目录：promo/output/<YYYY-MM-DD>/
 *   ├── gongzhonghao.md    公众号草稿（可直接复制到公众号编辑器）
 *   ├── xiaohongshu.md     小红书笔记草稿
 *   ├── images/prompts.json 出图提示词（交给文生图生成封面 + 配图）
 *   └── manifest.json       本次生成元信息
 *
 * 说明：脚本产出「文案 + 出图提示词」；图片需用文生图能力渲染（见工作流说明）。
 */

const fs = require('fs');
const path = require('path');
const { makeRng } = require('./rng');
const { TOPICS, getTopicById } = require('./topics');
const { buildImagePrompts } = require('./images');
const { composeGongzhonghao, composeXiaohongshu } = require('./templates');

const ROOT = path.resolve(__dirname, '..');
const OUT_ROOT = path.join(__dirname, 'output');

function fmtDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function dayIndex(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d - start) / 86400000);
}

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--date') args.date = argv[++i];
    else if (a === '--topic') args.topic = argv[++i];
    else if (a === '--list') args.list = true;
    else if (a === '--help' || a === '-h') args.help = true;
    else args._.push(a);
  }
  return args;
}

function showHelp() {
  console.log(`EgoHabits 推广内容工作流

用法：
  node promo/generate.js [选项]

选项：
  --date  YYYY-MM-DD   指定日期（默认今天），用于稳定轮换选题
  --topic <id>         指定选题（跳过日历轮换），如 water / breathe / week
  --list               列出全部选题 id
  --help, -h           显示帮助

输出：promo/output/<日期>/ 下生成公众号与小红书草稿，以及出图提示词。
`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) return showHelp();
  if (args.list) {
    console.log('可选选题（id → 标题）：');
    TOPICS.forEach((t) => console.log(`  ${t.id.padEnd(14)} ${t.title}  [${t.angle}]`));
    return;
  }

  const dateStr = args.date || fmtDate(new Date());
  let topic;
  if (args.topic) {
    topic = getTopicById(args.topic);
    if (!topic) {
      console.error(`未找到选题 "${args.topic}"，用 --list 查看全部。`);
      process.exit(1);
    }
  } else {
    const idx = dayIndex(dateStr);
    topic = TOPICS[idx % TOPICS.length];
  }

  // 用「日期 + 选题」做种子：同一天同选题结果稳定，不同天自然变化
  const rng = makeRng(`${dateStr}::${topic.id}`);

  const gzh = composeGongzhonghao(topic, rng);
  const xhs = composeXiaohongshu(topic, rng);
  const imgs = buildImagePrompts(topic);

  const dayDir = path.join(OUT_ROOT, dateStr);
  const imgDir = path.join(dayDir, 'images');
  fs.mkdirSync(imgDir, { recursive: true });

  fs.writeFileSync(path.join(dayDir, 'gongzhonghao.md'), gzh.md, 'utf8');
  fs.writeFileSync(path.join(dayDir, 'xiaohongshu.md'), xhs.md, 'utf8');

  const prompts = {
    meta: { date: dateStr, topic: topic.id, appName: 'EgoHabits微习惯' },
    cover: { role: '公众号封面图 (约 900x383 横版)', prompt: imgs.cover },
    stickers: imgs.stickers,
    palette: imgs.palette,
  };
  fs.writeFileSync(path.join(imgDir, 'prompts.json'), JSON.stringify(prompts, null, 2), 'utf8');

  const manifest = {
    date: dateStr,
    topic: topic.id,
    topicTitle: topic.title,
    angle: topic.angle,
    character: topic.character,
    tint: topic.tint,
    gongzhonghao: { title: gzh.title, file: 'gongzhonghao.md' },
    xiaohongshu: { title: xhs.title, file: 'xiaohongshu.md' },
    images: { cover: true, stickers: imgs.stickers.length, prompts: 'images/prompts.json' },
    generatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(dayDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

  console.log(`✅ 已生成 ${dateStr} 的推广草稿`);
  console.log(`   选题：${topic.id}（${topic.title} / ${topic.angle}）`);
  console.log(`   公众号标题：${gzh.title}`);
  console.log(`   小红书标题：${xhs.title}`);
  console.log(`   输出目录：${path.relative(ROOT, dayDir)}`);
  console.log(`   出图提示词：${path.relative(ROOT, path.join(imgDir, 'prompts.json'))}`);
  console.log('');
  console.log('下一步：用文生图能力渲染封面与配图 → 复制到公众号/小红书发布。');
}

main();
