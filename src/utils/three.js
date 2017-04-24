import * as THREE from '../lib/three';

const VECTOR = new THREE.Vector3();
const QUATERNION = new THREE.Quaternion();
const COLOR = new THREE.Color();
const LAMBERT_MATERIAL = new THREE.MeshLambertMaterial();

export const tempVector = (x = 0, y = 0, z = 0) => VECTOR.set(x, y, z);

export const tempQuaternion = (x = 0, y = 0, z = 0, w = 0) => QUATERNION.set(x, y, z, w);

export const tempColor = (r = 0, g = 0, b = 0) => COLOR.set(r, g, b);

export const createInstancedMesh = ({
  count,
  geometry,
  color,
  material = LAMBERT_MATERIAL,
}) => {
  const instancedMesh = new THREE.InstancedMesh(
    geometry,
    material,
    count,
    true,
    true,
  );
  const colorIsFunction = typeof color === 'function';

  for (let i = 0; i < count; i++) {
    instancedMesh.setScaleAt(i, tempVector(1, 1, 1));
    instancedMesh.setPositionAt(i, tempVector(-1000, 0, 0));
    if (color) {
      instancedMesh.setColorAt(i,
        colorIsFunction
          ? color(i)
          : color,
      );
    }
  }

  instancedMesh.visible = true;
  instancedMesh.castShadow = false;
  instancedMesh.receiveShadow = false;
  return instancedMesh;
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
