/** @jsx h */
import { h, render } from 'preact';

import Review from '../../containers/Review';

export default (goto) => {
  let root;
  const component = {
    mount: () => {
      root = render((
        <Review
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
