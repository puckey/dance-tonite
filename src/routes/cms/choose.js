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
          roomId={req.params.roomId}
          goHome={() => router.navigate('/')}
        />
      ), hud.elements.hud);
    },

    unmount: () => {
      render(() => null, hud.elements.hud, root);
    },
  }
);
