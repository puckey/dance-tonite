/** @jsx h */
import { h, render } from 'preact';

import Record from '../../containers/Record';

export default (goto, req) => {
  let root;
  const component = {
    mount: () => {
      root = render((
        <Record
          roomIndex={parseInt(req.params.roomIndex, 10)}
          hideHead={/no/.test(req.params.hideHead)}
          goto={goto}
        />
      ), document.body);
    },

    unmount: () => {
      render(() => null, document.body, root);
    },
  };

  return component;
};
