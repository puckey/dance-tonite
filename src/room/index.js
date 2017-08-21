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
import easeBackInOut from 'eases/back-in-out';
import easeSineInOut from 'eases/sine-in-out';
import easeBounceOut from 'eases/bounce-out';
import easeBackOut from 'eases/back-out';

import * as THREE from '../../third_party/threejs/three';

import props from '../props';
import {
  tempVector,
  setIdentityMatrix,
  set180RotationMatrix,
  worldToScreen,
} from '../utils/three';
import windowSize from '../utils/windowSize';
import viewer from '../viewer';
import settings from '../settings';
import {
  getCostumeColor,
  getRoomColor,
  highlightColor,
  waitRoomColor,
} from '../theme/colors';

import layout from './layout';
import dummyTextureUrl from '../public/dummy.png';
import InstancedItem from '../instanced-item';
import Frames from './frames';
import { createPose } from '../utils/serializer';
import audio from '../audio';
import { elasticIn } from '../utils/easing';

let items;
const UP_EULER = new THREE.Euler(Math.PI * 0.5, 0, 0);

const roomOffset = new THREE.Vector3(0, settings.roomHeight * 0.5, 0);
const SCRATCH_QUATERNION = new THREE.Quaternion();

const debugMesh = new THREE.Mesh(
  new THREE.BoxGeometry(0, 0, 0),
  new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load(dummyTextureUrl),
  })
);
debugMesh.frustumCulled = false;

const POSE = createPose();
const LAST_POSE = createPose();
const FIRST_POSE = createPose();
const SHADOW_EULER = new THREE.Euler(Math.PI * 0.5, 0, 0);
const SHADOW_COLOR = new THREE.Color(0xffffff);
const minY = 0.2;

const lerpPose = (
  [positionA, quaternionA],
  [positionB, quaternionB],
  ratio,
  quaternionRatio = ratio,
) => {
  if (ratio === 0) return;
  positionA.lerp(positionB, ratio);
  quaternionA.slerp(quaternionB, quaternionRatio);
};

const step = function (t, min, max) {
  return min + (max - min) * t;
};

export default class Room {
  constructor(params) {
    const {
      id,
      recording,
      index,
      colorIndex = params.index,
      single = false,
      showFrontWall = false,
      showBackWall = false,
      showRoom = true,
      morph = true,
    } = params;
    this.morph = !!morph;
    this._worldPosition = new THREE.Vector3();
    this.index = params.single ? 0 : index;
    this.insideMegaGrid = layout.insideMegaGrid(this.index);
    this.single = single;
    this.showFrontWall = showFrontWall;
    this.showBackWall = showBackWall;
    this.showRoom = showRoom;
    const frames = this.frames = new Frames(id, recording);
    this.firstFrame = frames.getFrame(0);
    this.lastFrame = frames.getFrame((settings.loopDuration * 2) - 0.001);
    this.frame = frames.getFrame();
    this.random = Math.random();
    this.costumeColor = getCostumeColor(colorIndex);
    this.currentRoomColor = this.roomColor = getRoomColor(colorIndex);
    this.position = layout.getPosition(
      index,
      new THREE.Vector3(),
      single
    );
    const position = tempVector()
      .add(this.position)
      .add(roomOffset);
    position.y -= 1;

    this.roomPosition = position.clone();
    this.roomPose = [this.roomPosition, null];

    if (this.insideMegaGrid) {
      this.dropTimes = [];
      for (let i = 0; i < 20; i++) {
        this.dropTimes.push(Math.random() * 0.2);
      }
      this.riseTime = settings.colorTimes[layout.getSynthIndex(this.index)];
    }
  }

  load(callback) {
    this.frames.load(callback);
  }

  get worldPosition() {
    return this._worldPosition
      .copy(this.position)
      .applyMatrix4(InstancedItem.group.matrix);
  }

  isHighlighted(performance) {
    return Room.highlight.roomIndex === this.index
      && Room.highlight.performanceIndex === performance;
  }

  changeColorToWaiting() {
    this.changeColor(waitRoomColor);
  }

  changeColorToRecording() {
    this.changeColor(this.roomColor);
  }

  changeColor(color) {
    this.currentRoomColor = color;
  }

  getHeadPosition(index, applyMatrix = true) {
    return this.frame.getHeadPose(index, this.position, applyMatrix)[0];
  }

