import 'babel-polyfill';

import './index.scss';
import viewer from './viewer';
import props from './props';

props.prepare(() => {
  viewer.scene.add(props.space);
});
