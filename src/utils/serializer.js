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
import { tempVector } from './three';
import * as THREE from '../../third_party/threejs/three';
import settings from '../settings';

export const PERFORMANCE_ELEMENT_COUNT = 21;
export const LIMB_ELEMENT_COUNT = 7;

export const getPosition = (positions, performanceIndex, limbIndex) => {
  const arrayOffset = performanceIndex * PERFORMANCE_ELEMENT_COUNT
    + limbIndex * LIMB_ELEMENT_COUNT;
  return tempVector(
    positions[arrayOffset] * 0.0001,
    positions[arrayOffset + 1] * 0.0001,
    positions[arrayOffset + 2] * 0.0001
  );
};

export const getQuaternion = (
  positions,
  performanceIndex,
  limbIndex,
  dest
) => {
  const arrayOffset = performanceIndex * PERFORMANCE_ELEMENT_COUNT
    + limbIndex * LIMB_ELEMENT_COUNT;
  return dest.set(
    positions[arrayOffset + 3] * 0.0001,
    positions[arrayOffset + 4] * 0.0001,
    positions[arrayOffset + 5] * 0.0001,
    positions[arrayOffset + 6] * 0.0001
  );
};

export const getFrame = (frames, number) => {
  let frame = frames[Math.min(number, frames.length - 1)];
  // Check if data is still a string:
  if (frame[0] === '[') {
    frame = frames[number] = JSON.parse(frame);
  }
  return frame;
};

const AVG_POSITION_VECTOR = new THREE.Vector3();
export const avgPosition = (
  lower,
  higher,
  ratio,
  performanceIndex,
  limbIndex,
  position,
  dest = AVG_POSITION_VECTOR,
) => {
  const { x: x1, y: y1, z: z1 } = getPosition(lower, performanceIndex, limbIndex);
  const { x: x2, y: y2, z: z2 } = getPosition(higher, performanceIndex, limbIndex);
  dest.set(
    x1 + (x2 - x1) * ratio,
    y1 + (y2 - y1) * ratio,
    z1 + (z2 - z1) * ratio
  );
  if (position) {
    dest.z -= settings.roomOffset;
    dest.add(position);
  }
  return dest;
};

const AVG_QUATERNION = new THREE.Quaternion();
const AVG_QUATERNION_2 = new THREE.Quaternion();
export const avgQuaternion = (
  lower,
  higher,
  ratio,
  performanceIndex,
  limbIndex,
  dest = AVG_QUATERNION
) => {
  const quaternion = getQuaternion(lower, performanceIndex, limbIndex, dest);
  if (higher) {
    quaternion.slerp(
      getQuaternion(higher, performanceIndex, limbIndex, AVG_QUATERNION_2),
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

export const createPose = () => [new THREE.Vector3(), new THREE.Quaternion()];
