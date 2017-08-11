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

import { Group } from '../../../third_party/threejs/three';
import viewer from '../../viewer';
import { textColor } from '../../theme/colors';
import deps from '../../deps';

let subtitleItem;
let mainItem;

export default class RecordInstructions extends Component {
  constructor() {
    super();

    if (!subtitleItem) {
      const textCreator = deps.SDFText.creator();

      const textSettings = {
        align: 'center',
        color: textColor.getHex(),
        mode: 'nowrap',
      };

      subtitleItem = textCreator.create('', {
        ...textSettings,
        scale: 2.25,
      });

      mainItem = textCreator.create('', {
        ...textSettings,
        scale: 7.5,
      });

      mainItem.position.y = -0.65;
    }

    const group = this.group = new Group();
    group.name = 'Instructions';
    group.add(subtitleItem, mainItem);
    group.position.set(0, 2, -4);

    this.state = {
      main: '',
      subtitle: '',
    };
  }

  componentDidMount() {
    this.mounted = true;
    viewer.scene.add(this.group);
    const { subtitle = '', main = '' } = this.props;
    subtitleItem.updateLabel(subtitle);
    mainItem.updateLabel(main);
  }

  shouldComponentUpdate({ subtitle, main }) {
    const {
      subtitle: curSubtitle,
      main: curMain,
    } = this.props;
    if (curSubtitle !== subtitle) {
      subtitleItem.updateLabel(subtitle || '');
    }
    if (curMain !== main) {
      mainItem.updateLabel(main || '');
    }
  }

  componentWillUnmount() {
    this.mounted = false;
    viewer.scene.remove(this.group);
  }
}
