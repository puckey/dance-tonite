/** @jsx h */
import { h, render } from 'preact';

import hud from '../../hud';
import router from '../../router';
import Inbox from '../containers/Inbox';

export default (req) => {
  let root;
  return {
    hud: {
      muteButton: false,
      aboutButton: false,
    },
    mount: () => {
      root = render((
        <Inbox
          roomId={req.params.roomId ? parseInt(req.params.roomId, 10) : null}
          recordingId={req.params.recordingId}
          goHome={() => router.navigate('/')}
        />
      ), hud.elements.hud);
    },

    unmount: () => {
      render(() => null, hud.elements.hud, root);
    },
  };
};
