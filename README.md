# EgoHabits 微习惯

> **Small habits. Room to grow.**  
> 把习惯养成做得更轻一点。专注于极简、治愈与无压力的生活习惯打卡小程序。

---

## 📖 项目简介

**EgoHabits** 是一款专为个人开发者与追求高品质极简生活用户设计的轻量微习惯打卡微信小程序。  
设计灵感源自经典治愈系设计规范，旨在通过温和的视觉节奏、可爱的拟人化插画角色、直观的周度成长数据，帮助用户无压力地关照自我生活的小小瞬间（喝一杯水、出门散散步、阅读五页书）。

- **无压力微习惯**：拒绝繁杂负重，以 3~6 个极简生活小目标为核心。
- **1:1 视觉还原**：严格遵循 8px 律动、Nimbus Sans 字体层级、精心调制的治愈系色彩 Token。
- **全端与双模驱动**：支持 **Light 浅色奶油风** 与 **Dark 沉浸暗夜风**，中英文（i18n）双语随时一键切换。
- **零网络依赖（Local-First）**：完全基于微信本地持久化缓存，秒开即用，零账号门槛，尊重用户隐私。

---

## 🎨 视觉系统与设计规范

### 1. 颜色 Token（Design Tokens）

| 标识 | HEX 颜色值 | 用途与语义 |
| :--- | :--- | :--- |
| **Ink** | `#232323` | 主要文字、深色胶囊按钮、Tab 容器 |
| **Green** | `#4FA65A` | 品牌主绿、行动按钮（Get started）、核心角色主色 |
| **Sage** | `#DCE8BD` | 鼠尾草绿，副行动按钮（View my week）、柔和卡片背景 |
| **Blue** | `#CCE6ED` | 轻盈天蓝，喝水打卡主题卡片与水杯角色 |
| **Mint** | `#BAD8BE` | 薄荷绿，书籍与呼吸云朵卡片 |
| **Cream** | `#F6F5EE` | Light 浅色模式全屏背景奶油底色 |
| **Dark Page** | `#171917` | Dark 深色模式全屏背景底色 |
| **Dark Card** | `#232723` | Dark 深色模式卡片底色 |

### 2. 拟人图形家族（Visual Family）

严格 1:1 纯矢量（SVG）还原 10 款原创拟人形象：
1. `guide`: 绿色拱门挥手小人（Your little guide）
2. `water`: 蓝色水杯打招呼小人（A water break）
3. `celebrate`: 欢庆高举双手水杯小人（A little celebration）
4. `shoe`: 绿色慢跑步鞋小人（Move）
5. `book`: 翻页书本小人（Read）
6. `pillow`: 柔软休息吐司小人（Rest）
7. `hourglass`: 流沙专注小人（Focus）
8. `cloud`: 轻盈呼吸云朵小人（Breathe）
9. `medal`: 花边连续打卡勋章（Milestone）
10. `avatar`: 萌芽小果个人伴侣（Your companion）

---

## 📱 页面与功能架构

```
EgoHabits
├── Tab 1: Today (今日打卡总览)
│   ├── 日期问候栏 ("EgoHabits · MONDAY, SEP 07", "Hey, Avery.")
│   ├── 引导卡片 ("Start small." / "从小事开始") + 挥手小人
│   └── 每日关照卡片列表 (喝水、散步、阅读)
│
├── Tab 2: Habits (习惯资源库)
│   ├── 标签筛选器 (All / Move / Rest / Focus)
│   └── 6 宫格双列习惯卡片（配备独立形象与规格）
│
├── 详情页: Habit Details (习惯详情 - 喝水为例)
│   ├── 习惯卡片 ("One glass. A small reset.")
│   ├── 250ml / 每日节奏 指标展示
│   ├── 轻松三步清单 (Keep it easy)
│   └── [Log one glass] 一键打卡按钮
│
├── 达成页: Habit Complete (打卡庆祝)
│   ├── 欢庆水杯高举双手矢量插画
│   ├── 进度条增加动画 (+250 ml / A little care, counted)
│   └── [Back to today] / [View my week] 导航跳转
│
├── Tab 3: Week (周度统计与回顾)
│   ├── 7 天打卡柱状图 (动态高亮活跃日与数量)
│   ├── 七天坚持勋章卡片 ("A week of showing up")
│   └── 分类完成度胶囊条 (Water breaks / Move + focus)
│
└── Tab 4: You (个人空间与偏好)
│   ├── 个人信息与连续打卡天数统计
│   ├── 里程碑成就展示
│   └── 偏好设置 (语言切换 En/Zh、主题切换 Light/Dark/Auto、数据管理)
```

---

## 🛠️ 技术选型与项目结构

```
ego-habits/
├── assets/
│   ├── characters/        # 10 个 1:1 矢量拟人形象 SVG
│   └── icons/             # 7 个系统线性图标 SVG
├── components/
│   ├── habit-character/   # 拟人角色组件 (支持不同大小与微交互)
│   ├── navigation-bar/    # 自定义状态栏与页面顶栏
│   └── custom-tabbar/     # 底部悬浮式微胶囊导航栏
├── locales/
│   ├── en.js              # 英文原文案语言包
│   └── zh.js              # 治愈系中文翻译语言包
├── pages/
│   ├── index/             # Tab 1: Today 今日主页
│   ├── habits/            # Tab 2: Habits 习惯库
│   ├── habit-detail/      # 习惯详情页
│   ├── habit-complete/    # 打卡完成庆祝页
│   ├── week/              # Tab 3: Week 周统计
│   └── you/               # Tab 4: You 个人中心
├── styles/
│   └── theme.wxss         # 全局 CSS 变量与设计 Tokens (Light/Dark)
├── utils/
│   ├── i18n.js            # 国际化语言驱动器
│   └── storage.js         # 本地持久化与习惯状态管理器
├── app.js                 # 全局应用入口与主题监听
├── app.json               # 页面路由与窗口配置
└── app.wxss               # 全局样式规范与重置
```

---

## 🚀 微信小程序上架登记指引

针对**个人主体**开发者，可直接按以下信息在微信公众平台配置：
- **小程序名称**：`EgoHabits微习惯`
- **服务类目**：`工具 > 备忘录` 或 `工具 > 记事`（免资质审查，提交即审）
- **简介**：把习惯养成做得更轻一点。无压力微习惯打卡、生活小事关照与每周成长记录工具。
- **隐私指引**：全数据本地离线存储，不采集个人隐私信息。

---

## 📄 授权与声明
本项目设计规范与像素级视觉参考 Troy《MORU》设计作品，代码实现由独立开发者遵循 Apache-2.0 / MIT 开源精神自主构建。
