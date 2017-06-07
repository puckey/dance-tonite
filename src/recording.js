import { serializeMatrix } from './utils/serializer';

import audio from './audio';
import viewer from './viewer';

let stopped = false;
let frames;
let frameNumber;

//  If the hand controllers lose tracking then they become empty objects
//  which means they have no matrices! So we need to hold on to “last good”
//  versions of their matrices for recording purposes. Easiest way to do
//  was to bring left and right into this outer-scope and only update them
//  if we’re receiving good data. Side effect is we no longer need to pass
//  them into functions below because they are already accessible.
//  We’re initializing them with pre-serialized position + orientation:
let left = [0, 0, 0, 0, 0, 0, 1];
let right = [0, 0, 0, 0, 0, 0, 1];

const addFrame = (head) => {
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

const fillMissingFrames = (time, head) => {
  const totalFrames = Math.round(time * 90);
  const diff = totalFrames - frameNumber;
  if (diff > 1) {
    for (let i = 0; i < (diff - 1); i++) {
      frameNumber++;
      addFrame(head);// left and right no longer need to be passed because of new scope.
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
    if (viewer.controllers[0].matrixWorld !== undefined) {
      left = serializeMatrix(viewer.controllers[0].matrixWorld);
    }
    if (viewer.controllers[1].matrixWorld !== undefined) {
      right = serializeMatrix(viewer.controllers[1].matrixWorld);
    }
    if (!frames || audio.looped) {
      if (frames) fillMissingFrames(audio.duration, head);// left and right now global.
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
    addFrame(head);// left and right no longer need to be passed because of new scope.
    fillMissingFrames(audio.time, head);// left and right now global.
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
      .concat(this.frames)
      .map(JSON.stringify)
      .join('\n');
  },
};

export default recording;
