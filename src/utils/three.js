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

export const offsetFrom = (object, x, y, z) => tempVector(x, y, z)
    .applyQuaternion(object.quaternion)
    .add(object.position);

const ROTATION_MATRIX = new THREE.Matrix4().makeRotationAxis(
  new THREE.Vector3(0, 1, 0).normalize(),
  Math.PI
);

const IDENTITY_MATRIX = new THREE.Matrix4();

export const set180RotationMatrix = (object) => {
  object.matrix.copy(ROTATION_MATRIX);
};

export const setIdentityMatrix = (object) => {
  object.matrix.copy(IDENTITY_MATRIX);
};
