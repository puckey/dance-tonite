import 'babel-polyfill';
import eachLimit from 'async/eachLimit';

import './index.scss';
import viewer from './viewer';
import props from './props';
import settings from './settings';
import Room from './room';
import * as THREE from './lib/three';
import storage from './storage';
import timeline from './lib/timeline';

const tl = timeline([
  { time: 2000, name: 'switch-camera', camera: 'ortographic' },
  { time: 4000, name: 'switch-camera', camera: 'perspective' },
  { time: 6000, name: 'switch-camera', camera: 'ortographic' },
  { time: 6000, name: 'switch-camera', camera: 'perspective' },
]);

tl.on('switch-camera', ({ camera }) => {
  Room.switchModel(camera === 'ortographic'
    ? 'ortographic'
    : 'default',
  );

  viewer.switchCamera(camera);
});

window.THREE = THREE;

props.prepare(() => {
  storage.loadPlaylist('curated', (error, playlist) => {
    if (error) throw error;
    const { loopLength, roomDepth, roomOffset } = settings;

    const rooms = playlist.map(url => new Room(url, {
      showHead: !/head\=false/.test(url)
    }));
    eachLimit(rooms, 4, (room, callback) => room.load(callback), (loadError) => {
      if (error) throw loadError;
      // Done loading rooms
    });

    const then = Date.now();
    viewer.events.on('tick', () => {
      const time = Date.now() - then;
      const offset = 0.5;
      const ratio = (time / loopLength) - offset;
      viewer.camera.position.z = (ratio * roomDepth) + roomOffset;
      rooms.forEach(room => room.gotoTime(time));
      tl.tick(time % loopLength);
    });
  });
});
