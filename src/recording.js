import { serializeMatrix } from './utils/serializer';

import audio from './audio';
import viewer from './viewer';
import { Matrix4 } from './lib/three';
import layout from './room/layout';

let stopped = false;
let frames;
let frameNumber;

let left = serializeMatrix(new Matrix4());
let right = serializeMatrix(new Matrix4());

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
      addFrame(head);
    }
  }
};

const recording = {
  setup({ roomIndex, hideHead }) {
    this.frames = [];
    this.roomIndex = roomIndex;
    frames = null;
    frameNumber = null;
    stopped = false;
    this.hideHead = hideHead;
    this.totalFrames = Math.round(audio.duration * 90);
  },

  tick() {
    if (stopped) return;
    const head = serializeMatrix(viewer.camera.matrixWorld);
    const [leftController, rightController] = viewer.controllers;
    if (leftController.matrixWorld) {
      left = serializeMatrix(leftController.matrixWorld);
    }
    if (rightController.matrixWorld) {
      right = serializeMatrix(rightController.matrixWorld);
    }
    if (!frames || audio.looped) {
      if (frames) fillMissingFrames(audio.duration, head);
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
    addFrame(head);
    fillMissingFrames(audio.time, head);
  },

  stop() {
    stopped = true;
  },

  exists() {
    return !!recording.frames;
  },

  destroy() {
    recording.frames = null;
  },

  serialize() {
    return [{
      count: this.frames[0] ? (this.frames[0].length / 21) : 0,
      loopIndex: layout.loopIndex(this.roomIndex),
      hideHead: this.hideHead,
    }]
      .concat(this.frames);
  },
};

export default recording;
