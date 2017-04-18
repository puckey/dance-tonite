import emitter from 'mitt';
import Room from '../room';
import Orb from '../orb';
import audio from '../audio';
import audioSrc from '../public/sound/lcd-loop.ogg';
import viewer from '../viewer';
import settings from '../settings';
import Recording from '../recording';
import { Color } from '../lib/three';
import createTimeline from '../lib/timeline';
import createTutorial from '../tutorial';
import bindControllerEvents from '../binding';

const RECORD_COLOR = new Color(0, 1, 0);
const WAIT_COLOR = new Color(0, 0, 1);

const RS_WAITING = Symbol('waiting');
const RS_RECORDING = Symbol('recording');
const RS_REVIEWING = Symbol('reviewing');
const RS_SUBMITTING = Symbol('submitting');

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

    const recordEvents = emitter();
    const setState = stateEvent( recordEvents );

    const tutorial = createTutorial( recordEvents );
    viewer.controllers[ 0 ].add( tutorial.rhand );
    viewer.controllers[ 1 ].add( tutorial.lhand );


    let recordState = setState( RS_WAITING );

    const bindings = {
      right: {
        thumbpaddown: function(){
          //  currently submitting, throw out input
          if( recordState === RS_SUBMITTING ){
            return;
          }

          recordState = setState( advanceRecordState( recordState ) );

          if( recordState === RS_SUBMITTING ){
            performSubmit();
          }
        }
      },
      left: {
        thumbpaddown: function(){
          if( recordState === RS_REVIEWING ){
            performRedo();
          }
        }
      }
    };

    bindControllerEvents( bindings.right, viewer.controllers[ 0 ] );
    bindControllerEvents( bindings.left, viewer.controllers[ 1 ] );

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

    function performSubmit(){
      //  TODO / FIXME
      //  This is only to simulate a submit function
      window.setTimeout( function(){
        recordState = setState( RS_WAITING );
      }, 2000 );
    }

    function performRedo(){
      //  TODO / FIXME
      //  implement a redo
    }
  },

  unmount: () => {
    room.destroy();
    orb.destroy();
    viewer.events.off('tick', tick);
  },
};

function advanceRecordState( recordState, events ){
  switch( recordState ){
    case RS_WAITING:
      return RS_RECORDING;
    case RS_RECORDING:
      return RS_REVIEWING;
    case RS_REVIEWING:
      return RS_SUBMITTING;
  }
}

function stateEvent( events ){
  return function( recordState ){
    switch( recordState ){
      case RS_WAITING:
        events.emit('waiting');
        break;
      case RS_RECORDING:
        events.emit('recording');
        break;
      case RS_REVIEWING:
        events.emit('reviewing');
        break;
      case RS_SUBMITTING:
        events.emit('submitting');
        break;
    }
    return recordState;
  }
}