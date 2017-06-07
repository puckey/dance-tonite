const record = require('./record').default;
const playback = require('./playback').default;

export default {
  routes: {
    '/record/:loopIndex?/:hideHead?': record,
    '/:loopIndex?/:id?': playback,
  },
  components: { record, playback }
};