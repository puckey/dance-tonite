const choose = require('./cms/choose').default;
const inbox = require('./cms/inbox').default;
const submissions = require('./cms/submissions').default;
const playback = require('./playback').default;
const publish = require('./cms/publish').default;
const secret = require('./cms/secret').default;

if (process.env.NODE_ENV === 'development') {
  require('preact/devtools');
}

export default {
  routes: {
    '/publish': publish,
    '/secret': secret,
    '/inbox/:recordingId?': inbox,
    '/choose/:roomId': choose,
    '/submissions/': submissions,
    '/:roomId?/:id?': playback,
  },
  components: { playback, choose, inbox },
};
