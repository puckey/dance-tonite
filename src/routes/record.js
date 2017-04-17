import Room from '../room';
import Orb from '../orb';
import audio from '../audio';
import audioSrc from '../public/sound/lcd-loop.ogg';
import viewer from '../viewer';
import settings from '../settings';
import Recording from '../recording';
import Props from '../props';
import { Color } from '../lib/three';
import createTimeline from '../lib/timeline';
import * as SDFText from '../sdftext';

const RECORD_COLOR = new Color(0, 1, 0);
const WAIT_COLOR = new Color(0, 0, 1);

const { roomDepth, roomOffset } = settings;

let room;
let orb;
let orb2;
let tick;
let recording;
const timeline = createTimeline([
  {
    time: 0,
    callback: () => {
      room.changeColor(WAIT_COLOR);
      orb2.fadeOut();
    },
  },
  {
    time: 1,
    callback: () => {
      room.changeColor(RECORD_COLOR);
    },
  },
]);

export default {
  hud: {},

  mount: () => {
    viewer.camera.position.z = 0;
    viewer.switchCamera('default');
    recording = new Recording();
    room = new Room({ recording });
    orb = new Orb();
    orb2 = new Orb();
    orb2.mesh.material.color = new Color(1, 0.5, 1);
    audio.load(
      {
        src: audioSrc,
        loops: 2,
      },
      loadError => {
        if (loadError) throw loadError;
        audio.play();
        viewer.events.on('tick', tick);
      }
    );

    const textCreator = SDFText.creator();
    const { rhand, lhand } = createHandsInstructions( textCreator );

    viewer.controllers[ 0 ].add( rhand );
    viewer.controllers[ 1 ].add( lhand );

    tick = () => {
      audio.tick();
      room.gotoTime(audio.time);
      const progress = audio.progress - 1; // value between -1 and 1
      timeline.tick(audio.progress);

      const z = (progress - 0.5) * roomDepth + roomOffset;
      orb.move(z);
      orb2.move(z + roomDepth * 2);

      recording.tick();
    };
  },

  unmount: () => {
    room.destroy();
    orb.destroy();
    viewer.events.off('tick', tick);
  },
};

function createHandsInstructions( textCreator ){

  const rhand = Props.controller.clone();
  const lhand = Props.controller.clone();
  rhand.add( textCreator.create('press to record'.toUpperCase() ) );

  return { rhand, lhand };
}