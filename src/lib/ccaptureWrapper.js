import CCapture from 'ccapture.js';
// import * as GIF from './gif';
import * as THREE from './three';


//  Our capture settings:

const width = 1280;
const height = 1080;
const duration = 16; //  Unit is Seconds.
const fps = 30;


//  We need our own renderer with dimensions
//  equal to our target output size.

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor(0x000000);
renderer.setPixelRatio(1); // window.devicePixelRatio
renderer.setSize(width, height);
renderer.sortObjects = false;


//  Now we can setup our CCapture instance.

const capturer = new CCapture({
  verbose: true, // false
  display: true,
  framerate: fps,
  // motionBlurFrames: (960 / framerate),
  quality: 100,
  format: 'png', // 'gif', WTF GIF NO WORK?!
  workersPath: '../lib/',
  timeLimit: duration,
  frameLimit: duration * fps,
  autoSaveTime: 0,
  onProgress: function (p) {
    console.log('GIF completed:', `${p * 100}%`);
  },
});
capturer.start();

window.capturer = capturer;
window.renderer = renderer;


//  To save frames, call capture(scene, camera)
//  from inside your animation loop:

let currentFrame = 0;
function capture(scene, camera) {
  // console.log('currentFrame', currentFrame);
  if (currentFrame < fps * duration) {
    renderer.render(scene, camera);
    capturer.capture(renderer.domElement);
  } else if (currentFrame >= fps * duration) {
    capturer.stop();
    capturer.save();
  }
  currentFrame++;
}

export default capture;
