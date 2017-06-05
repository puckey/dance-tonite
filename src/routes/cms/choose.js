/** @jsx h */
import { h, render } from 'preact';

import hud from '../../hud';
import Choose from './components/Choose';
import router from '../../router';

export default (req) => (
  {
    hud: { },
    mount: () => {
      render((
        <Choose
          roomId={req.params.roomId}
          goHome={() => router.navigate('/')}
        />
      ), hud.elements.hud);
    },

    unmount: () => { },
  }
);
