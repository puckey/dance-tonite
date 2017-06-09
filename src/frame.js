import * as serializer from './utils/serializer';
import InstancedItem from './instanced-item';
import audio from './audio';

const POSITION_ROTATION = [null, null];

const getFrame = (frames, number) => {
  let frame = frames[number];
  // Check if data is still a string:
  if (frame[0] === '[') {
    frame = frames[number] = JSON.parse(frame);
  }
  return frame;
};

export default class Frame {
  constructor(frames, seconds) {
    this.frames = frames;
    if (seconds !== undefined) {
      this.gotoTime(seconds);
    }
  }

  gotoTime(seconds, maxLayers) {
    this.time = seconds;
    this.maxLayers = maxLayers;
    this.needsUpdate = true;
  }

  secondsToFrame(seconds) {
    return (seconds % (audio.loopDuration * 2)) * this.frames.fps;
  }

  getHeadPose(index, offset, applyMatrix = true) {
    return this.getPose(index, 0, offset, applyMatrix);
  }

  getRHandPose(index, offset, applyMatrix = true) {
    return this.getPose(index, 1, offset, applyMatrix);
  }

  getLHandPose(index, offset, applyMatrix = true) {
    return this.getPose(index, 2, offset, applyMatrix);
  }

  get count() {
    if (this.needsUpdate) {
      this.update();
    }
    return this._count;
  }

  update() {
    const { frames } = this.frames;
    const { time, maxLayers } = this;
    const frameNumber = this.secondsToFrame(time);
    const lowerNumber = Math.floor(frameNumber);
    const higherNumber = Math.ceil(frameNumber);
    if (
      !frames ||
      frames.length <= lowerNumber ||
      frameNumber === this.frameNumber
    ) return;
    this.frameNumber = frameNumber;
    const lower = this.lower = getFrame(frames, lowerNumber);
    this.higher = getFrame(frames, higherNumber);
    this.ratio = frameNumber % 1;
    this._count = maxLayers !== undefined
      ? Math.min(maxLayers, serializer.count(lower))
      : serializer.count(lower);
    this.needsUpdate = false;
  }

  getPose(performanceIndex, limbIndex, offset, applyMatrix) {
    if (this.needsUpdate) this.update();
    const { lower, higher, ratio } = this;
    const position = POSITION_ROTATION[0] = serializer.avgPosition(
      lower,
      higher,
      ratio,
      performanceIndex,
      limbIndex,
      offset
    );
    if (applyMatrix) {
      position.applyMatrix4(InstancedItem.group.matrix);
    }
    POSITION_ROTATION[1] = serializer.avgQuaternion(
      lower,
      higher,
      ratio,
      performanceIndex,
      limbIndex
    );

    return POSITION_ROTATION;
  }
}
