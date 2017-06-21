const record = require('./record').default;
const playback = require('./playback').default;
const giffer = require('./giffer').default;

export default {
  routes: {
    '/record/:roomId?/:hideHead?': record,
    '/giffer/:id?': giffer,
    '/:roomId?/:id?': playback,
  },
  components: { record, playback },
};
