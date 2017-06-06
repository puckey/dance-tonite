import * as THREE from '../lib/three';

import props from '../props';
import {
  tempVector,
  createInstancedMesh,
  setIdentityMatrix,
  set180RotationMatrix,
} from '../utils/three';
import viewer from '../viewer';
import settings from '../settings';
import {
  getCostumeColor,
  getRoomColor,
  recordCostumeColor,
  recordRoomColor,
  highlightColor,
} from '../theme/colors';
import streamJSON from '../lib/stream-json';
import * as roomUtils from './utils';
import * as serializer from '../utils/serializer';
import layout from './layout';
import dummyTextureUrl from '../public/dummy.png';

const PROTOCOL = location.protocol;

let roomIndex = 0;
let wallMesh;
let wallMeshes;
let roomMesh;
let roomMeshes;
let headMesh;
let handMesh;

const roomOffset = new THREE.Vector3(0, settings.roomHeight * 0.5, 0);
const roomsGroup = new THREE.Group();
roomsGroup.matrixAutoUpdate = false;

const debugMesh = new THREE.Mesh(
  new THREE.BoxGeometry(0, 0, 0),
  new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load(dummyTextureUrl),
  })
);
debugMesh.frustumCulled = false;

export default class Room {
  constructor({ url, recording, index }) {
    this._worldPosition = new THREE.Vector3();

    this.placementIndex = index === undefined
      ? roomIndex
      : index;
    this.index = roomIndex;
    roomIndex += 1;

    this.isRecording = !!recording;
    this.url = url;
    if (recording) {
      this.hideHead = recording.hideHead;
      this.frames = recording.frames;
      this.changeColor(recordRoomColor);
    }

    this.costumeColor = this.isRecording
      ? recordCostumeColor
      : getCostumeColor(this.index);

    this.position = layout.getPosition(
      this.placementIndex,
      new THREE.Vector3(),
      !!recording
    );
    this.updatePosition();
    this.costumeColor = this.isRecording
      ? recordCostumeColor
      : getCostumeColor(this.index);
    this.instanceCount = 0;
    this.currentTime = 0;
  }

  load(callback) {
    const frames = [];
    this.streamer = streamJSON(
      `${PROTOCOL}//d1nylz9ljdxzkb.cloudfront.net/${this.url}`,
      (error, json) => {
        if (error || !json) {
          if (callback) {
            return callback(error);
          }
        }
        if (!this.frames) {
          // First JSON is meta object:
          const meta = JSON.parse(json);
          this.frames = frames;
          this.hideHead = meta.hideHead;
          this.layerCount = meta.count;
        } else {
          frames.push(json);
        }
      }
    );
  }

  updatePosition() {
    const position = tempVector().add(this.position).add(roomOffset);
    for (const i in roomMeshes) {
      roomMeshes[i].setPositionAt(this.index, position);
      roomMeshes[i].needsUpdate('position');

      if (this.index < wallMeshes[i].numInstances) {
        wallMeshes[i].setPositionAt(this.index, position);
        wallMeshes[i].needsUpdate('position');
      }
    }
  }

  get worldPosition() {
    return this._worldPosition
      .copy(this.position)
      .applyMatrix4(roomsGroup.matrix);
  }

  isHighlighted(performance) {
    return Room.outline.room === this.index
      && Room.outline.performance === performance;
  }

  changeColor(color) {
    for (const i in roomMeshes) {
      const mesh = roomMeshes[i];
      mesh.setColorAt(this.index, color);
      mesh.needsUpdate('color');

      const wall = wallMeshes[i];
      wall.setColorAt(this.index, color);
      wall.needsUpdate('color');
    }
  }

  getHeadPosition(index) {
    return serializer.getPosition(
      this.frame,
      index,
      0,
      this.position
    ).applyMatrix4(roomsGroup.matrix);
  }

  getHeadOrientation(index, seconds) {
    return serializer.getQuaternion(
      this.frames[roomUtils.secondsToFrames(seconds)],
      index,
      0
    );
  }

  transformToHead(object, layerIndex) {
    const position = this.getHeadPosition(layerIndex, this.currentTime);
    const orientation = this.getHeadOrientation(layerIndex, this.currentTime);
    object.position.copy(position);
    object.quaternion.copy(orientation);
  }

  get frame() {
    return this.frameNumber === undefined
      ? null
      : this.frames[this.frameNumber];
  }

