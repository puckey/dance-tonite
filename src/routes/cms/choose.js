/** @jsx h */
import { h, render } from 'preact';

import hud from '../../hud';
import router from '../../router';
import Choose from './containers/Choose';

let root;

export default (req) => (
  {
    hud: {
      muteButton: false,
      aboutButton: false,
    },
    mount: () => {
      root = render((
        <Choose
          room={parseInt(req.params.roomId, 10)}
          goHome={() => router.navigate('/')}
        />
      ), hud.elements.hud);
    },

    unmount: () => {
      render(() => null, hud.elements.hud, root);
    },
  }
);
