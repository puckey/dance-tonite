import { tempVector, tempQuaternion } from './three';
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
    positions[arrayOffset + 2] * 0.0001 - settings.roomOffset
  );
  if (offset) position.add(offset);
  return position;
};

export const getQuaternion = (positions, performanceIndex, limbIndex) => {
  const arrayOffset = performanceIndex * PERFORMANCE_ELEMENT_COUNT
    + limbIndex * LIMB_ELEMENT_COUNT;
  return tempQuaternion(
    positions[arrayOffset + 3] * 0.0001,
    positions[arrayOffset + 4] * 0.0001,
    positions[arrayOffset + 5] * 0.0001,
    positions[arrayOffset + 6] * 0.0001
  );
};

export const count = (serializedPositions) => {
  return serializedPositions.length / PERFORMANCE_ELEMENT_COUNT;
};

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
