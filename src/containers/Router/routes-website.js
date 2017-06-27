import RecordFlow from '../RecordFlow';
import PlaybackFlow from '../PlaybackFlow';

export default {
  '/record/:roomId?/:hideHead?': RecordFlow,
  '/:roomId?/:id?': PlaybackFlow,
};
