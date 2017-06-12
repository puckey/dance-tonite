/** @jsx h */
import { Component } from 'preact';

import Orb from '../../../../orb';
import audio from '../../../../audio';
import viewer from '../../../../viewer';
import Room from '../../../../room';
import settings from '../../../../settings';
import createTimeline from '../../../../lib/timeline';
import layout from '../../../../room/layout';
import feature from '../../../../utils/feature';

const { roomDepth, roomOffset } = settings;

const state = {};
const objects = {};

const colorTimeline = createTimeline([
  {
    time: 0,
    callback: () => {
      objects.orb2.fadeOut();
      objects.orb.fadeIn();
    },
  },
]);

const tick = () => {
  audio.tick();
  Room.clear();
  room.gotoTime(audio.time);
  colorTimeline.tick(audio.progress);
  const progress = audio.progress - 1; // value between -1 and 1

  const z = (progress - 0.5) * -roomDepth - roomOffset;
  objects.orb.position.z = z;
  if (audio.totalProgress > 1) {
    objects.orb2.position.z = z - roomDepth * 2;
  }
};

let room;

export default class RoomComponent extends Component {
  componentDidMount() {
    this.mounted = true;
    this.asyncMount(this.props);
  }

  componentWillUnmount() {
    this.mounted = false;
    console.log('unmounted');
    objects.orb.destroy();
    objects.orb2.destroy();
    viewer.camera.position.copy(state.originalCameraPosition);
    viewer.camera.zoom = state.originalZoom;
    viewer.camera.updateProjectionMatrix();
    audio.reset();
    audio.fadeOut();
    if (room) {
      room.destroy();
    }
    viewer.camera.position.y = 0;
    viewer.camera.zoom = 1;
    viewer.camera.updateProjectionMatrix();
    viewer.events.off('tick', tick);
    // Room.reset();
  }

  async asyncMount({ recording }) {
    Room.reset();
    objects.orb = new Orb();
    objects.orb2 = new Orb();
    if (!viewer.vrEffect.isPresenting) viewer.switchCamera('orthographic');
    state.originalCameraPosition = viewer.camera.position.clone();
    state.originalZoom = viewer.camera.zoom;
    viewer.camera.position.y = 2;
    viewer.camera.position.z = 1.3;

    viewer.camera.zoom = 0.7;
    viewer.camera.updateProjectionMatrix();
    Room.rotate180();
    await audio.load({
      src: `/public/sound/room-${layout.loopIndex(recording.room)}.${feature.isChrome ? 'ogg' : 'mp3'}`,
      loops: 2,
      loopOffset: 0.5,
    });
    if (!this.mounted) return;
    audio.play();
    room = new Room({
      url: recording.id,
      index: recording.room,
      single: true,
    });
    room.load();
    viewer.events.on('tick', tick);
  }
}
