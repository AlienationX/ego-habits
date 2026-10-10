# AGENTS.md - Development & Architecture Guidelines for EgoHabits

This document provides architectural rules, coding standards, and operational guidelines for AI agents and human contributors working on the **EgoHabits** WeChat Mini Program codebase.

---

## 1. Project Philosophy & Core Constraints

1. **Design Integrity (1:1 Fidelity)**:
   - Always adhere strictly to the 8px spatial rhythm defined in the design system (`8px`, `16px`, `24px`, `32px`, `40px`).
   - Use tokenized colors only. Never hardcode random hex values outside the defined design palette.
   - Respect visual weights: cards feature subtle border radiuses (typically `24rpx` to `36rpx`), buttons use pill shapes (`999rpx`), and navigation tabs use compact pill containers.

2. **Zero-Backend / Local-First Principle**:
   - The primary data engine is `utils/storage.js` using `wx.getStorageSync` and `wx.setStorageSync`.
   - Never introduce external HTTP API dependencies for core habit tracking features unless explicitly asked to integrate cloud syncing.
   - The app must work 100% offline at 0ms latency.

3. **Bilingual (i18n) by Design**:
   - Never hardcode user-facing copy directly into WXML without referencing the translation dictionaries in `locales/en.js` and `locales/zh.js`.
   - When introducing new text, add entries to both `locales/en.js` and `locales/zh.js` simultaneously.

4. **Light & Dark Theme Engine**:
   - All styling must be driven by CSS Variables defined in `styles/theme.wxss` (`var(--bg-page)`, `var(--text-primary)`, `var(--card-bg)`, etc.).
   - Support both automatic system theme following (`wx.onThemeChange`) and manual user overrides saved in storage.

---

## 2. Directory Structure Conventions

```
ego-habits/
├── assets/
│   ├── characters/        # Standalone vector SVG files for all 10 characters
│   └── icons/             # Standalone vector SVG files for 7 everyday icons
├── components/            # Reusable UI components (character, custom-tabbar, etc.)
├── locales/               # en.js and zh.js translation dictionaries
├── pages/                 # Mini program pages
├── styles/
│   └── theme.wxss         # CSS custom properties for Light/Dark modes
├── utils/
│   ├── i18n.js            # Translation helper & event emitter
│   └── storage.js         # Local-First habit storage and streak service
├── app.js                 # App lifecycle, theme/i18n bootstrap
├── app.json               # Routing, custom navigation configuration
└── app.wxss               # Global reset, typography, and theme injection
```

---

## 3. Data Schema Specifications (`utils/storage.js`)

### User Profile (`KEY_PROFILE`)
```json
{
  "nickname": "Avery Lane",
  "handle": "@averytakesitsteady",
  "avatar": "avatar",
  "theme": "auto",       // "auto" | "light" | "dark"
  "language": "en"       // "en" | "zh"
}
```

### Habit Object (`KEY_HABITS`)
```json
[
  {
    "id": "water",
    "titleKey": "habits.water.title",
    "subtitleKey": "habits.water.sub",
    "category": "rest",
    "character": "water",
    "completedToday": false,
    "metric": "250 ml",
    "frequency": "Daily",
    "tintColor": "blue"
  }
]
```

### Check-in Records (`KEY_CHECKINS`)
```json
{
  "2026-10-10": ["water", "move"],
  "2026-10-09": ["water", "read", "move"]
}
```

---

## 4. Multi-Platform & Skyline Compatibility Rules

1. **Flexbox Strictness**:
   - Because `app.json` uses `"renderer": "skyline"`, always layout containers using `display: flex;` with explicit `flex-direction`.
   - Avoid `float`, `position: sticky` edge cases, or complex `calc()` that might trigger Skyline layout bugs.
2. **Safe Area Insets**:
   - Bottom floating elements (e.g., custom TabBar, fixed CTA buttons) MUST accommodate iPhone Home Bar:
     ```css
     padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
     ```
3. **Responsive Limits**:
   - For PC WeChat or iPad screen sizes, wrap main scroll areas with `max-width: 600px; margin: 0 auto;` to prevent unnatural horizontal stretching.

---

## 5. Visual Characters Reference

| Key | Description | Hex / Colors |
| :--- | :--- | :--- |
| `guide` | Arch-shaped waving character | `#4FA65A` |
| `water` | Smiling blue water cup | `#CCE6ED`, `#232323` |
| `celebrate` | High-hands cheering water cup | `#6BBCE8`, `#232323` |
| `shoe` | Green running shoe with face | `#4FA65A`, `#BAD8BE` |
| `book` | Light green book with bookmark | `#BAD8BE`, `#4FA65A` |
| `pillow` | Soft cream toast/pillow | `#F5F5ED`, `#232323` |
| `hourglass` | Green sand hourglass | `#4FA65A`, `#CCE6ED` |
| `cloud` | Mint serene cloud | `#BAD8BE`, `#232323` |
| `medal` | Ruffled green medal with ribbons | `#4FA65A`, `#DCE8BD` |
| `avatar` | Apple/bean avatar with leaf | `#6BC47B`, `#232323` |

Always preserve this design system when extending features.
