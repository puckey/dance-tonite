import RecordFlow from '../RecordFlow';
import Playback from '../Playback';
import Submission from '../Submission';

export default {
  '/record/:roomId?/:hideHead?': RecordFlow,
  '/:roomId?/:id?': Playback,
  '/submission/:roomId?/:id?': Submission,
};
