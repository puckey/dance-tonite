/** @jsx h */
import { h, render } from 'preact';

import RecordFlow from '../containers/RecordFlow';
import * as SDFText from '../sdftext';

export default (req) => {
  let root;
  const component = {
    mount: () => {
      SDFText.loadFontTexture();
      root = render((
        <RecordFlow
          roomId={parseInt(req.params.roomId, 10)}
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
