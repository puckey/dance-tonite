const record = require('./record').default;
const playback = require('./playback').default;
const giffer = require('./giffer').default;

export default {
  routes: {
    '/record/:roomIndex?/:hideHead?': record,
    '/giffer/:id?': giffer,
    '/:roomIndex?/:id?': playback,
  },
  components: { record, playback },
};
