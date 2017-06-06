const record = require('./record').default;
const playback = require('./playback').default;

export default {
  routes: {
    '/record/:roomIndex?/:hideHead?': record,
    '/:roomIndex?/:id?': playback,
  },
  components: { record, playback }
};