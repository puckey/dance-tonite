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
import * as serializer from '../utils/serializer';
import InstancedItem from '../instanced-item';
import settings from '../settings';

const getFrame = (frames, number) => {
  let frame = frames[number];
  if (typeof frame === 'string') {
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
    const duration = (settings.loopDuration * 2);
    this.time = seconds % duration;
    this.loopRatio = this.time / duration;
    this.maxLayers = maxLayers;
    this.needsUpdate = true;
  }

  secondsToFrame(seconds) {
    return seconds * this.frames.fps;
  }

  getHeadPose(index, offset, applyMatrix = true) {
    return this.getPose(index, 0, offset, applyMatrix);
  }

  isLoaded() {
    const { frames } = this.frames;
    if (!frames) return false;
    return Math.ceil(this.requestedFrame) <= this.frameCount;
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
    const frameCount = this.frameCount = frames && frames.length;
    const requestedFrame = this.requestedFrame = this.secondsToFrame(time);
    if (!frameCount) return;
    const frameNumber = Math.min(frameCount - 1, requestedFrame);
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
    this.needsUpdate = requestedFrame > frameCount;
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
