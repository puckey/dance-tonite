const choose = require('./cms/choose').default;
const inbox = require('./cms/inbox').default;
const playback = require('./playback').default;

export default {
  routes: {
    '/inbox/:roomId?/:recordingId?': inbox,
    '/choose/:roomId': choose,
    '/:loopIndex?/:id?': playback,
  },
  components: { playback, choose, inbox },
};
