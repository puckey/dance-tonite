import * as THREE from './lib/three';

import props from './props';
import { tempQuaternion, tempVector, createInstancedMesh } from './utils/three';
import viewer from './viewer';
import settings from './settings';
import audio from './audio';
import { getCostumeColor, getRoomColor, recordCostumeColor, recordRoomColor } from './theme/colors';
import streamJSON from './lib/stream-json';

const PROTOCOL = location.protocol;

const PERFORMANCE_ELEMENT_COUNT = 21;
const LIMB_ELEMENT_COUNT = 7;

let roomIndex = 0;
let wallMesh;
let wallMeshes;
let roomMesh;
let roomMeshes;

const roomOffset = new THREE.Vector3(0, settings.roomHeight * 0.5, 0);
const roomsGroup = new THREE.Group();
roomsGroup.matrixAutoUpdate = false;

const ROTATION_MATRIX = new THREE.Matrix4().makeRotationAxis(
  new THREE.Vector3(0, 1, 0).normalize(),
  Math.PI
);
const IDENTITY_MATRIX = new THREE.Matrix4();

const secondsToFrames = (seconds) => Math.floor((seconds % (audio.loopDuration * 2)) * 90);

const getPosition = (positions, arrayOffset, offset) => tempVector(
  positions[arrayOffset] * 0.0001,
  positions[arrayOffset + 1] * 0.0001,
  positions[arrayOffset + 2] * 0.0001 - settings.roomOffset
).add(offset);

const getQuaternion = (positions, arrayOffset) => tempQuaternion(
  positions[arrayOffset + 3] * 0.0001,
  positions[arrayOffset + 4] * 0.0001,
  positions[arrayOffset + 5] * 0.0001,
  positions[arrayOffset + 6] * 0.0001
);

const transformMesh = (
  instancedMesh,
  positions,
  index,
  arrayOffset,
  scale,
  offset,
) => {
  instancedMesh.setPositionAt(
    index,
    getPosition(positions, arrayOffset, offset)
  );
  instancedMesh.setQuaternionAt(
    index,
    getQuaternion(positions, arrayOffset, offset)
  );
  instancedMesh.setScaleAt(
    index,
    tempVector(scale, scale, scale)
  );
  instancedMesh.needsUpdate();
};

export default class Room {
  constructor({ url, recording, index }) {
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
      this.createMeshes();
      this.changeColor(recordRoomColor);
    }
    this.position = new THREE.Vector3();

    this.position.set(
      0,
      0,
      settings.roomOffset + (this.placementIndex * (settings.roomDepth + 0.001)),
    );
    this.updatePosition();
  }

  createMeshes() {
    const color = this.isRecording
      ? recordCostumeColor
      : getCostumeColor(this.index);
    const count = this.isRecording
      ? 20
      : this.layerCount;
    this.handMesh = createInstancedMesh({
      count: count * 2,
      geometry: props.hand.geometry,
      color,
    });
    this.handMesh.castShadow = true;
    roomsGroup.add(this.handMesh);

    if (!this.hideHead) {
      this.headMesh = createInstancedMesh({
        count,
        geometry: props.head.geometry,
        color,
      });
      this.headMesh.castShadow = true;
      roomsGroup.add(this.headMesh);
    }
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
          this.createMeshes();
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

  getHeadPosition(index, seconds) {
    return getPosition(
      this.frames[secondsToFrames(seconds)],
      index * PERFORMANCE_ELEMENT_COUNT,
      this.position
    ).applyMatrix4(roomsGroup.matrix);
  }

  gotoTime(seconds, maxLayers) {
    const { frames } = this;
    if (!frames) return;

    const frameNumber = secondsToFrames(seconds);

    if (frames.length <= frameNumber) return;
    let positions = frames[frameNumber];
    if (!positions) return;

    // TODO: figure out why we can't use just 'positions.length / PERFORMANCE_ELEMENT_COUNT' here:
    let count = this.layerCount || (positions.length / PERFORMANCE_ELEMENT_COUNT);
    if (maxLayers !== undefined) {
      count = Math.min(maxLayers, count);
    }

    // In orthographic mode, scale up the meshes:
    const scale = roomMesh === roomMeshes.orthographic ? 1.3 : 1;
    if (this.headMesh) {
      this.headMesh.geometry.maxInstancedCount = count;
    }
    this.handMesh.geometry.maxInstancedCount = count * 2;

    // Check if data is still a string:
    if (positions[0] === '[') {
      positions = frames[frameNumber] = JSON.parse(positions);
    }

    for (let i = 0; i < count; i++) {
      if (!this.hideHead) {
        transformMesh(
          this.headMesh,
          positions,
          i,
          i * PERFORMANCE_ELEMENT_COUNT,
          scale,
          this.position
        );
      }
      transformMesh(
        this.handMesh,
        positions,
        i * 2,
        i * PERFORMANCE_ELEMENT_COUNT + LIMB_ELEMENT_COUNT,
        scale,
        this.position
      );
      transformMesh(
        this.handMesh,
        positions,
        i * 2 + 1,
        i * PERFORMANCE_ELEMENT_COUNT + LIMB_ELEMENT_COUNT * 2,
        scale,
        this.position
      );
    }
  }

  destroy() {
    roomsGroup.remove(this.headMesh);
    roomsGroup.remove(this.handMesh);
    if (this.streamer) this.streamer.cancel();
  }
}

Room.switchModel = (model) => {
  roomsGroup.remove(wallMesh);
  roomsGroup.remove(roomMesh);
  wallMesh = wallMeshes[model];
  roomMesh = roomMeshes[model];
  roomsGroup.add(wallMesh);
  roomsGroup.add(roomMesh);
};

Room.reset = ({ showAllWalls } = {}) => {
  roomsGroup.matrix.copy(IDENTITY_MATRIX);
  if (roomMesh) roomsGroup.remove(roomMesh);
  if (wallMesh) roomsGroup.remove(wallMesh);
  roomIndex = 0;
  wallMeshes = {
    default: createInstancedMesh({
      count: showAllWalls ? settings.loopCount : 1,
      geometry: props.wall.geometry,
      color: getRoomColor,
      material: props.wall.material,
    }),
    orthographic: createInstancedMesh({
      count: showAllWalls ? settings.loopCount : 1,
      geometry: props.orthographicWall.geometry,
      color: getRoomColor,
      material: props.orthographicWall.material,
    }),
  };
  roomMeshes = {
    default: createInstancedMesh({
      count: settings.loopCount,
      geometry: props.room.geometry,
      color: getRoomColor,
      material: props.room.material,
    }),
    orthographic: createInstancedMesh({
      count: settings.loopCount,
      geometry: props.orthographicRoom.geometry,
      color: getRoomColor,
      material: props.orthographicRoom.material,
    }),
  };
  roomMeshes.default.receiveShadow = true;
  roomMeshes.orthographic.receiveShadow = true;

  wallMesh = wallMeshes.default;
  roomMesh = roomMeshes.default;

  roomsGroup.add(wallMesh);
  roomsGroup.add(roomMesh);
  viewer.scene.add(roomsGroup);
};

Room.rotate180 = () => {
  roomsGroup.matrix.copy(ROTATION_MATRIX);
};
