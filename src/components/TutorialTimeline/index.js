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
import './style.scss';

import viewer from '../../viewer';

import AudioTimeline from '../AudioTimeline';
import LineTitle from '../LineTitle';

import { worldToScreen } from '../../utils/three';
import audio from '../../audio';

export default class TutorialTimeline extends Component {
  constructor() {
    super();
    this.performUpdateTutorial = this.performUpdateTutorial.bind(this);
    this.tick = this.tick.bind(this);
    this.getTime = this.getTime.bind(this);
  }

  componentWillMount() {
    const getHeadPosition = (index) => (
        this.context.room &&
        this.context.room.getHeadPosition(
          index !== undefined
            ? index
            : this.context.room.frame.count - 1
        )
    );
    this.keyframes = [
      {
        time: 0.5,
        text: 'This is you.',
        getPosition: getHeadPosition.bind(this),
        layers: 1,
      },
      {
        time: 5,
        text: 'This is the camera.',
        getPosition: () => this.context.orb && this.context.orb.position,
      },
      {
        time: 8,
        text: 'Dance!',
      },
      {
        time: 10.5,
        text: '(Try to avoid bumping into the camera)',
        getPosition: null,
      },
      {
        time: 13.5,
        text: '',
        getPosition: null,
      },
      {
        time: 14,
        getPosition: getHeadPosition.bind(this),
        text: 'This is you...',
      },
      {
        time: 17,
        text: 'This is your previous recording.',
        getPosition: getHeadPosition.bind(this, 0),
      },
      {
        time: 24,
        text: 'Dance together!',
      },
      {
        time: 32,
        text: 'Add up to 20 copies of yourself.',
        layers: 3,
      },
      {
        time: 33,
        layers: 4,
      },
      {
        time: 34,
        layers: 5,
      },
      {
        time: 35,
        layers: 6,
      },
      {
        time: 38,
        text: '',
        callback: this.props.onEnd,
      },
    ];
    viewer.on('tick', this.tick);
  }

  componentWillUnmount() {
    viewer.off('tick', this.tick);
  }

  getTime() {
    return audio.totalTime % 48;
  }

  tick() {
    if (this.getLineTarget) {
      const target = this.getLineTarget();
      if (!target) return;
      this.setState(worldToScreen(viewer.camera, target));
    } else {
      this.setState({
        x: null,
        y: null,
      });
    }
  }

  performUpdateTutorial({ text, getPosition, layers }) {
    // just !text would return true on empty string, so:
    if (text !== undefined) {
      this.setState({ text });
    }
    this.getLineTarget = getPosition;
    if (layers !== undefined) {
      this.props.onUpdateLayers(layers);
    }
  }

  render({ children, visible }, state) {
    return (
      <LineTitle
        {...state}
        visible={visible}
      >
        <AudioTimeline
          keyframes={this.keyframes}
          getTime={this.getTime}
          callback={this.performUpdateTutorial}
        />
      </LineTitle>
    );
  }
}
