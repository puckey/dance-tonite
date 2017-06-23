/** @jsx h */
import { h, render } from 'preact';

import CMSSecret from '../../containers/CMSSecret';

export default () => {
  let root;
  const component = {
    mount: () => {
      root = render((
        <CMSSecret />
      ), document.body);
    },

    unmount: () => {
      render(() => null, document.body, root);
    },
  };

  return component;
};
