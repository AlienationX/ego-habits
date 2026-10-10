Component({
  properties: {
    name: {
      type: String,
      value: 'guide',
      observer: 'updateSrc'
    },
    size: {
      type: Number,
      value: 120
    },
    animate: {
      type: Boolean,
      value: false
    }
  },

  data: {
    imageSrc: '/assets/characters/guide.svg'
  },

  lifetimes: {
    attached() {
      this.updateSrc();
    }
  },

  methods: {
    updateSrc() {
      const name = this.properties.name || 'guide';
      this.setData({
        imageSrc: `/assets/characters/${name}.svg`
      });
    }
  }
});
