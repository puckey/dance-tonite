/** @jsx h */
import { h, render } from 'preact';

import RecordFlow from '../containers/RecordFlow';
import settings from '../settings';
import router from '../router';

export default (req) => {
  let root;
  const component = {
    mount: () => {
      const roomId = parseInt(req.params.roomId, 10);

      // Redirect to homepage if room does not exist:
      if (roomId > settings.roomCount || roomId < 1) {
        router.navigate('/');
        return;
      }
      root = render((
        <RecordFlow
          roomId={roomId}
          hideHead={/no/.test(req.params.hideHead)}
        />
      ), document.body);
    },

    unmount: () => {
      render(() => null, document.body, root);
    },
  };

  return component;
};