  transformToHead(object, layerIndex) {
    const [position, rotation] = this.getPose(
      layerIndex,
      0,
      this.position,
      false
    );
    object.position.copy(position);
    object.quaternion.copy(rotation);
  }

  // To be used in orthographic mode:
  isVisibleOnScreen() {
    const coords = this.getScreenCoordinates();
    return coords.x > 0 && coords.x < windowSize.width;
  }

  getScreenCoordinates() {
    return worldToScreen(viewer.camera, this.worldPosition);
  }

  gotoTime(seconds, maxLayers, highlightLast = false) {
    this.currentTime = seconds;

    if (settings.shouldCull && this.cullRoom()) {
      return;
    }

    const { currentRoomColor, roomPose } = this;
    if (this.showRoom) {
      items.room.add(roomPose, currentRoomColor);
    }

    if (this.showFrontWall) {
      items.frontWall.add(roomPose, currentRoomColor);
    }

    if (this.showBackWall) {
      items.backWall.add(roomPose, currentRoomColor);
    }

    // In orthographic mode, scale up the meshes:
    const scale = InstancedItem.perspectiveMode ? 1 : 1.5;

    const { position, frame, costumeColor } = this;
    frame.gotoTime(seconds, maxLayers);
    const { hideHead } = this.frames;
    for (let i = 0; i < frame.count; i++) {
      const isLast = i === frame.count - 1;
      const color = ((highlightLast && isLast) || this.isHighlighted(i))
        ? highlightColor
        : costumeColor;

      if (!hideHead) {
        const pose = this.getPose(i, 0, position);
        if (!pose) continue;
        items.head.add(pose, color, scale);
        this.setShadowPose(pose, position, i);
      }

      const rhandPose = this.getPose(i, 1, position);
      if (!rhandPose) continue;
      items.hand.add(rhandPose, color, scale);
      this.setShadowPose(rhandPose, position, i, 1, true);

      const lhandPose = this.getPose(i, 2, position);
      items.hand.add(lhandPose, color, scale);
      this.setShadowPose(lhandPose, position, i, 2, true);
    }
  }

  getPose(performanceIndex, limbIndex, offset, applyMatrix = false) {
    const { frame } = this;
    if (!frame.isLoaded()) return;
    frame.getPose(performanceIndex, limbIndex, offset, applyMatrix, POSE);

    // Morph the beginning of the first performance with the end of the last:
    if (this.morph && performanceIndex === 0 && this.frames.complete) {
      this.lastFrame.getPose(frame.count - 1, limbIndex, offset, applyMatrix, LAST_POSE);
      let { morphDuration } = this;
      if (!morphDuration) {
        const [position] = frame.getPose(0, limbIndex, offset, applyMatrix);
        const distance = Math.min(2, position.distanceTo(LAST_POSE[0])) * 0.5;
        morphDuration = this.morphDuration = Math.max(0.01, distance * 0.3);
      }
      const overlapRatio = Math.min(morphDuration, frame.loopRatio)
          * (1 / this.morphDuration);
      const rotationDuration = morphDuration > 0.1 ? 0.08 : 0.05;
      const rotationRatio = (Math.min(rotationDuration, frame.loopRatio)) * (1 / rotationDuration);
      const easer = morphDuration > 0.1 ? easeBackInOut : easeSineInOut;
      lerpPose(
        POSE,
        LAST_POSE,
        easer(1 - overlapRatio),
        easer(1 - rotationRatio)
      );
    }

    if (this.insideMegaGrid && !this.single) {
      this.risePerformance(performanceIndex, limbIndex, offset, applyMatrix);
      this.dropPerformance(performanceIndex);
    }
    return POSE;
  }

  setShadowPose(copyPose, position, index, sub = 0, small) {
    // no shadows if disabled, or in VR mode
    if (Room.shouldUseShadow() === false) {
      return;
    }

    const objHeight = copyPose[0].y;

    copyPose[0].y = 0.01;
    copyPose[1].setFromEuler(SHADOW_EULER);

    // shadowPower -> 0 to 1, based on how high off the ground
    const shadowPower = Math.min(Math.max(objHeight / 2.5, 0), 1.0);
    const shadowSize = Math.max(step(shadowPower, 0.5, 1.0) * (small ? 0.6 : 1), 0.001);
    const shadowDarkness = step(shadowPower, 0.3, 0.15);
    SHADOW_COLOR.setRGB(shadowDarkness, shadowDarkness, shadowDarkness);
    items.shadow.add(copyPose, SHADOW_COLOR, shadowSize * 3);
  }

