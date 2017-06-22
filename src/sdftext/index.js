/**
* dat-guiVR Javascript Controller Library for VR
* https://github.com/dataarts/dat.guiVR
*
* Copyright 2016 Data Arts Team, Google Inc.
*
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
import * as THREE from '../lib/three';
import fontTextureURL from './larsvrc-light.png';
import dummyTextureUrl from '../public/dummy.png';

import * as Font from './font';

const materialInstances = [];


export function createMaterial(color) {
  const material = new THREE.RawShaderMaterial(SDFShader({
    side: THREE.DoubleSide,
    transparent: true,
    color,
    map: new THREE.TextureLoader().load(dummyTextureUrl),
  }));

  materialInstances.push(material);

  return material;
}

const textScale = 0.00024;

export function loadFontTexture() {

  const textureLoader = new THREE.TextureLoader().load('/sdftext/larsvrc-light.png', function (texture) {
    console.log(materialInstances);
    materialInstances.forEach(function (m) {
      console.log(m);
      m.uniforms.map.value = texture;
      m.needsUpdate = true;
      m.uniforms.map.needsUpdate = true;
    });
  }, function(e){
    console.log(e);
  }, function(e){
    console.log(e);
  });

  return textureLoader;
}

export function creator() {
  const font = parseASCII(Font.fnt());

  const colorMaterials = {};

  function createText(str, fnt, color, scale, wrapWidth, align) {
    const geometry = createGeometry({
      text: str,
      align,
      width: wrapWidth,
      flipY: true,
      font: fnt,
    });


    const layout = geometry.layout;

    let material = colorMaterials[color];
    if (material === undefined) {
      material = colorMaterials[color] = createMaterial(color);
      materialInstances.push(material);
    }
    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.multiply(new THREE.Vector3(1, -1, 1));

    const finalScale = scale * textScale;

    mesh.scale.multiplyScalar(finalScale);

    mesh.position.y = layout.height * 0.5 * finalScale;
    return mesh;
  }


  function create(str = '', { color = 0xffffff, scale = 1.0, wrapWidth = undefined, align = 'left' } = {}) {
    const group = new THREE.Group();

    const mesh = createText(str.toUpperCase, font, color, scale, wrapWidth, align);
    group.add(mesh);
    group.layout = mesh.geometry.layout;

    group.updateLabel = function (txt) {
      mesh.geometry.update(txt.toUpperCase());

      if (align === 'center') {
        //  center alignment doesn't seem to be working in BMFontText
        mesh.geometry.computeBoundingBox();
        const width = mesh.geometry.boundingBox.getSize().x;

        mesh.position.x = -width * 0.5 * textScale * scale;
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
