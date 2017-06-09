import router from '../router';
import Room from '../room';
import Orb from '../orb';
import audio from '../audio';
import viewer from '../viewer';
import settings from '../settings';
import hud from '../hud';
import createTimeline from '../lib/timeline';
import { waitRoomColor, recordRoomColor } from '../theme/colors';
import { Vector3 } from '../lib/three';
import { sleep } from '../utils/async';
import windowSize from '../utils/windowSize';
// import capture from '../lib/ccaptureWrapper';

import GIF from 'gif.js';
import CCapture from 'ccapture.js';
// import * as THREE from './three';

//  Our capture settings:

const width = 1024;
const height = 1024;
const duration = 16; // Unit is Seconds.
const fps = 30;


//  These are for my render tests.
//  Can take them out for production.

const filename = `${width.toString().padStart(4, '0')}x${height.toString().padStart(4, '0')}-${duration.toString().padStart(2, '0')}sec@${fps}fps-`;
console.log(filename);
let timeBegan;
let timeEnded;


//  We need our own renderer with dimensions
//  equal to our target output GIF dimensions.

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor(0x000000);
renderer.setPixelRatio(1); // window.devicePixelRatio
renderer.setSize(width, height);
renderer.sortObjects = false;


//  BUG: Right now CCapture needs GIF to be a global variable.
//  This is terrible. Need to patch that!!

window.GIF = GIF;


//  Now we can setup our CCapture instance.

let capturer;
setTimeout(() => {
  capturer = new CCapture({
    verbose: false, // false
    display: true,
    framerate: fps,
    // motionBlurFrames: (960 / fps),
    quality: 100,
    format: 'webm', //  webm gif
    workersPath: '../lib/',
    // timeLimit: 10000 * duration,
    // frameLimit: 10000 * duration * fps,
    autoSaveTime: 0,


    //  This is for my render tests.
    //  Can take it out for production.

    onProgress: function (p) {
      console.log('Render is:', p * 100, '% complete.');
      if (p === 0) {
        timeBegan = new Date();
        console.log('Render started at', timeBegan);
      } else if (p === 1) {
        timeEnded = new Date();
        const timeDuration = new Date(timeEnded - timeBegan);
        console.log(`${filename + timeDuration.getMinutes()}m${timeDuration.getSeconds().toString().padStart(2, '0')}s.gif`);
      }
    },
  });
});


console.log('giffer is loaded');

// TODO: replace with better recording:
const TUTORIAL_RECORDING_URL = '1030266141029-b5ba6ff6.json';
// one of my recents: 3/1027581876754-4dc51d61

const { roomDepth, roomOffset } = settings;

const getLineTransform = (x1, y1, x2, y2, margin) => {
  const length = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)) - margin;
  const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  return `translate(${x1}px, ${y1}px) rotate(${angle}deg) scaleX(${length / 100})`;
};

