/** @jsx h */
import { h, render } from 'preact';

import Publish from '../../containers/Publish';

export default () => {
  let root;
  const component = {
    mount: () => {
      root = render((
        <Publish />
      ), document.body);
    },

    unmount: () => {
      render(() => null, document.body, root);
    },
  };

  return component;
};
