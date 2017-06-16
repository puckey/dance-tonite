/** @jsx h */
import { h, render } from 'preact';

import hud from '../../hud';
import Submissions from '../containers/Submissions';

export default () => {
  let root;
  return {
    hud: {
      muteButton: false,
      aboutButton: false,
    },
    mount: () => {
      root = render((
        <Submissions />
      ), hud.elements.hud);
    },

    unmount: () => {
      render(() => null, hud.elements.hud, root);
    },
  };
};
