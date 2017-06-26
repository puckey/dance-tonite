import RecordFlow from '../RecordFlow';
import PlaybackFlow from '../PlaybackFlow';
import Submission from '../Submission';

export default {
  '/record/:roomId?/:hideHead?': RecordFlow,
  '/:roomId?/:id?': PlaybackFlow,
  '/submission/:roomId?/:id?': Submission,
};
