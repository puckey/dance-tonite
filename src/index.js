import 'babel-polyfill';

import './theme/index.scss';
import viewer from './viewer';
import props from './props';
import settings from './settings';
import Room from './room';
import * as THREE from './lib/three';
import Orb from './orb';
import audio from './audio';
import audioSrc from './public/sound/lcd-14loops.mp3';
import Playlist from './playlist';

window.THREE = THREE;

props.on('loaded', () => {
  viewer.switchCamera('ortographic');

  audio.load({
    src: audioSrc,
    loops: 16,
  }, (loadError) => {
    if (loadError) throw loadError;

    const orb = new Orb();

    const playlist = new Playlist('curated', () => {
      audio.play();
    });

    const { roomDepth, roomOffset } = settings;
    const tick = () => {
      audio.tick();
      playlist.tick();
      const z = ((audio.progress - 1.5) * roomDepth) + roomOffset;
      viewer.camera.position.z = z;
      orb.move(z);
    };

    viewer.events.on('tick', tick);
  });
});
