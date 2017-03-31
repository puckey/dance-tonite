import * as THREE from '../lib/three';

const VECTOR = new THREE.Vector3();
const QUATERNION = new THREE.Quaternion();

export const tempVector = (x = 0, y = 0, z = 0) => VECTOR.set(x, y, z);

export const tempQuaternion = (x = 0, y = 0, z = 0, w = 0) => QUATERNION.set(x, y, z, w);

export const createInstancedMesh = (num, color, geometry) => {
  const material = new THREE.MeshLambertMaterial({ color });
  const instancedMesh = new THREE.InstancedMesh(geometry, material, num, true);
  const vector = tempVector(1, 1, 1);

  for (let i = 0; i < num; i++) {
    instancedMesh.setScaleAt(i, tempVector(1, 1, 1));
    instancedMesh.setPositionAt(i, tempVector(-1000, 0, 0));
  }

  instancedMesh.visible = true;
  instancedMesh.castShadow = false;
  instancedMesh.receiveShadow = false;
  return instancedMesh;
};
