import { tempVector, tempQuaternion, tempQuaternion2 } from './three';
import * as THREE from '../lib/three';
import settings from '../settings';

export const PERFORMANCE_ELEMENT_COUNT = 21;
export const LIMB_ELEMENT_COUNT = 7;

export const getPosition = (positions, arrayOffset, offset) => tempVector(
  positions[arrayOffset] * 0.0001,
  positions[arrayOffset + 1] * 0.0001,
  positions[arrayOffset + 2] * 0.0001 - settings.roomOffset
).add(offset);

const getQuaternion = (
  positions, arrayOffset, _tempQuaternion = tempQuaternion) => _tempQuaternion(
  positions[arrayOffset + 3] * 0.0001,
  positions[arrayOffset + 4] * 0.0001,
  positions[arrayOffset + 5] * 0.0001,
  positions[arrayOffset + 6] * 0.0001
);

export const avgPosition = (lower, higher, ratio, offset, position) => {
  const x1 = lower[offset] * 0.0001;
  const y1 = lower[offset + 1] * 0.0001;
  const z1 = lower[offset + 2] * 0.0001;
  if (!higher) {
    return tempVector(x1, y1, z1 - settings.roomOffset).add(position);
  }
  const x2 = higher[offset] * 0.0001;
  const y2 = higher[offset + 1] * 0.0001;
  const z2 = higher[offset + 2] * 0.0001;
  return tempVector(
    x1 + (x2 - x1) * ratio,
    y1 + (y2 - y1) * ratio,
    z1 + (z2 - z1) * ratio - settings.roomOffset
  ).add(position);
};

export const avgQuaternion = (lower, higher, ratio, offset) => {
  const quaternion = getQuaternion(lower, offset);
  if (higher) {
    quaternion.slerp(getQuaternion(higher, offset, tempQuaternion2), ratio);
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
