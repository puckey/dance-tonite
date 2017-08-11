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
import { h, Component } from 'preact';

import viewer from '../../viewer';
import settings from '../../settings';
import { getRoomColorByIndex } from '../../theme/colors';
import { Color } from '../../../third_party/threejs/three';

import AudioTimeline from '../AudioTimeline';
import createTweener from '../../utils/tween';

const tween = createTweener();
const BLACK = new Color(0x000000);
const EASE_COLOR = new Color();

export default class BackgroundTimeline extends Component {
  constructor() {
    super();
    this.performChangeBackground = this.performChangeBackground.bind(this);

    this.keyframes = settings.colorTimes
      .map((time, index) => (
        {
          time,
          color: getRoomColorByIndex(index + 23),
        }
      ));
  }

  componentWillMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
    viewer.renderer.setClearColor(BLACK);
  }

  performChangeBackground({ color }) {
    tween(
      EASE_COLOR.copy(color).multiplyScalar(0.7),
      Object.assign({
        ease: 'easeOutCubic',
        duration: 1,
        onUpdate: () => viewer.renderer.setClearColor(EASE_COLOR),
      }, BLACK)
    );
  }

  render() {
    return (
      <AudioTimeline
        keyframes={this.keyframes}
        callback={this.performChangeBackground}
      />
    );
  }
}
