import * as THREE from '../lib/three';
import windowSize from '../utils/windowSize';

require('../lib/OBJLoader')(THREE);

const VECTOR = new THREE.Vector3();
const QUATERNION = new THREE.Quaternion();
const QUATERNION_2 = new THREE.Quaternion();
const COLOR = new THREE.Color();
const LAMBERT_MATERIAL = new THREE.MeshLambertMaterial();

export const tempVector = (x = 0, y = 0, z = 0) => VECTOR.set(x, y, z);

export const tempQuaternion = (x = 0, y = 0, z = 0, w = 0) => QUATERNION.set(x, y, z, w);

export const tempQuaternion2 = (x = 0, y = 0, z = 0, w = 0) => QUATERNION_2.set(x, y, z, w);

export const tempColor = (r = 0, g = 0, b = 0) => COLOR.set(r, g, b);

export const createInstancedMesh = ({
  count,
  geometry,
  material = LAMBERT_MATERIAL,
}) => {
  const instancedMesh = new THREE.InstancedMesh(
    geometry,
    material,
    count,
    true,
    true,
  );
  for (let i = 0; i < count; i++) {
    instancedMesh.setScaleAt(i, tempVector(1, 1, 1));
    instancedMesh.setPositionAt(i, tempVector(0, 0, 0));
  }

  instancedMesh.visible = true;
  instancedMesh.castShadow = false;
  instancedMesh.receiveShadow = false;
  instancedMesh.geometry.maxInstancedCount = 0;
  return instancedMesh;
};

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

export const loadModel = async ([objUrl, textureUrl, doubleSided]) => {
  const [object, texture] = await Promise.all([
    loadObject(objUrl),
    textureUrl ? loadTexture(textureUrl) : null,
  ]);
  object.material = new THREE.MeshLambertMaterial({
    side: doubleSided ? THREE.DoubleSide : undefined,
  });
  if (texture) {
    object.material.map = texture;
  }
  return object;
};

export const worldToScreen = (camera, position) => {
  // map to normalized device coordinate (NDC) space
  VECTOR
    .copy(position)
    .project(camera);
  VECTOR.x = (VECTOR.x + 1) * (windowSize.width * 0.5);
  VECTOR.y = (-VECTOR.y + 1) * (windowSize.height * 0.5);

  return VECTOR;
};

const loadObject = (url) => new Promise(
  (resolve, reject) => {
    new THREE.OBJLoader().load(url,
      object => resolve(object.children[0]),
      () => {},
      reject,
    );
  }
);

const loadTexture = (url) => new Promise(
  (resolve, reject) => {
    new THREE.TextureLoader().load(
      url,
      resolve,
      () => {},
      reject
    );
  }
);
