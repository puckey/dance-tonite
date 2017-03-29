import 'babel-polyfill';

import './index.scss';
import viewer from './viewer';
import props from './props';
import settings from './settings';

props.prepare(() => {
  const { holeHeight, depth } = settings.space;
  viewer.camera.position.y = holeHeight;
  props.space.position.y = settings.space.height * 0.5;
  viewer.scene.add(props.space);
  const then = Date.now();
  viewer.events.on('tick', () => {
    const loopLength = 8000;
    const time = (Date.now() - then) % loopLength;
    const ratio = time / loopLength;
    viewer.camera.position.z = -1 * ((ratio * depth) - (depth / 2));
  });
});
