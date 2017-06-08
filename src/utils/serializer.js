import { tempVector, tempQuaternion, tempQuaternion2 } from './three';
import * as THREE from '../lib/three';
import settings from '../settings';

export const PERFORMANCE_ELEMENT_COUNT = 21;
export const LIMB_ELEMENT_COUNT = 7;

export const getPosition = (positions, performanceIndex, limbIndex, offset) => {
  const arrayOffset = performanceIndex * PERFORMANCE_ELEMENT_COUNT
    + limbIndex * LIMB_ELEMENT_COUNT;
  const position = tempVector(
    positions[arrayOffset] * 0.0001,
    positions[arrayOffset + 1] * 0.0001,
    positions[arrayOffset + 2] * 0.0001
  );
  if (offset) position.add(offset);
  return position;
};

export const getQuaternion = (
  positions,
  performanceIndex,
  limbIndex,
  _tempQuaternion = tempQuaternion
) => {
  const arrayOffset = performanceIndex * PERFORMANCE_ELEMENT_COUNT
    + limbIndex * LIMB_ELEMENT_COUNT;
  return _tempQuaternion(
    positions[arrayOffset + 3] * 0.0001,
    positions[arrayOffset + 4] * 0.0001,
    positions[arrayOffset + 5] * 0.0001,
    positions[arrayOffset + 6] * 0.0001
  );
};

export const getFrame = (frames, number) => {
  let frame = frames[number];
  if (!frame) frame--;
  // Check if data is still a string:
  if (frame[0] === '[') {
    frame = frames[number] = JSON.parse(frame);
  }
  return frame;
};

export const avgPosition = (lower, higher, ratio, performanceIndex, limbIndex, position, hidden, hiddenRatio) => {
  const { x: x1, y: y1, z: z1 } = getPosition(lower, performanceIndex, limbIndex);
  if (!higher) {
    const vector = tempVector(x1, y1, z1);
    if (position) {
      vector.z -= settings.roomOffset;
      vector.add(position);
    }
    if (hiddenRatio !== undefined) {
      vector.y *= hidden
        ? 0
        : hiddenRatio;
    }
    return vector;
  }
  const { x: x2, y: y2, z: z2 } = getPosition(higher, performanceIndex, limbIndex);
  const vector = tempVector(
    x1 + (x2 - x1) * ratio,
    y1 + (y2 - y1) * ratio,
    z1 + (z2 - z1) * ratio
  );
  if (position) {
    vector.z -= settings.roomOffset;
    vector.add(position);
  }
  // if (hidden) {
  //   vector.y = 0;
  // }
  if (hiddenRatio !== undefined) {
    vector.y *= hiddenRatio;
  }
  return vector;
};

export const avgQuaternion = (lower, higher, ratio, performanceIndex, limbIndex) => {
  const quaternion = getQuaternion(lower, performanceIndex, limbIndex);
  if (higher) {
    quaternion.slerp(
      getQuaternion(higher, performanceIndex, limbIndex, tempQuaternion2),
      ratio
    );
  }
  return quaternion;
};

export const count = (serializedPositions) => (
  serializedPositions.length / PERFORMANCE_ELEMENT_COUNT
);

// TODO: figure the optimal rounding of these values:
const compressNumber = number => Math.round(number * 10000);

// Serializes a matrix into an array with rounded position x, y, z
// & quaternion x, y, z, w values:
const SERIALIZE_POSITION = new THREE.Vector3();
const SERIALIZE_ROTATION = new THREE.Quaternion();
const SERIALIZE_SCALE = new THREE.Vector3();
export const serializeMatrix = (matrix) => {
  matrix.decompose(SERIALIZE_POSITION, SERIALIZE_ROTATION, SERIALIZE_SCALE);
  return SERIALIZE_POSITION.toArray()
    .concat(SERIALIZE_ROTATION.toArray())
    .map(compressNumber);
};

export const serialize = (position, rotation) => (
  position.toArray()
    .concat(rotation.toArray())
    .map(compressNumber)
);
