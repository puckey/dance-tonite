/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { serializeMatrix, count } from './utils/serializer';

import audio from './audio';
import viewer from './viewer';
import { Matrix4 } from '../third_party/threejs/three';
import layout from './room/layout';

let stopped = false;
let frames;
let frameNumber;

let left = serializeMatrix(new Matrix4());
let right = serializeMatrix(new Matrix4());

const secondsToFrames = (seconds) => Math.floor(seconds * 90);

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
  const totalFrames = secondsToFrames(time);
  const diff = totalFrames - frameNumber;
  for (let i = 0; i < diff; i++) {
    frameNumber++;
    addFrame(head);
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
    this.count = null;
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
      const framesNeeded = secondsToFrames(audio.time);
      if (framesNeeded - frameNumber < 0) return;
      frameNumber++;
    }
    addFrame(head);
    fillMissingFrames(audio.time, head);
  },

  stop() {
    stopped = true;
    this.count = this.frames[0] ? count(this.frames[0]) : 0;
  },

  exists() {
    return !!recording.frames;
  },

  destroy() {
    recording.frames = null;
  },

  serialize() {
    return [{
      count: this.count,
      loopIndex: this.roomIndex + 1,
      hideHead: this.hideHead,
    }]
      .concat(this.frames);
  },
};

export default recording;
