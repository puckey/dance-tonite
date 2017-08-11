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
import classNames from 'classnames';

import './style.scss';
import keyframes from './keyframes';

import createTimeline from '../../../third_party/puckey_utils/timeline';
import audio from '../../audio';
import viewer from '../../viewer';
import VRTitles from '../VRTitles';

export default class Titles extends Component {
  constructor() {
    super();

    const timeline = this.timeline = createTimeline(keyframes);

    timeline.on('keyframe', (param) => {
      this.setState(param);
      this.props.onUpdate(param);
    });

    this.state = {
      titles: null,
    };

    this.tick = this.tick.bind(this);
  }

  componentDidMount() {
    viewer.on('tick', this.tick);
  }

  componentWillUnmount() {
    viewer.off('tick', this.tick);
  }

  tick() {
    this.timeline.tick(audio.time);
  }

  renderTitles() {
    return this.state.titles.map(title => (
      <div className="titles-title">
        {title}
      </div>
    ));
  }

  render(props, { titles, small, position }) {
    return (
        !viewer.vrEffect.isPresenting ?
          titles &&
            <div className={classNames('titles', small && 'mod-small')}>
              { this.renderTitles() }
            </div>
          :
          <VRTitles titles={titles} small={small} position={position} />
    );
  }
}
