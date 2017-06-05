const choose = require('./cms/choose').default;
const playback = require('./playback').default;

export default {
  routes: {
    '/choose/:roomId': choose,
    '/:loopIndex?/:id?': playback,
  },
  components: { playback, choose },
};
