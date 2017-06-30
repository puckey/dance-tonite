import * as serializer from '../utils/serializer';
import InstancedItem from '../instanced-item';
import audio from '../audio';

const getFrame = (frames, number) => {
  let frame = frames[number];
  // Check if data is still a string:
  if (frame[0] === '[') {
    frame = frames[number] = JSON.parse(frame);
  }
  return frame;
};

const POSE = serializer.createPose();

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

  get count() {
    if (this.needsUpdate) {
      this.update();
    }
    return this._count || 0;
  }

  update() {
    const { frames } = this.frames;
    const { time, maxLayers } = this;
    const frameCount = frames && frames.length;
    if (!frameCount) return;
    const frameNumber = Math.min(frameCount - 1, this.secondsToFrame(time));
    const lowerNumber = Math.floor(frameNumber);
    const higherNumber = Math.ceil(frameNumber);
    if (
      !frames ||
      frameCount <= higherNumber ||
      frameNumber === this.frameNumber
    ) return;
    this.frameNumber = frameNumber;
    const lower = this.lower = getFrame(frames, lowerNumber);
    this.higher = getFrame(frames, higherNumber);
    this.ratio = frameNumber % 1;
    this._count = maxLayers != null
      ? Math.min(maxLayers, serializer.count(lower))
      : serializer.count(lower);
    this.needsUpdate = false;
  }

  getPose(performanceIndex, limbIndex, offset, applyMatrix, pose = POSE) {
    if (this.needsUpdate) this.update();
    const [position, quaternion] = pose;
    const { lower, higher, ratio } = this;
    serializer.avgPosition(
      lower,
      higher,
      ratio,
      performanceIndex,
      limbIndex,
      offset,
      position
    );
    if (applyMatrix) {
      position.applyMatrix4(InstancedItem.group.matrix);
    }
    serializer.avgQuaternion(
      lower,
      higher,
      ratio,
      performanceIndex,
      limbIndex,
      quaternion
    );
    return pose;
  }
}
