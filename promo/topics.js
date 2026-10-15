/**
 * promo/topics.js
 * 内容选题库（内容日历）。每个 topic 对应一个推广角度，
 * 角色 / 配色 / 文案都取自 app 真实内容（locales/zh.js + assets/characters）。
 *
 * 字段说明：
 *  id        唯一标识，可用 --topic <id> 指定
 *  angle     角度：feature(习惯聚焦) | value(核心卖点) | scene(场景种草) | emotion(共情)
 *  title     主标题短语
 *  hero      一句治愈系主张（取自 app 文案）
 *  character 陪伴角色（对应 assets/characters 文件名，无 .svg）
 *  tint      卡片色调（blue / mint / sage / mint-soft / sage-soft / blue-soft）
 *  tintColor 出图主色（hex）
 *  coverScene 公众号封面场景描述
 *  points    正文要点 [{ h: 小标题, p: 段落 }]
 *  scenes    小红书贴图场景（3~4 张）
 *  tags      追加话题标签
 */

const TOPICS = [
  {
    id: 'water',
    angle: 'feature',
    title: '喝一杯水',
    hero: '一杯温水。一次小小重启。',
    character: 'water',
    tint: 'blue',
    tintColor: '#CCE6ED',
    coverScene: 'a smiling blue water cup on a calm desk, morning light',
    points: [
      { h: '停下来，喝一口', p: '工作时把它放在触手可及的地方，以最放松的节奏小口啜饮。不必打卡式地逼自己，只想让你在忙碌里，留一个温柔的停顿。' },
      { h: '被温柔记录', p: '每一次喝水，都是一个被温柔铭记的小动作。不用写长篇日记，一滴水也是对自己的关照。' },
    ],
    scenes: [
      'a blue water cup on a wooden desk beside a laptop, soft morning light',
      'a hand holding a cute cup, calm expression, mint background',
      'the water cup character waving, flat vector, lots of whitespace',
    ],
    tags: ['#喝水', '#养生'],
  },
  {
    id: 'outside',
    angle: 'feature',
    title: '出门走走',
    hero: '走出去。深呼吸。',
    character: 'shoe',
    tint: 'mint',
    tintColor: '#BAD8BE',
    coverScene: 'a green running shoe with a face, on a garden path',
    points: [
      { h: '无需特别装备', p: '换上鞋子，绕着街区走一圈就足够。十分钟，给思绪一点新鲜空气。' },
      { h: '走一小段路，也能改变一整天', p: '不追求步数，不追求配速。只是走出去，让身体和心情都透口气。' },
    ],
    scenes: [
      'a green shoe character walking on a leafy path, sunshine',
      'top view of a cute shoe on grass, mint tones',
      'the shoe character stretching arms, flat illustration',
    ],
    tags: ['#散步', '#户外'],
  },
  {
    id: 'read',
    angle: 'feature',
    title: '静心翻几页',
    hero: '翻开一本书。短暂放空。',
    character: 'book',
    tint: 'sage',
    tintColor: '#4FA65A',
    coverScene: 'a light green book with a bookmark, cozy reading nook',
    points: [
      { h: '从任意一页开始', p: '任何书都可以，读五页就很好。没有截止时间，只有故事。' },
      { h: '一场小小的逃离', p: '合上手机，翻开纸页。字里行间的沉淀，正悄然为你构筑更广阔的世界。' },
    ],
    scenes: [
      'a green book character with bookmark, reading nook, warm light',
      'a person curled up reading, book character beside, sage palette',
      'the book character smiling, flat vector, cream background',
    ],
    tags: ['#阅读', '#纸质书'],
  },
  {
    id: 'breathe',
    angle: 'feature',
    title: '慢慢深呼吸',
    hero: '慢慢吸气。慢慢呼气。',
    character: 'cloud',
    tint: 'blue-soft',
    tintColor: '#6BBCE8',
    coverScene: 'a mint serene cloud character, calm breathing motion lines',
    points: [
      { h: '一分钟，回到此刻', p: '跟着方盒呼吸、4-7-8 放松呼吸的节奏，一呼一吸之间，抚平浮躁与疲惫。' },
      { h: '把平静带在身上', p: '不需要瑜伽垫，坐着躺着都可以。温柔的一分钟，是给神经系统的安抚。' },
    ],
    scenes: [
      'a mint cloud character with gentle breathing lines, blue tones',
      'a person relaxing with the cloud character, soft background',
      'the cloud character meditating, flat vector, lots of whitespace',
    ],
    tags: ['#呼吸', '#放松', '#焦虑'],
  },
  {
    id: 'eyes',
    angle: 'feature',
    title: '闭目养神',
    hero: '闭上眼睛。歇一小会儿。',
    character: 'pillow',
    tint: 'mint-soft',
    tintColor: '#F5F5ED',
    coverScene: 'a soft cream pillow/toast character, eyes closed, peaceful',
    points: [
      { h: '两分钟的安静时光', p: '舒服地靠坐下来，轻轻闭上眼睛。不用用力，放松就好。' },
      { h: '片刻的黑暗，换来持久的清澈', p: '盯了一天屏幕？给眼睛一个温柔的休止符。' },
    ],
    scenes: [
      'a cream pillow character with closed eyes, peaceful, mint accent',
      'a tired person closing eyes, pillow character beside',
      'the pillow character napping, flat vector, soft palette',
    ],
    tags: ['#护眼', '#休息'],
  },
  {
    id: 'task',
    angle: 'feature',
    title: '安静小专注',
    hero: '一件小事。温柔的专注。',
    character: 'hourglass',
    tint: 'sage-soft',
    tintColor: '#DCE8BD',
    coverScene: 'a green sand hourglass character, focused timer vibe',
    points: [
      { h: '就一件事，轻轻松松', p: '挑一件小事，沉浸十五分钟。其他的事，先放一放。' },
      { h: '心流带来内心的笃定', p: '一点点推进都算数。微小的专注，正在汇聚成笃定的力量。' },
    ],
    scenes: [
      'a green hourglass character focused, sage tones',
      'a person in flow state with hourglass character',
      'the hourglass character giving a thumbs up, flat vector',
    ],
    tags: ['#专注', '#心流', '#效率'],
  },
  {
    id: 'philosophy',
    angle: 'value',
    title: '微习惯，慢慢成长',
    hero: '从微小开始。',
    character: 'guide',
    tint: 'sage',
    tintColor: '#4FA65A',
    coverScene: 'an arch-shaped waving guide character welcoming you',
    points: [
      { h: '不靠意志力，靠微小', p: '我们不做「坚持 100 天」的焦虑训练。三个小习惯，按你自己的节奏来。' },
      { h: '从容，是更高级的自律', p: '建议每日只关照 1~4 件小事。少一点负担，多一点在场。' },
    ],
    scenes: [
      'the guide character waving hello, green palette, welcoming',
      'a calm person with three tiny habit icons floating, mint bg',
      'the guide character pointing at a small step, flat illustration',
    ],
    tags: ['#生活方式', '#自我成长'],
  },
  {
    id: 'custom',
    angle: 'value',
    title: '创建你的专属微习惯',
    hero: '为生活留一点小习惯。',
    character: 'medal',
    tint: 'sage',
    tintColor: '#4FA65A',
    coverScene: 'a ruffled green medal character, celebratory',
    points: [
      { h: '睡前拉伸、晨间冥想、遛狗…', p: '任何对你有意义的小事，都能变成专属微习惯。挑一个角色和色调，它就属于你了。' },
      { h: '你定义节奏，不被模板绑架', p: '目标数量、分类、陪伴小角色，全部自定义。' },
    ],
    scenes: [
      'the medal character with a plus sign, green celebratory',
      'a phone showing a custom habit card being created',
      'the medal character cheering, flat vector, cream background',
    ],
    tags: ['#自定义', '#个性化'],
  },
  {
    id: 'week',
    angle: 'value',
    title: '这一周，悄悄成长',
    hero: '坚持在场的一周。',
    character: 'celebrate',
    tint: 'blue',
    tintColor: '#6BBCE8',
    coverScene: 'a cheering water cup character with raised arms',
    points: [
      { h: '周统计，温柔不评判', p: '图表与日历，安静地告诉你：这一周，由什么组成。没有红叉，只有看见。' },
      { h: '七天时光，你独有的平稳节奏', p: '不强求每天满分。只要在场，就是成长。' },
    ],
    scenes: [
      'the celebrate character cheering with raised arms, blue tones',
      'a weekly chart with gentle bars, mint palette',
      'the celebrate character with confetti, flat illustration',
    ],
    tags: ['#周报', '#复盘'],
  },
  {
    id: 'badges',
    angle: 'value',
    title: '每个微小的坚持，都被铭记',
    hero: '成就勋章馆。',
    character: 'medal',
    tint: 'sage',
    tintColor: '#4FA65A',
    coverScene: 'a shelf of green medals, cozy gallery',
    points: [
      { h: '从「萌芽破土」到「百次相伴」', p: '连续 3 天、7 天、21 天……每一个里程碑，都有一枚温柔的勋章等你解锁。' },
      { h: '不比较，只看见自己', p: '勋章记录的是你与自己的约定，而不是别人的进度条。' },
    ],
    scenes: [
      'a wall of green medals, cozy achievement gallery',
      'a medal character shining, sage tones',
      'the medal character with a ribbon, flat vector',
    ],
    tags: ['#成就', '#打卡'],
  },
  {
    id: 'reminder',
    angle: 'value',
    title: '温柔提醒，不打扰',
    hero: '在生活的重要间隙，给你关照。',
    character: 'guide',
    tint: 'mint',
    tintColor: '#BAD8BE',
    coverScene: 'the guide character with a soft alarm bell, calm',
    points: [
      { h: '晨间轻唤醒，晚间温柔复盘', p: '开启新的一天，或睡前片刻静心——提醒像朋友，不催促。' },
      { h: '可同步到系统日历', p: '把温柔提醒写进日历闹钟，或订阅微信通知，刚刚好。' },
    ],
    scenes: [
      'the guide character holding a soft bell, mint background',
      'a phone showing a gentle reminder notification',
      'the guide character waving goodnight, flat illustration',
    ],
    tags: ['#提醒', '#自律'],
  },
  {
    id: 'soundscape',
    angle: 'value',
    title: '让自然声景陪你',
    hero: '潮起潮落，林间清风。',
    character: 'cloud',
    tint: 'blue-soft',
    tintColor: '#6BBCE8',
    coverScene: 'a cloud character with soft sound waves, ocean/forest',
    points: [
      { h: '白噪音伴你进入心流', p: '晨曦微雨、潮起潮落、疗愈颂钵、林间清风——挑一种，让环境替你安静下来。' },
      { h: '专注与呼吸的好搭档', p: '配合呼吸练习或安静小专注，声音是温柔的背景。' },
    ],
    scenes: [
      'the cloud character with sound waves, ocean vibe, blue tones',
      'a cozy scene with rain sounds, mint palette',
      'the cloud character with headphones, flat vector',
    ],
    tags: ['#白噪音', '#助眠', '#专注'],
  },
  {
    id: 'scene-work',
    angle: 'scene',
    title: '上班族的续命三件套',
    hero: '不慌不忙，也能照顾好自己。',
    character: 'eyes',
    tint: 'mint-soft',
    tintColor: '#F5F5ED',
    coverScene: 'a desk scene with water cup, pillow and hourglass characters',
    points: [
      { h: '盯屏两小时，闭目养神 2 分钟', p: '给眼睛一个休止符；再喝口水、专注一件小事，下午就不那么垮了。' },
      { h: '办公室也能做的微习惯', p: '不用瑜伽垫、不用换衣。三个小动作，把工位变成充电站。' },
    ],
    scenes: [
      'a desk with three tiny habit characters, cozy office',
      'a tired worker closing eyes, pillow character beside',
      'the water + hourglass characters on a desk, flat illustration',
    ],
    tags: ['#打工人', '#办公室', '#久坐'],
  },
  {
    id: 'scene-night',
    angle: 'scene',
    title: '睡前的十分钟仪式',
    hero: '感谢今天的自己。',
    character: 'breathe',
    tint: 'blue-soft',
    tintColor: '#6BBCE8',
    coverScene: 'a calm bedtime scene with cloud character, dim light',
    points: [
      { h: '深呼吸 1 分钟，闭目养神 2 分钟', p: '把白天的紧绷，慢慢吐出去。温柔的晚间复盘，比刷手机更助眠。' },
      { h: '给今天一个温柔的句号', p: '不需要完美的一天。只要记得，对自己说一句：做得很好。' },
    ],
    scenes: [
      'a dim bedroom with the cloud character, peaceful blue tones',
      'a person breathing calmly before sleep, mint palette',
      'the cloud character with a moon, flat vector',
    ],
    tags: ['#睡前', '#助眠', '#仪式感'],
  },
  {
    id: 'emotion-hard',
    angle: 'emotion',
    title: '坚持好难，没关系',
    hero: '任何时候重新开始，都不算迟。',
    character: 'guide',
    tint: 'sage',
    tintColor: '#4FA65A',
    coverScene: 'the guide character offering a hand, gentle',
    points: [
      { h: '断了一天，不是失败', p: 'EgoHabits 有「补记打卡」——落下的日子，可以温柔地补回来。' },
      { h: '不完美，也能继续', p: '我们不要苦行僧式的自律。允许停顿，允许重新开始。' },
    ],
    scenes: [
      'the guide character offering support, green palette',
      'a calendar with a missed day being gently filled in',
      'the guide character smiling, flat illustration, cream bg',
    ],
    tags: ['#内耗', '#自我和解', '#坚持'],
  },
  {
    id: 'emotion-care',
    angle: 'emotion',
    title: '把温柔留给自己',
    hero: '你值得被自己好好照顾。',
    character: 'avatar',
    tint: 'sage',
    tintColor: '#6BC47B',
    coverScene: 'an apple/bean avatar character with a leaf, warm',
    points: [
      { h: '生活时光便签', p: '每次打卡，写下一句小感想。这些便签，是只属于你的温柔日记。' },
      { h: '关怀自己，不是自私', p: '从一件小事开始，把注意力轻轻放回自己身上。' },
    ],
    scenes: [
      'the avatar character with a leaf, warm green tones',
      'a journal with tiny habit notes, cozy',
      'the avatar character hugging itself, flat vector',
    ],
    tags: ['#自我关怀', '#爱自己', '#治愈'],
  },
];

function getTopicById(id) {
  return TOPICS.find((t) => t.id === id) || null;
}

module.exports = { TOPICS, getTopicById };
