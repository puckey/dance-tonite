/** @jsx h */
import { h, render } from 'preact';

import hud from '../../hud';
import router from '../../router';
import Inbox from './containers/Inbox';

const latestRecordingId = '1030183816095-9085ceb6';
const latestRoomId = '2';

export default (req) => {
  let root;
  return {
    hud: {
      muteButton: false,
      aboutButton: false,
    },
    mount: () => {
      if (!req.params.recordingId || !req.params.roomId) {
        setTimeout(() => router.navigate(`/inbox/${latestRoomId}/${latestRecordingId}`));
        return;
      }

      const unreadCount = 25;
      // TODO fetch unread count

      root = render((
        <Inbox
          unreadCount={unreadCount}
          roomId={req.params.roomId}
          recordingId={req.params.recordingId}
          goHome={() => router.navigate('/')}
        />
      ), hud.elements.hud);
    },

    unmount: () => {
      if (req.params.recordingId) render(() => null, hud.elements.hud, root);
    },
  };
};
