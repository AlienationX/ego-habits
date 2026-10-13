// components/habit-icon/habit-icon.js
// Icons are inlined as data-URI SVGs: local .svg file paths inside
// -webkit-mask-image do not render on real devices (only in devtools).
const ICONS = {
  home: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M4 10.5 L12 4 L20 10.5 V19 C20 19.5 19.5 20 19 20 H5 C4.5 20 4 19.5 4 19 V10.5 Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 20 V14 C10 13.5 10.5 13 11 13 H13 C13.5 13 14 13.5 14 14 V20" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  grid: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="6.6" height="6.6" rx="1.6" stroke="#000000" stroke-width="2"/><rect x="13.4" y="4" width="6.6" height="6.6" rx="1.6" stroke="#000000" stroke-width="2"/><rect x="4" y="13.4" width="6.6" height="6.6" rx="1.6" stroke="#000000" stroke-width="2"/><rect x="13.4" y="13.4" width="6.6" height="6.6" rx="1.6" stroke="#000000" stroke-width="2"/></svg>',
  chart: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M5 19 V14" stroke="#000000" stroke-width="2.2" stroke-linecap="round"/><path d="M12 19 V8" stroke="#000000" stroke-width="2.2" stroke-linecap="round"/><path d="M19 19 V4" stroke="#000000" stroke-width="2.2" stroke-linecap="round"/></svg>',
  user: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="7.5" r="3.8" stroke="#000000" stroke-width="2"/><path d="M5 19.5 C5 16 8 14 12 14 C16 14 19 16 19 19.5" stroke="#000000" stroke-width="2" stroke-linecap="round"/></svg>',
  arrow: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M9 5 L15 12 L9 19" stroke="#000000" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  back: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M15 5 L9 12 L15 19" stroke="#000000" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  bell: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M18 16 V11 C18 7.68 15.31 5 12 5 C8.69 5 6 7.68 6 11 V16 L4 18 H20 L18 16 Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 19 C10 20.1 10.9 21 12 21 C13.1 21 14 20.1 14 19" stroke="#000000" stroke-width="2" stroke-linecap="round"/></svg>',
  settings: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M8.2 3 H15.8 L21 8.2 V15.8 L15.8 21 H8.2 L3 15.8 V8.2 Z" stroke="#000000" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="12" r="2.8" stroke="#000000" stroke-width="2"/></svg>'
};

function buildIconUrl(name) {
  const svg = ICONS[name] || ICONS.home;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

Component({
  properties: {
    name: {
      type: String,
      value: 'home',
      observer: 'updateIcon'
    },
    size: {
      type: Number,
      value: 42
    },
    color: {
      type: String,
      value: '',
      observer: 'updateColor'
    },
    active: {
      type: Boolean,
      value: false,
      observer: 'updateColor'
    }
  },

  data: {
    iconUrl: buildIconUrl('home'),
    resolvedColor: '#8E928A'
  },

  lifetimes: {
    attached() {
      this.updateIcon();
      this.updateColor();
    }
  },

  methods: {
    updateIcon() {
      const name = this.properties.name || 'home';
      this.setData({
        iconUrl: buildIconUrl(name)
      });
    },

    updateColor() {
      if (this.properties.color) {
        this.setData({ resolvedColor: this.properties.color });
      } else if (this.properties.active) {
        this.setData({ resolvedColor: '#FFFFFF' });
      } else {
        this.setData({ resolvedColor: '#8E928A' });
      }
    }
  }
});
