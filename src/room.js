import * as THREE from './lib/three';

import props from './props';
import { tempQuaternion, tempVector, createInstancedMesh } from './utils/three';
import viewer from './viewer';
import settings from './settings';
import audio from './audio';
import { getCostumeColor, getRoomColor, recordCostumeColor, recordRoomColor } from './theme/colors';
import streamJSON from './lib/stream-json';

import dummyTextureUrl from './public/dummy.png';

const PROTOCOL = location.protocol;
const PERFORMANCE_ELEMENT_COUNT = 21;
const LIMB_ELEMENT_COUNT = 7;

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
  color,
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
  instancedMesh.setColorAt(
    index,
    color,
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
      this.changeColor(recordRoomColor);
    }

    this.costumeColor = this.isRecording
      ? recordCostumeColor
      : getCostumeColor(this.index);

    this.position = new THREE.Vector3(
      0,
      0,
      settings.roomOffset + (this.placementIndex * (settings.roomDepth + 0.001)),
    );
    this.updatePosition();
    this.costumeColor = this.isRecording
      ? recordCostumeColor
      : getCostumeColor(this.index);
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

    // Check if data is still a string:
    if (positions[0] === '[') {
      positions = frames[frameNumber] = JSON.parse(positions);
    }

    for (let i = 0; i < count; i++) {
      if (!this.hideHead) {
        transformMesh(
          headMesh,
          positions,
          headMesh.geometry.maxInstancedCount++,
          i * PERFORMANCE_ELEMENT_COUNT,
          scale,
          this.costumeColor,
          this.position
        );
      }
      transformMesh(
        handMesh,
        positions,
        handMesh.geometry.maxInstancedCount++,
        i * PERFORMANCE_ELEMENT_COUNT + LIMB_ELEMENT_COUNT,
        scale,
        this.costumeColor,
        this.position
      );
      transformMesh(
        handMesh,
        positions,
        handMesh.geometry.maxInstancedCount++,
        i * PERFORMANCE_ELEMENT_COUNT + LIMB_ELEMENT_COUNT * 2,
        scale,
        this.costumeColor,
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
  roomsGroup.matrix.copy(IDENTITY_MATRIX);
  if (roomMesh) roomsGroup.remove(roomMesh);
  if (wallMesh) roomsGroup.remove(wallMesh);
  if (headMesh) roomsGroup.remove(headMesh);
  if (handMesh) roomsGroup.remove(handMesh);

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

  headMesh = createInstancedMesh({
    count: settings.loopCount * 10,
    geometry: props.head.geometry,
  });
  headMesh.geometry.maxInstancedCount = 0;

  handMesh = createInstancedMesh({
    count: settings.loopCount * 10 * 2,
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
  roomsGroup.matrix.copy(ROTATION_MATRIX);
};
