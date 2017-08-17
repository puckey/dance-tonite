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
import { Group, Vector3 } from '../third_party/threejs/three';
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

class InstancedItem {
  constructor(name, count, perspectiveMesh, orthographicMesh) {
    items.push(this);
    this.perspectiveMesh = createInstancedMesh({
      count,
      geometry: perspectiveMesh.geometry,
      material: perspectiveMesh.material,
      name,
    });
    if (orthographicMesh) {
      this.orthographicMesh = createInstancedMesh({
        count,
        geometry: orthographicMesh.geometry,
        material: orthographicMesh.material,
        name: `${name} orthographic`,
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
    // don't add if we've already used our allocated memory
    if (this.perspectiveMesh.geometry.maxInstancedCount >= this.perspectiveMesh.numInstances)
      return;

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
