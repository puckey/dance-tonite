import { serializeMatrix } from './utils/serializer';

import audio from './audio';
import viewer from './viewer';

let stopped = false;
let frames;
let frameNumber;

const addFrame = (head, left, right) => {
  if (frames.length <= frameNumber) {
    frames.push([...head, ...left, ...right]);
  } else {
    const frame = frames[frameNumber];
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
};

const fillMissingFrames = (time, head, left, right) => {
  const totalFrames = Math.round(time * 90);
  const diff = totalFrames - frameNumber;
  if (diff > 1) {
    for (let i = 0; i < (diff - 1); i++) {
      frameNumber++;
      addFrame(head, left, right);
    }
  }
};

const recording = {
  setup({ loopIndex, hideHead }) {
    this.frames = [];
    this.loopIndex = loopIndex;
    frames = null;
    frameNumber = null;
    stopped = false;
    this.hideHead = hideHead;
    this.totalFrames = Math.round(audio.duration * 90);
  },

  tick() {
    if (stopped) return;
    const head = serializeMatrix(viewer.camera.matrixWorld);
    const left = serializeMatrix(viewer.controllers[0].matrixWorld);
    const right = serializeMatrix(viewer.controllers[1].matrixWorld);
    if (!frames || audio.looped) {
      if (frames) fillMissingFrames(audio.duration, head, left, right);
      frameNumber = 0;
      if (frames) {
        for (let i = 0; i < frames.length; i++) {
          const frame = frames[i];
          this.frames[i] = this.frames[i]
            ? this.frames[i].concat(frame)
            : frame;
        }
      }
      frames = [];
    } else {
      frameNumber++;
    }
    addFrame(head, left, right);
    fillMissingFrames(audio.time, head, left, right);
  },

  stop() {
    stopped = true;
  },

  serialize() {
    return [{
      count: this.frames[0] ? (this.frames[0].length / 21) : 0,
      loopIndex: this.loopIndex,
      hideHead: this.hideHead,
    }]
      .concat(this.frames);
  },
};

export default recording;
