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

import SDFShader from 'three-bmfont-text/shaders/sdf';
import createGeometry from 'three-bmfont-text';
import parseASCII from 'parse-bmfont-ascii';
import * as THREE from '../../third_party/threejs/three';

import * as Font from './font';

export function createMaterial(color) {
  const texture = new THREE.Texture();
  const image = Font.image();
  texture.image = image;
  texture.needsUpdate = true;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  return new THREE.RawShaderMaterial(SDFShader({
    side: THREE.DoubleSide,
    transparent: true,
    color,
    map: texture,
  }));
}

export const textScale = 0.00024;

export function creator() {
  const font = parseASCII(Font.fnt());

  const colorMaterials = {};

  function createText(str, fnt, color, scale, wrapWidth, align, lineHeight) {
    const geometry = createGeometry({
      text: str,
      align,
      width: wrapWidth,
      flipY: true,
      font: fnt,
      lineHeight,
    });


    const layout = geometry.layout;
    let material = colorMaterials[color];
    if (material === undefined) {
      material = colorMaterials[color] = createMaterial(color);
    }
    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.multiply(new THREE.Vector3(1, -1, 1));
    mesh.frustumCulled = false;

    const finalScale = scale * textScale;

    mesh.scale.multiplyScalar(finalScale);

    mesh.position.y = layout.height * 0.5 * finalScale;

    return mesh;
  }


  function create(str = '', { color = 0xffffff, scale = 1.0, wrapWidth = undefined, align = 'left', vAlign = 'bottom', lineHeight = undefined } = {}) {
    const group = new THREE.Group();

    const mesh = createText(str.toUpperCase(), font, color, scale, wrapWidth, align, lineHeight);
    group.add(mesh);
    group.layout = mesh.geometry.layout;

    group.updateLabel = function (txt) {
      mesh.geometry.update(txt.toUpperCase());

      group.layout = mesh.geometry.layout;

      if (align === 'center') {
        mesh.position.x = -group.layout.width * 0.5 * scale * textScale;
      }

      if (vAlign === 'center') {
        mesh.position.y = -group.layout.height * 0.5 * scale * textScale;
      }
    };

    group.getMaterial = function () {
      return mesh.material;
    };

    group.getGeometry = function () {
      return mesh.geometry;
    };

    group.updateLabel(str);

    return group;
  }

  return {
    create,
  };
}
