import * as THREE from '../lib/three';

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
} from '../theme/colors';

import layout from './layout';
import dummyTextureUrl from '../public/dummy.png';
import InstancedItem from '../instanced-item';
import Frames from './frames';
import { createPose } from '../utils/serializer';
import audio from '../audio';

let items;

const roomOffset = new THREE.Vector3(0, settings.roomHeight * 0.5, 0);

const debugMesh = new THREE.Mesh(
  new THREE.BoxGeometry(0, 0, 0),
  new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load(dummyTextureUrl),
  })
);
debugMesh.frustumCulled = false;

const POSE = createPose();
const FIRST_POSE = createPose();

const lerpPose = (
  [positionA, quaternionA],
  [positionB, quaternionB],
  ratio
) => {
  positionA.lerp(positionB, ratio);
  quaternionA.slerp(quaternionB, ratio);
};

export default class Room {
  constructor({ id, recording, index, single = false, wall = false, isGiffing = false }) {
    this._worldPosition = new THREE.Vector3();
    this.index = recording ? recording.roomIndex : index;
    this.insideMegaGrid = layout.insideMegaGrid(this.index);
    this.single = single;
    const frames = this.frames = new Frames(id, recording);
    this.firstFrame = frames.getFrame(0);
    this.frame = frames.getFrame();
    this.costumeColor = getCostumeColor(this.index);
    this.position = layout.getPosition(
      index,
      new THREE.Vector3(),
      single
    );

    const position = tempVector()
      .add(this.position)
      .add(roomOffset);
    position.y -= 1;
    const type = layout.getType(index);
    if (type === 'PLANE') return;
    items.room.add([position, null], getRoomColor(this.index));
    if (single || wall || layout.hasWall(index)) {
      items.wall.add([position, null], getRoomColor(this.index));
    }
    Room.isGiffing = isGiffing;
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

  changeColor(color) {
    items.room.changeColor(this.index, color);
    items.wall.changeColor(this.index, color);
  }

  getHeadPosition(index, applyMatrix = true) {
    return this.frame.getHeadPose(index, this.position, applyMatrix)[0];
  }

  getRHandPosition(index, applyMatrix = true) {
    return this.frame.getRHandPose(index, this.position, applyMatrix)[0];
  }

  getLHandPosition(index, applyMatrix = true) {
    return this.frame.getLHandPose(index, this.position, applyMatrix)[0];
  }

  transformToHead(object, layerIndex) {
    const [position, rotation] = this.frame.getHeadPose(
      layerIndex,
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

  gotoTime(seconds, maxLayers) {
    this.currentTime = seconds;
    // In orthographic mode, scale up the meshes:
    const scale = InstancedItem.perspectiveMode ? 1 : 1.3;

    const { position, frame, costumeColor } = this;
    frame.gotoTime(seconds, maxLayers);
    const { hideHead } = this.frames;
    for (let i = 0; i < frame.count; i++) {
      const color = this.isHighlighted(i) ? highlightColor : costumeColor;
      if (!hideHead) {
        const pose = this.getPose(i, 0, position);
        items.head.add(pose, color, scale);
      }
      items.hand.add(this.getPose(i, 1, position), color, scale);
      items.hand.add(this.getPose(i, 2, position), color, scale);
    }
  }

  getPose(performanceIndex, limbIndex, offset) {
    this.frame.getPose(performanceIndex, limbIndex, offset, false, POSE);
    if (this.insideMegaGrid && !this.single) {
      const RISE_TIME = 184.734288;
      const ratio = Math.max(0, Math.min(2, audio.time - RISE_TIME)) * 0.5;
      this.firstFrame.getPose(
        performanceIndex,
        limbIndex,
        offset,
        false,
        FIRST_POSE
      );
      FIRST_POSE[0].y *= ratio;
      lerpPose(POSE, FIRST_POSE, 1 - ratio);
    }
    return POSE;
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
  items.hand.empty();
  items.head.empty();
};

Room.reset = () => {
  InstancedItem.reset();
  Room.setHighlight();
  setIdentityMatrix(InstancedItem.group);

  if (!items) {
    items = {
      wall: new InstancedItem(
        layout.roomCount,
        props.perspectiveWall,
        props.orthographicWall
      ),
      room: new InstancedItem(
        layout.roomCount,
        props.perspectiveRoom,
        props.orthographicRoom
      ),
      head: new InstancedItem(
        layout.roomCount * 10,
        props.head,
      ),
      hand: new InstancedItem(
        layout.roomCount * 10 * 2,
        props.hand,
      ),
    };
  }
  // if (!Room.isGiffing) viewer.scene.add(roomsGroup);

  // Move an extra invisible object3d with a texture to the end of scene's children
  // array in order to solve a texture glitch as described in:
  // https://github.com/puckey/you-move-me/issues/129
  if (!Room.isGiffing) viewer.scene.add(debugMesh);
};

Room.rotate180 = () => {
  set180RotationMatrix(InstancedItem.group);
};

Room.highlight = {};

Room.setHighlight = (highlight) => {
  if (!highlight) return;
  const [room, performance] = highlight;
  Room.highlight.roomIndex = room;
  Room.highlight.performanceIndex = performance;
};

Room.getGroup = () => InstancedItem.group;