  gotoTime(seconds, maxLayers) {
    this.currentTime = seconds;

    const { frames } = this;
    if (!frames) return;

    const frameNumber = this.frameNumber = roomUtils.secondsToFrames(seconds);
    if (frames.length <= frameNumber) return;
    let positions = frames[frameNumber];
    if (!positions) return;

    // TODO: figure out why we can't use just serializer.count here:
    let count = this.layerCount || serializer.count(positions);
    if (maxLayers !== undefined) {
      count = Math.min(maxLayers, count);
    }

    this.instanceCount = count;

    // In orthographic mode, scale up the meshes:
    const scale = roomMesh === roomMeshes.orthographic ? 1.3 : 1;

    // Check if data is still a string:
    if (positions[0] === '[') {
      positions = frames[frameNumber] = JSON.parse(positions);
    }

    const { position } = this;
    for (let i = 0; i < count; i++) {
      const color = this.isHighlighted(i) ? highlightColor : this.costumeColor;
      if (!this.hideHead) {
        roomUtils.transformMesh(
          headMesh,
          positions,
          headMesh.geometry.maxInstancedCount++,
          i,
          0, // head
          scale,
          color,
          position
        );
      }
      roomUtils.transformMesh(
        handMesh,
        positions,
        handMesh.geometry.maxInstancedCount++,
        i,
        1, // first hand
        scale,
        color,
        position
      );
      roomUtils.transformMesh(
        handMesh,
        positions,
        handMesh.geometry.maxInstancedCount++,
        i,
        2, // second hand
        scale,
        color,
        position
      );
    }
  }

  destroy() {
    roomsGroup.remove(this.headMesh);
    roomsGroup.remove(this.handMesh);
    if (this.streamer) this.streamer.cancel();
  }
}

Room.clear = () => {
  handMesh.geometry.maxInstancedCount = headMesh.geometry.maxInstancedCount = 0;
};

Room.switchModel = (model) => {
  roomsGroup.remove(wallMesh);
  roomsGroup.remove(roomMesh);
  wallMesh = wallMeshes[model];
  roomMesh = roomMeshes[model];
  roomsGroup.add(wallMesh);
  roomsGroup.add(roomMesh);
};

Room.reset = ({ showAllWalls } = {}) => {
  Room.setHighlight();
  setIdentityMatrix(roomsGroup);
  if (roomMesh) roomsGroup.remove(roomMesh);
  if (wallMesh) roomsGroup.remove(wallMesh);
  if (headMesh) roomsGroup.remove(headMesh);
  if (handMesh) roomsGroup.remove(handMesh);

  roomIndex = 0;
  wallMeshes = {
    default: createInstancedMesh({
      count: showAllWalls ? layout.roomCount : 1,
      geometry: props.wall.geometry,
      color: getRoomColor,
      material: props.wall.material,
    }),
    orthographic: createInstancedMesh({
      count: showAllWalls ? layout.roomCount : 1,
      geometry: props.orthographicWall.geometry,
      color: getRoomColor,
      material: props.orthographicWall.material,
    }),
  };
  roomMeshes = {
    default: createInstancedMesh({
      count: layout.roomCount,
      geometry: props.room.geometry,
      color: getRoomColor,
      material: props.room.material,
    }),
    orthographic: createInstancedMesh({
      count: layout.roomCount,
      geometry: props.orthographicRoom.geometry,
      color: getRoomColor,
      material: props.orthographicRoom.material,
    }),
  };
  roomMeshes.default.receiveShadow = true;
  roomMeshes.orthographic.receiveShadow = true;

  wallMesh = wallMeshes.default;
  roomMesh = roomMeshes.default;

  headMesh = createInstancedMesh({
    count: layout.roomCount * 10,
    geometry: props.head.geometry,
  });
  headMesh.geometry.maxInstancedCount = 0;

  handMesh = createInstancedMesh({
    count: layout.roomCount * 10 * 2,
    geometry: props.hand.geometry,
  });
  handMesh.geometry.maxInstancedCount = 0;

  roomsGroup.add(headMesh);
  roomsGroup.add(handMesh);
  roomsGroup.add(wallMesh);
  roomsGroup.add(roomMesh);
  viewer.scene.add(roomsGroup);

  // Move an extra invisible object3d with a texture to the end of scene's children
  // array in order to solve a texture glitch as described in:
  // https://github.com/puckey/you-move-me/issues/129
  viewer.scene.add(debugMesh);
};

Room.rotate180 = () => {
  set180RotationMatrix(roomsGroup);
};

Room.group = roomsGroup;

Room.highlight = {};

Room.setHighlight = ([roomIndex, performanceIndex] = []) => {
  Room.highlight.roomIndex = roomIndex;
  Room.highlight.performanceIndex = performanceIndex;
};

export function getHandMesh() {
  return handMesh;
}

export function getHeadMesh() {
  return headMesh;
}
