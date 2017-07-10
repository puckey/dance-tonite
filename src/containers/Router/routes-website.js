import RecordFlow from '../RecordFlow';
import PlaybackFlow from '../PlaybackFlow';
import Gallery from '../Gallery';

export default {
  '/': PlaybackFlow,
  '/gallery/:id?': Gallery,
  '/record/:roomId/:hideHead?': RecordFlow,
  '/:roomId/:id': PlaybackFlow,
};
