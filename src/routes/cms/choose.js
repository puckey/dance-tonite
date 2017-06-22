/** @jsx h */
import { h, render } from 'preact';

import Choose from '../../containers/Choose';

let root;

export default (req) => (
  {
    mount: () => {
      root = render((
        <Choose
          room={parseInt(req.params.roomId, 10)}
        />
      ), document.body);
    },

    unmount: () => {
      render(() => null, document.body, root);
    },
  }
);