export default (req) => {
  //
  //
  //  GIF STUF!! ================================================================
  console.log('giffing...');
  // let id = parseInt(req.params.id, 10);
  let id = req.params.id;
  window.req = req;
  if (!id) id = '1030266141029-b5ba6ff6'; // TUTORIAL_RECORDING_URL;
  console.log('exporting this dance:', id);
  window.danceId = id; //  temp for debugging!!
  let gifFrame = 0;
  let gifProgress = 0;

  let getLineTarget;
  let room;
  const state = { minLayers: 0 };
  const elements = {};
  const objects = {};

  const TEMP_VECTOR = new Vector3();
  const worldToScreen = (position) => {
    // map to normalized device coordinate (NDC) space
    TEMP_VECTOR
      .copy(position)
      .project(viewer.camera);
    TEMP_VECTOR.x = (TEMP_VECTOR.x + 1) * (windowSize.width * 0.5);
    TEMP_VECTOR.y = (-TEMP_VECTOR.y + 1) * (windowSize.height * 0.5);

    return TEMP_VECTOR;
  };


  const gifferTimeline = createTimeline([
    {
      time: 0, // 0.5
      callback: () => {
        console.log('start GIF!!');
        capturer.start();
      },
    },
    {
      time: 1, // 1.5
      callback: () => {
        console.log('end GIF!!');
        capturer.stop();
        capturer.save();
      },
    },
  ]);

  const colorTimeline = createTimeline([
    {
      time: 0,
      callback: () => {
        room.changeColor(waitRoomColor);
        objects.orb2.fadeOut();
        objects.orb.fadeIn();
      },
    },
    {
      time: 0.5,
      callback: () => {
        room.changeColor(recordRoomColor);
      },
    },
  ]);

  const tick = () => {
    audio.tick();
    Room.clear();


    gifProgress = gifFrame / (duration * fps);
    // console.log(gifFrame, gifProgress);
    const gifRoomProgress = gifProgress * 2;
    window.gifFrame = gifFrame;
    window.gifProgress = gifProgress;

    window.audio = audio;
    window.audioTime = audio.time;
    room.gotoTime(
      // audio.time,
      gifProgress * 2 * audio.loopDuration,
      Math.max(
        state.minLayers,
        // Math.ceil((audio.totalProgress / 2) % 3)
         Math.ceil((gifProgress / 2) % 3)
      )
    );
    // const progress = audio.progress - 1; // value between -1 and 1
    const progress = gifRoomProgress - 1; // value between -1 and 1
    // colorTimeline.tick(audio.progress);
    colorTimeline.tick(gifProgress);

    const z = (progress - 0.5) * -roomDepth - roomOffset;
    // const z = (gifProgress - 0.5) * -roomDepth - roomOffset;
    objects.orb.move(z);
    // if (audio.totalProgress > 1) {
    if (gifProgress > 1) {
      objects.orb2.move(z - roomDepth * 2);
    }

    if (getLineTarget) {
      const { x, y } = worldToScreen(getLineTarget());
      elements.lineEl.style.transform = getLineTransform(
        state.lineOriginX,
        state.lineOriginY,
        x,
        y,
        state.windowHeight * 0.03
      );
    }

    //  GIF export! =====================================================================
    // gifferTimeline.tick(audio.totalProgress);
    gifferTimeline.tick(gifProgress);
    // if (audio.totalProgress >= 0 && audio.totalProgress <= 2) {
    if (gifFrame >= 0 && gifFrame <= duration * fps) {
      renderer.render(viewer.scene, viewer.camera);
      capturer.capture(renderer.domElement);
    }
    if (audio.totalProgress >= 0) {
      gifFrame++;
    }
  };

  const updateWindowDimensions = (windowWidth) => {
    state.lineOriginX = windowWidth / 2;
    state.lineOriginY = elements.tutorialText.offsetHeight * 1.2;
  };

  // const handleKeyframe = ({ text, getPosition, layers }) => {
  //   // just !text would return true on empty string, so:
  //   if (text !== undefined) {
  //     elements.tutorialText.innerHTML = text;
  //   }
  //   getLineTarget = getPosition;
  //   elements.lineEl.style.opacity = getPosition ? 1 : 0;
  //   if (layers !== undefined) {
  //     state.minLayers = layers;
  //   }
  // };

  const component = {
    mount: async () => {
      Room.reset();
      hud.showLoader();
      objects.orb = new Orb();
      objects.orb2 = new Orb();

      elements.tutorialText = hud.create('div.tutorial-text');
      hud.create('div.close-button',
        {
          onclick: () => router.navigate('/'),
        },
        '×'
      );
      elements.lineEl = hud.create('div.line', {
        style: {
          transform: 'scaleX(0)',
        },
      });

      viewer.switchCamera('orthographic');
      state.originalCameraPosition = viewer.camera.position.clone();
      state.originalZoom = viewer.camera.zoom;
      viewer.camera.position.y = 2;
      viewer.camera.position.z = 1.3;
      viewer.camera.zoom = 0.7;
      viewer.camera.updateProjectionMatrix();

      Room.rotate180();

      await Promise.all([
        audio.load({
          src: '/public/sound/room-1.ogg',
          loops: 2,
          loopOffset: 0.5,
        }),
        sleep(1000),
      ]);
      if (component.destroyed) return;

      hud.hideLoader();

      room = new Room({
        url: `${id}.json`, // TUTORIAL_RECORDING_URL,
        showHead: true,
        index: 0,
        recording: true,
      });
      room.changeColor(waitRoomColor);

      await sleep(2000);
      if (component.destroyed) return;
      room.load();

      audio.play();
      audio.mute();
      audio.fadeIn();

      viewer.events.on('tick', tick);
      windowSize.on('resize', updateWindowDimensions);
      updateWindowDimensions(windowSize);
    },
    unmount: () => {
      component.destroyed = true;
      objects.orb.destroy();
      objects.orb2.destroy();
      viewer.camera.position.copy(state.originalCameraPosition);
      viewer.camera.zoom = state.originalZoom;
      viewer.camera.updateProjectionMatrix();
      windowSize.off('resize', updateWindowDimensions);
      audio.reset();
      audio.fadeOut();
      if (room) {
        room.destroy();
      }
      viewer.camera.position.y = 0;
      viewer.camera.zoom = 1;
      viewer.camera.updateProjectionMatrix();
      viewer.events.off('tick', tick);
      // textTimeline.off('keyframe', handleKeyframe);
    },
  };

  return component;
};