  dropPerformance(performanceIndex) {
    if (audio.time < settings.dropTime) return;
    const dropTime = settings.dropTime + this.dropTimes[performanceIndex];

    const ratio = Math.max(0,
      Math.min(1,
        audio.time - dropTime
      )
    );
    if (ratio === 0) return;
    const rotationRatio = Math.max(0,
      Math.min(1,
        audio.time - dropTime
      )
    );
    const [position, quaternion] = POSE;
    position.y = Math.max(minY, position.y * (1 - easeBounceOut(ratio)));

    SCRATCH_QUATERNION.copy(quaternion).setFromEuler(UP_EULER);
    quaternion.slerp(SCRATCH_QUATERNION, easeBackOut(Math.min(1, rotationRatio)));
  }

  risePerformance(performanceIndex, limbIndex, offset, applyMatrix) {
    const ratio = Math.max(0,
      Math.min(5,
        audio.time - this.riseTime
      )
    ) * 0.2;
    if (ratio === 0) {
      this.firstFrame.getPose(performanceIndex, limbIndex, offset, applyMatrix, POSE);
      const [position, quaternion] = POSE;
      position.y = minY;
      quaternion.setFromEuler(UP_EULER);
    } else {
      this.firstFrame.getPose(performanceIndex, limbIndex, offset, applyMatrix, FIRST_POSE);
      const [position, quaternion] = FIRST_POSE;
      position.y = Math.max(position.y * ratio, minY);
      quaternion.setFromEuler(UP_EULER);
      lerpPose(POSE, FIRST_POSE,
        ratio === 1
          ? 1 - ratio
          : elasticIn(1 - ratio)
      );
    }
  }

  cullRoom() {
    const z = this.position.z + viewer.cameraWorldPos.z;
    const x = this.position.x - viewer.cameraWorldPos.x;
    return (z * z + x * x) > (settings.cullDistance * settings.cullDistance);
  }

  destroy() {
    for (const i in items) {
      items[i].empty();
    }
    if (this.frames) this.frames.cancel();
  }
}

Room.clear = () => {
  if (!items) return;
  items.room.empty();
  items.frontWall.empty();
  items.backWall.empty();
  items.hand.empty();
  items.head.empty();
  if (settings.useShadow) {
    items.shadow.empty();
  }

  //  webvr polyfill will break if transparency is set ...
  //  ???
  if (settings.useShadow) {
    items.shadow.mesh.material.transparent = Room.shouldUseShadow();
  }
};

Room.reset = () => {
  InstancedItem.reset();
  Room.setHighlight();
  setIdentityMatrix(InstancedItem.group);

  if (!items) {
    items = {
      room: new InstancedItem(
        'rooms',
        layout.roomCount,
        props.perspectiveRoom,
        props.orthographicRoom,
      ),
      frontWall: new InstancedItem(
        'front-walls',
        layout.roomCount,
        props.perspectiveWall,
        props.orthographicWall,
      ),
      backWall: new InstancedItem(
        'back-walls',
        layout.roomCount,
        props.perspectiveBackWall,
      ),
      head: new InstancedItem(
        'heads',
        layout.roomCount * 10,
        props.head,
      ),
      hand: new InstancedItem(
        'hands',
        layout.roomCount * 10 * 2,
        props.hand,
      ),
    };

    if (settings.useShadow) {
      items.shadow = new InstancedItem(
        'shadows',
        layout.roomCount * 30,
        props.shadow,
      );
    }
  }

  // Move an extra invisible object3d with a texture to the end of scene's children
  // array in order to solve a texture glitch as described in:
  // https://github.com/puckey/you-move-me/issues/129
  viewer.scene.add(debugMesh);
};

Room.shouldUseShadow = () => !!settings.useShadow && !viewer.vrEffect.isPresenting;

Room.rotate180 = () => {
  set180RotationMatrix(InstancedItem.group);
};

Room.highlight = {};

Room.setHighlight = (highlight) => {
  if (highlight) {
    const [room, performance] = highlight;
    Room.highlight.roomIndex = room;
    Room.highlight.performanceIndex = performance;
  } else {
    Room.highlight.roomIndex = null;
    Room.highlight.performanceIndex = null;
  }
};
