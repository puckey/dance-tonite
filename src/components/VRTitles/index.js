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
/** @jsx h */
import { Component } from 'preact';
import * as THREE from '../../../third_party/threejs/three';
import deps from '../../deps';
import settings from '../../settings';
import { textColor } from '../../theme/colors';
import viewer from '../../viewer';

export default class VRTitles extends Component {
  constructor() {
    super();

    this.textCreator = deps.SDFText.creator();

    this.clearTitles = this.clearTitles.bind(this);
    this.setPosition = this.setPosition.bind(this);
  }

  componentDidMount() {
    const group = this.group = new THREE.Group();
    group.position.y = settings.holeHeight; // hole height

    this.textLine = this.textCreator.create('', {
      wrapWidth: 5120,
      scale: 5,
      align: 'center',
      vAlign: 'center',
      color: textColor.getHex(),
      lineHeight: 400,
      mode: 'nowrap',
    });
    group.add(this.textLine);
    viewer.scene.add(this.group);
  }

  componentWillReceiveProps({ titles, position }) {
    if (!titles) {
      this.clearTitles();
      return;
    }
    this.textLine.updateLabel(titles.join('\n').replace(/o/g, '@'));
    this.setPosition(position);
  }

  componentWillUnmount() {
    viewer.scene.remove(this.group);
  }

  setPosition(p) {
    if (!p) {
      return;
    }
    this.group.position.z = p.z;
  }

  clearTitles() {
    this.textLine.updateLabel('');
  }
}
