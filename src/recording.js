import { serializeMatrix } from './utils/three';

import audio from './audio';
import viewer from './viewer';

let stopped = false;
let frames;
let frameNumber;

const recording = {
  tick() {
    if (stopped) return;
    if (!frames || audio.looped) {
      frameNumber = 0;
      if (frames) {
        this.layers.push(frames);
      }
      frames = [];
    } else {
      frameNumber++;
    }
    const head = serializeMatrix(viewer.camera.matrixWorld);
    const left = serializeMatrix(viewer.controllers[0].matrixWorld);
    const right = serializeMatrix(viewer.controllers[1].matrixWorld);
    let frame;
    if (frames.length <= frameNumber) {
      frame = [head, left, right];
      frames.push(frame);
    } else {
      frame = frames[frameNumber];
      frame[0] = head;
      frame[1] = left;
      frame[2] = right;
    }
  },

  stop() {
    stopped = true;
  },

  toJson() {
    return JSON.stringify(this.layers);
  },

  reset() {
    this.layers = [];
    frames = null;
    frameNumber = null;
    stopped = false;
  },
};

recording.reset();

export default recording;
