import 'babel-polyfill';
import eachLimit from 'async/eachLimit';

import './index.scss';
import viewer from './viewer';
import props from './props';
import settings from './settings';
import Room from './room';
import * as THREE from './lib/three';
import timeline from './lib/timeline';
import storage from './storage';

window.THREE = THREE;

const tl = timeline([
  { time: 2000, name: 'rotate-camera', angle: 90 },
  { time: 4000, name: 'rotate-camera', angle: 180 },
  { time: 6000, name: 'rotate-camera', angle: 0 },
]);

props.prepare(() => {
  storage.loadPlaylist('curated', (error, playlist) => {
    if (error) console.log(error);
    const { loopLength, holeHeight, roomDepth, roomOffset } = settings;
    viewer.camera.position.y = holeHeight;


    const rooms = playlist.map(url => new Room(url));
    eachLimit(rooms, 4, (room, callback) => room.load(callback), () => {
      console.log('done');
    });

    const then = Date.now();
    viewer.events.on('tick', () => {
      const time = Date.now() - then;
      tl.tick(time % loopLength);
      const offset = 0.5;
      const ratio = (time / loopLength) - offset;
      viewer.camera.position.z = (ratio * roomDepth) + roomOffset;
      rooms.forEach(room => room.gotoTime(time));
    });
  });
});
