/** @jsx h */
import { h, render } from 'preact';

import Submissions from '../../containers/Submissions';

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
      ), document.body);
    },

    unmount: () => {
      render(() => null, document.body, root);
    },
  };
};
