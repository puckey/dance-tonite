import GIF from 'gif.js';
import CCapture from 'ccapture.js';
import Room from '../room';
import Orb from '../orb';
import settings from '../settings';
import createTimeline from '../lib/timeline';
import { waitRoomColor, recordRoomColor } from '../theme/colors';
import * as THREE from '../lib/three';
import audio from '../audio';//  Would love to get rid of this!!

// import renderFrame from './../lib/gif-main-thread';

export default (req) => {
  //

  //  Our capture settings:

  const width = 512;
  const height = 512;
  const duration = 16; //  Unit is Seconds.
  const fps = 20;
  const workers = 64;
  // const audioLoopDuration = 8.0043537414966;


  //  So what dance do we plan on rendering and exporting?
  //  Default dance is the Tutorial recording.
  //  http://localhost:3000/giffer/1030266141029-b5ba6ff6

  const id = req.params.id ? req.params.id : '1030266141029-b5ba6ff6';
  console.log('Using this dance Id:', id);


  //  We need our own renderer with dimensions
  //  equal to our target output GIF dimensions.

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setClearColor(0x000000);
  renderer.setPixelRatio(1); // window.devicePixelRatio
  renderer.setSize(width, height);
  renderer.sortObjects = false;
  // document.body.appendChild(renderer.domElement);


  //  We also need our own camera. One that has a fixed aspect ratio,
  //  our own custom positions, and that doesn’t change on window resize!
  //  ie. We can’t re-use viewer.camera.

  const orthographicDistance = 4;
  const aspectRatio = width / height;
  const camera = new THREE.OrthographicCamera(
    -orthographicDistance * aspectRatio,
    orthographicDistance * aspectRatio,
    orthographicDistance,
    -orthographicDistance,
    -100,
    1000,
  );
  camera.position.set(0.06, 0.08, 0.08);
  camera.lookAt(new THREE.Vector3());


  const scene = new THREE.Scene();
  const light = new THREE.DirectionalLight(0xffffff);
  light.position.set(-1.42, 1.86, 0.74).normalize();

  const ambientLight = new THREE.AmbientLight(0x444444, 0.7);
  const hemisphereLight = new THREE.HemisphereLight(0x606060, 0x404040);

  scene.add(hemisphereLight);
  scene.add(light, ambientLight);
  scene.fog = new THREE.Fog(0x000000, 0, 75);


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

  let gifFrame = 0;
  let gifProgress = 0;
  const capturer = new CCapture({
    verbose: false,
    display: true,
    framerate: fps,
    // motionBlurFrames: (960 / fps),
    quality: 95,
    format: 'gif', //  webm gif
    workers: workers,
    workersPath: '../lib/',
    // timeLimit: 10000 * duration,
    // frameLimit: 10000 * duration * fps,
    autoSaveTime: 0,


    //  This is for my render tests.
    //  Can take it out for production.

    onProgress: function (p) {
      window.progress = p;
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


  const { roomDepth, roomOffset } = settings;
  let room;
  const state = { minLayers: 0 };
  const objects = {};

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
    //  What percentage of our GIF have we rendered?
    //  Because our GIF timeline covers TWO rooms
    //  worth of time we’re multiplying by 2.

    gifProgress = gifFrame / (duration * fps);
    const gifRoomProgress = gifProgress * 2;


    if (gifFrame > 0 && gifFrame <= duration * fps) {
      //  Play this room’s dance for this specific moment.
      Room.clear();
      room.gotoTime(
        // gifRoomProgress * audioLoopDuration,
        gifRoomProgress * audio.loopDuration,
        Math.max(
          state.minLayers,
          Math.ceil((gifProgress / 2) % 3)
        )
      );


      //  What color should the room be? (Active vs Inactive.)

      const progress = gifRoomProgress - 1; // value between -1 and 1
      colorTimeline.tick(gifProgress);


      //  Move that orb!

      const z = (progress - 0.5) * -roomDepth - roomOffset;
      objects.orb.move(z);
      if (gifProgress > 1) {
        objects.orb2.move(z - roomDepth * 2);
      }
    }

    //  Export some frames.

    gifFrame++;
    if (gifFrame > 0 && gifFrame <= duration * fps) {
      if (gifFrame === 1) {
        console.log('Render GIF frames BEGIN');
        capturer.start();
      }
      renderer.render(scene, camera);
      capturer.capture(renderer.domElement);
      if (gifFrame === duration * fps) {
        console.log('Render GIF frames END');
        capturer.stop();
        capturer.save();
      }
    }
    window.requestAnimationFrame(tick);
  };


  const component = {
    mount: async () => {
      Room.reset();
      Room.rotate180();
      room = new Room({
        url: `${id}.json`,
        showHead: true,
        index: 0,
        recording: false,
        isGiffing: true,
      });
      room.changeColor(waitRoomColor);
      room.load();
      scene.add(Room.getGroup());
      window.scene = scene;


      //  FIX: Even though we aren’t actually using the audio,
      //  we have to load the audio file so audio.js can report
      //  loopDuration to room.js....

      if (!audio.loopDuration) {
        await Promise.all([
          audio.load({
            src: '/public/sound/room-1.ogg',
            loops: 2,
            loopOffset: 0.5,
          }),
        ]);
      }


      //  Get your orb on.

      objects.orb = new Orb();
      objects.orb2 = new Orb();


      //  we'll keep these here so what you see matches what is being exported:
      // viewer.switchCamera('orthographic');
      //   state.originalCameraPosition = viewer.camera.position.clone();
      //   state.originalZoom = viewer.camera.zoom;
      // viewer.camera.position.y = 2;
      // viewer.camera.position.z = 1.3;
      // viewer.camera.zoom = 0.7;
      // viewer.camera.updateProjectionMatrix();

      state.originalCameraPosition = camera.position.clone();
      state.originalZoom = camera.zoom;
      camera.position.y = 2;
      camera.position.z = 1.3;
      camera.zoom = 0.7;
      camera.updateProjectionMatrix();

      // viewer.events.on('tick', tick);
      tick();
    },
    unmount: () => {
      component.destroyed = true;
      objects.orb.destroy();
      objects.orb2.destroy();
      // viewer.camera.position.copy(state.originalCameraPosition);
      // viewer.camera.zoom = state.originalZoom;
      // viewer.camera.updateProjectionMatrix();
      if (room) {
        room.destroy();
      }
      // viewer.camera.position.y = 0;
      // viewer.camera.zoom = 1;
      // viewer.camera.updateProjectionMatrix();
      // viewer.events.off('tick', tick);
    },
  };

  return component;
};
