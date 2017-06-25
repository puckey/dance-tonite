import RecordFlow from '../RecordFlow';
import Playback from '../Playback';

export default {
  '/record/:roomId?/:hideHead?': RecordFlow,
  '/:roomId?/:id?': Playback,
};
