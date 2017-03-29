import 'babel-polyfill';

import './index.scss';
import viewer from './viewer';
import props from './props';
import settings from './settings';

props.prepare(() => {
  const { loopLength, holeHeight, roomDepth } = settings;
  viewer.camera.position.y = holeHeight;
  props.space.position.y = settings.space.height * 0.5;
  viewer.scene.add(props.space);
  const then = Date.now();
  viewer.events.on('tick', () => {
    const time = Date.now() - then;
    const ratio = (time % loopLength) / loopLength;
    viewer.camera.position.z = -((ratio * roomDepth) - (roomDepth * 0.5));
  });
});
