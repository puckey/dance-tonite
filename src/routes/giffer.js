import GIF from 'gif.js';
import CCapture from 'ccapture.js';
import router from '../router';
import Room from '../room';
import Orb from '../orb';
import audio from '../audio';
import viewer from '../viewer';
import settings from '../settings';
import hud from '../hud';
import createTimeline from '../lib/timeline';
import { waitRoomColor, recordRoomColor } from '../theme/colors';
import { Vector3, WebGLRenderer, OrthographicCamera } from '../lib/three';
import { sleep } from '../utils/async';
import windowSize from '../utils/windowSize';


export default (req) => {
  //

  //  Our capture settings:

  const width = 1024;
  const height = 1024;
  const duration = 16; // Unit is Seconds.
  const fps = 30;


  //  So what dance do we plan on rendering and exporting?
  //  Default dance is the Tutorial recording.
  //  http://localhost:3000/giffer/1030266141029-b5ba6ff6

  const id = req.params.id ? req.params.id : '1030266141029-b5ba6ff6';


  //  We need our own renderer with dimensions
  //  equal to our target output GIF dimensions.

  const renderer = new WebGLRenderer({ antialias: true });
  renderer.setClearColor(0x000000);
  renderer.setPixelRatio(1); // window.devicePixelRatio
  renderer.setSize(width, height);
  renderer.sortObjects = false;


  //  We also need our own camera. One that has a fixed aspect ratio,
  //  our own custom positions, and that doesn’t change on window resize!
  //  ie. We can’t re-use viewer.camera.

  const orthographicDistance = 4;
  const aspectRatio = width / height;
  const camera = new OrthographicCamera(
    -orthographicDistance * aspectRatio,
    orthographicDistance * aspectRatio,
    orthographicDistance,
    -orthographicDistance,
    -100,
    1000,
  );
  camera.position.set(0.06, 0.08, 0.08);
  camera.lookAt(new Vector3());


  //  BAD: Right now CCapture needs GIF to be a global variable.
  //  This is terrible. Much sadness. Like tears in rain.

  window.GIF = GIF;


  //  These are for my render tests.
  //  Can take them out for production.

  const filename = `${width.toString().padStart(4, '0')}x${height.toString().padStart(4, '0')}-${duration.toString().padStart(2, '0')}sec@${fps}fps-`;
  console.log(filename);
  let timeBegan;
  let timeEnded;


  //  Now we can setup our CCapture instance.

  let capturer;
  let gifFrame = 0;
  let gifProgress = 0;
  setTimeout(() => {
    capturer = new CCapture({
      verbose: false,
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


  const { roomDepth, roomOffset } = settings;

  const getLineTransform = (x1, y1, x2, y2, margin) => {
    const length = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)) - margin;
    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    return `translate(${x1}px, ${y1}px) rotate(${angle}deg) scaleX(${length / 100})`;
  };


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


    //  What percentage of our GIF have we rendered?

    gifProgress = gifFrame / (duration * fps);


    //  Because our GIF timeline covers TWO rooms
    //  worth of time we’re multiplying by 2.

    const gifRoomProgress = gifProgress * 2;


    room.gotoTime(
      gifRoomProgress * audio.loopDuration,
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


    //  The giffer timeline controls when recording begins and ends.
    //  We pass it a normalized progress float.
    //  If we’re recording then we need to render and capture.

    if (audio.totalProgress >= 0) {
      gifFrame++;
    }
    if (gifFrame > 0 && gifFrame <= duration * fps) {
      if (gifFrame === 1) {
        console.log('Render GIF frames BEGIN');
        capturer.start();
      }
      renderer.render(viewer.scene, camera);
      capturer.capture(renderer.domElement);
      if (gifFrame === duration * fps) {
        console.log('Render GIF frames END');
        capturer.stop();
        capturer.save();
      }
    }
  };

  const updateWindowDimensions = (windowWidth) => {
    state.lineOriginX = windowWidth / 2;
    state.lineOriginY = elements.tutorialText.offsetHeight * 1.2;
  };

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


      //  we'll keep these here so what you see matches what is being exported:
      viewer.switchCamera('orthographic');
      // state.originalCameraPosition = viewer.camera.position.clone();
      // state.originalZoom = viewer.camera.zoom;
      viewer.camera.position.y = 2;
      viewer.camera.position.z = 1.3;
      viewer.camera.zoom = 0.7;
      viewer.camera.updateProjectionMatrix();

      state.originalCameraPosition = camera.position.clone();
      state.originalZoom = camera.zoom;
      camera.position.y = 2;
      camera.position.z = 1.3;
      camera.zoom = 0.7;
      camera.updateProjectionMatrix();


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
        url: `${id}.json`,
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
    },
  };

  return component;
};
