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
      for (let i = 0; i < frames.length; i++) {
        this.frames[i] = this.frames[i].concat(frames[i]);
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
      frame = [...head, ...left, ...right];
      frames.push(frame);
    } else {
      frame = frames[frameNumber];
      for (let i = 0; i < head.length; i++) {
        frame.push(head[i]);
      }
      for (let i = 0; i < left.length; i++) {
        frame.push(left[i]);
      }
      for (let i = 0; i < right.length; i++) {
        frame.push(right[i]);
      }
    }
  },

  stop() {
    stopped = true;
  },

  toJson() {
    return JSON.stringify([{
      count: this.frames[0].length / 21,
    }].concat(this.frames));
  },

  reset() {
    this.frames = [];
    frames = null;
    frameNumber = null;
    stopped = false;
  },
};

recording.reset();

export default recording;
