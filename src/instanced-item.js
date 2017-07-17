import { Group, Vector3 } from './lib/three';
import { createInstancedMesh } from './utils/three';
import viewer from './viewer';

const items = [];
const group = new Group();
group.matrixAutoUpdate = false;

const SCALE = new Vector3();
const changeInstance = (mesh, index, [position, rotation], color, scale) => {
  if (position) {
    mesh.setPositionAt(index, position);
  }
  if (color) {
    mesh.setColorAt(index, color);
  }
  if (rotation) {
    mesh.setQuaternionAt(index, rotation);
  }
  if (scale) {
    mesh.setScaleAt(index, SCALE.set(scale, scale, scale));
  }
  mesh.needsUpdate();
};

const changeInstanceColor = (mesh, index, color) => {
  mesh.setColorAt(index, color);
  mesh.needsUpdate('color');
};

const addInstance = mesh => mesh.geometry.maxInstancedCount++;

class InstancedItem {
  constructor(count, perspectiveMesh, orthographicMesh) {
    items.push(this);
    this.perspectiveMesh = createInstancedMesh({
      count,
      geometry: perspectiveMesh.geometry,
      material: perspectiveMesh.material,
    });
    if (orthographicMesh) {
      this.orthographicMesh = createInstancedMesh({
        count,
        geometry: orthographicMesh.geometry,
        material: orthographicMesh.material,
      });
    }
    this.mesh = (InstancedItem.perspectiveMode || !orthographicMesh)
      ? this.perspectiveMesh
      : this.orthographicMesh;
    group.add(this.mesh);
  }

  empty() {
    this.perspectiveMesh.geometry.maxInstancedCount = 0;
    const { orthographicMesh } = this;
    if (orthographicMesh) {
      orthographicMesh.geometry.maxInstancedCount = 0;
    }
  }

  destroy() {
    group.remove(this.mesh);
    items.splice(items.indexOf(this), 1);
  }

  changeColor(index, color) {
    changeInstanceColor(this.perspectiveMesh, index, color);
    const { orthographicMesh } = this;
    if (orthographicMesh) {
      changeInstanceColor(orthographicMesh, index, color);
    }
  }

  change(index, pose, color, scale = 1) {
    changeInstance(this.perspectiveMesh, index, pose, color, scale);
    const { orthographicMesh } = this;
    if (orthographicMesh) {
      changeInstance(orthographicMesh, index, pose, color, scale);
    }
  }

  add(pose, color, scale) {
    const index = this.perspectiveMesh.geometry.maxInstancedCount++;
    const { orthographicMesh } = this;
    if (orthographicMesh) {
      orthographicMesh.geometry.maxInstancedCount++;
    }
    this.change(index, pose, color, scale);
  }
}

InstancedItem.perspectiveMode = false;

InstancedItem.switch = (mode) => {
  InstancedItem.perspectiveMode = mode === 'perspective';
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    group.remove(item.mesh);
    item.mesh = (InstancedItem.perspectiveMode || !item.orthographicMesh)
      ? item.perspectiveMesh
      : item.orthographicMesh;
    group.add(item.mesh);
  }
};

InstancedItem.group = group;

InstancedItem.reset = () => {
  viewer.scene.add(group);
};

export default InstancedItem;
