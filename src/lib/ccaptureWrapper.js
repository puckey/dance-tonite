import GIF from 'gif.js';
import CCapture from 'ccapture.js';
import * as THREE from './three';


//  Our capture settings:

const width = 512;
const height = 512;
const duration = 16; // Unit is Seconds.
const fps = 30;
const startFrame = 4 * fps;


//  This is a temporary shim so I can re-use the tutorial animation
//  for making these test recordings.
//  That animation's FPS target is 60.

const fpsOriginal = 60;
const fpsRatio = fpsOriginal / fps;
let fpsDelta = 0;


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
let capturerHasStarted = false;
let capturerHasFinished = false;
setTimeout(() => {
  capturer = new CCapture({
    verbose: true, // false
    display: true,
    framerate: fps,
    // motionBlurFrames: (960 / fps),
    quality: 100,
    format: 'gif', // 'gif', WTF GIF NO WORK?!
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


//  To save frames, call capture(scene, camera)
//  from inside your own animation loop:

let currentFrame = 0;
function capture(scene, camera) {
  //  This fps ratio business is a quick temporary hack
  //  so I can re-use exiting tutorial animation for testing.
  if (fpsDelta === fpsRatio) {
    fpsDelta = 0;
    currentFrame++;
    if (capturer !== undefined) {
      if (currentFrame >= startFrame) {
        if (capturerHasStarted !== true) {
          capturer.start();
          capturerHasStarted = true;
        }
        if (currentFrame <= startFrame + fps * duration) {
          renderer.render(scene, camera);
          capturer.capture(renderer.domElement);
        } else if (capturerHasFinished !== true && currentFrame >= fps * duration) {
          capturerHasFinished = true;
          //  NOTE: capturer will automatically stop and CONSOLE.LOG AN ERROR
          //  if you initialize capturer with a timeLimit and/or frameLimit
          //  and then hit those limits, then manually call stop().
          capturer.stop();
          capturer.save();
        }
      }
    }
  }
  fpsDelta++;
}

export default capture;
