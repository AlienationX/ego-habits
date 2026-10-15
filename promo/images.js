/**
 * promo/images.js
 * 根据选题生成「贴合 EgoHabits 设计系统」的出图提示词。
 * 角色 / 配色取自 AGENTS.md 与 assets/characters，保证风格统一。
 *
 * 输出两类：
 *  - cover：公众号封面图（横版，约 900x383）
 *  - stickers：小红书配图（竖版 3:4，3~4 张）
 * 提示词以英文撰写（图像模型对英文更稳），并标注设计约束。
 */

const PALETTE = {
  green: '#4FA65A',
  mint: '#BAD8BE',
  blue: '#CCE6ED',
  blueDeep: '#6BBCE8',
  cream: '#F5F5ED',
  ink: '#232323',
  sageSoft: '#DCE8BD',
};

const CHARACTERS = {
  guide: 'an arch-shaped waving green character',
  water: 'a smiling blue water cup with a face',
  celebrate: 'a cheering blue water cup with raised arms',
  shoe: 'a green running shoe with a friendly face',
  book: 'a light green book with a bookmark',
  pillow: 'a soft cream pillow/toast character with closed eyes',
  hourglass: 'a green sand hourglass character',
  cloud: 'a mint serene cloud character',
  medal: 'a ruffled green medal with ribbons',
  avatar: 'an apple/bean avatar character with a small leaf',
};

function styleBase(tintColor) {
  return (
    'Flat vector illustration, healing and gentle aesthetic, ' +
    'rounded shapes, lots of whitespace, minimal, ' +
    `soft cream and mint background, pastel palette accented with ${tintColor}, ` +
    'calm, warm, cozy, children-book illustration style, ' +
    'no text, no letters, no watermark, no photography.'
  );
}

function buildImagePrompts(topic) {
  const char = CHARACTERS[topic.character] || 'a cute green character';
  const tint = topic.tintColor || PALETTE.mint;
  const base = styleBase(tint);

  const cover =
    `WeChat official account cover image, horizontal composition. ${base} ` +
    `Hero: ${char}, centered, ${topic.coverScene || 'a peaceful daily moment'}. ` +
    `Soft ${tint} accent, airy and inviting.`;

  const stickers = (topic.scenes || []).slice(0, 4).map((scene, i) => ({
    index: i + 1,
    role: `小红书配图 ${i + 1} / 共 ${Math.min((topic.scenes || []).length, 4)}`,
    prompt:
      `Xiaohongshu post illustration, portrait 3:4. ${base} ` +
      `Scene: ${scene}. Featuring the ${char}, ${tint} tones, relatable and cozy.`,
  }));

  return { cover, stickers, palette: PALETTE, character: char };
}

module.exports = { buildImagePrompts, PALETTE, CHARACTERS };
