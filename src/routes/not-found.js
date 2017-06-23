/** @jsx h */
import { h, render } from 'preact';

import NotFound from '../containers/NotFound';

export default () => {
  let root;
  return {
    mount: () => {
      root = render((
        <NotFound />
      ), document.body);
    },

    unmount: () => {
      render(() => null, document.body, root);
    },
  };
};
