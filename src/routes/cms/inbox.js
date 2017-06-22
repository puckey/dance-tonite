/** @jsx h */
import { h, render } from 'preact';

import Inbox from '../../containers/Inbox';

export default (req) => {
  let root;
  return {
    mount: () => {
      root = render((
        <Inbox
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
