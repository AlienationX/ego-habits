Component({
  properties: {
    name: {
      type: String,
      value: 'home',
      observer: 'updateIcon'
    },
    size: {
      type: Number,
      value: 42 // 21px * 2 = 42rpx default from design system Image 08
    },
    color: {
      type: String,
      value: ''
    },
    active: {
      type: Boolean,
      value: false,
      observer: 'updateColor'
    }
  },

  data: {
    iconUrl: '/assets/icons/home.svg',
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
        iconUrl: `/assets/icons/${name}.svg`
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
