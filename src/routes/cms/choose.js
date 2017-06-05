/** @jsx h */
import { h, render } from 'preact';

import hud from '../../hud';
import router from '../../router';
import Choose from './containers/Choose';

export default (req) => (
  {
    hud: {
      muteButton: false,
      aboutButton: false,
    },
    mount: () => {
      render((
        <Choose
          roomIndex={req.params.roomId}
          goHome={() => router.navigate('/')}
        />
      ), hud.elements.hud);
    },

    unmount: () => { },
  }
);
