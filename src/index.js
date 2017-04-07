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
import Orb from './orb';
import audio from './lib/audioEngine';
import audioSrc from './public/sound/lcd-14loops.mp3';

window.THREE = THREE;

props.prepare(() => {
  storage.loadPlaylist('curated', (error, playlist) => {
    if (error) throw error;
    const { loopLength, roomDepth, roomOffset } = settings;

    const orb = new Orb();

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
      orb.move(viewer.camera.position.z);
      rooms.forEach(room => room.gotoTime(time));
    });
  });
});
