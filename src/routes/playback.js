/** @jsx h */
import { h, render } from 'preact';

import router from '../router';
import Playback from '../containers/Playback';

export default (req) => {
  let root;
  return {
    hud: {
      muteButton: false,
      aboutButton: false,
    },
    mount: () => {
      root = render((
        <Playback
          roomId={req.params.roomId ? parseInt(req.params.roomId, 10) : null}
          recordingId={req.params.recordingId}
        />
      ), document.body);
    },

    unmount: () => {
      render(() => null, document.body, root);
    },
  };
};
