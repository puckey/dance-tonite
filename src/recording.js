import { serializeMatrix } from './utils/three';

import audio from './audio';
import viewer from './viewer';

export default class Recording {
  constructor() {
    this.layers = [];
  }

  tick() {
    if (!this.frames || audio.looped) {
      this.frameNumber = 0;
      this.frames = [];
      this.layers.push(this.frames);
    } else {
      this.frameNumber++;
    }
    const { frameNumber, frames } = this;
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
  }
}
