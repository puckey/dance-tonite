import 'babel-polyfill';

import './index.scss';
import viewer from './viewer';
import props from './props';
import settings from './settings';
import timeline from './lib/timeline';

const tl = timeline([
  { time: 2000, name: 'rotate-camera', angle: 90 },
  { time: 4000, name: 'rotate-camera', angle: 180 },
  { time: 6000, name: 'rotate-camera', angle: 0 },
]);

props.prepare(() => {
  const { loopLength, holeHeight, roomDepth, roomHeight } = settings;
  viewer.camera.position.y = holeHeight;
  props.space.position.y = roomHeight * 0.5;
  viewer.scene.add(props.space);
  tl.on('rotate-camera', ({ angle }) => {
    viewer.camera.rotation.y = angle * Math.PI / 180;
    viewer.camera.updateMatrix();
  });
  const then = Date.now();
  viewer.events.on('tick', () => {
    const time = Date.now() - then;
    tl.tick(time % loopLength);
    const ratio = (time % loopLength) / loopLength;
    viewer.camera.position.z = -((ratio * roomDepth) - (roomDepth * 0.5));
  });
});
