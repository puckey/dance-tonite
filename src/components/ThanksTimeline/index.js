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
import shuffle from 'just-shuffle';

import './style.scss';

import viewer from '../../viewer';
import audio from '../../audio';

import AudioTimeline from '../AudioTimeline';
import LineTitle from '../LineTitle';

import { worldToScreen } from '../../utils/three';

export default class TutorialTimeline extends Component {
  constructor() {
    super();
    this.performUpdate = this.performUpdate.bind(this);
    this.tick = this.tick.bind(this);
    this.getTime = this.getTime.bind(this);
  }

  componentWillMount() {
    const getHeadPosition = (index) => {
      const { room } = this.context;
      if (!room) return;
      const count = room.frame.count;
      if (!count) return;
      return (
        room &&
        room.getHeadPosition(
          index !== undefined
            ? (index + Math.floor(audio.totalProgress * 0.5)) % count
            : count - 1
        )
      );
    };
    let time = 0;
    const randomIndex = () => Math.floor(Math.random() * 100);
    const compliments = shuffle([
      'Nice moves.',
      'Killer steps.',
      'Sh.. Sh.. Shake it!',
      'So elegant.',
      'Remarkable.',
      'You monster, you!',
      'Cut that rug up!',
      'Exactly!',
      'Yes!',
      'You the best!',
      'Yes. Yes. Yes!',
      'Get your freak on.',
      'Loved this bit.',
      'E-l-e-c-t-r-i-f-y-i-n-g!',
      'Put that foot down.',
      'Get down with it.',
      'Cha! Cha! Dontcha!',
      'Improvisational.',
      'Pop it. Lock it.',
      'Classic.',
      'Such finesse.',
      'Such concentration!',
      'So nimble.',
      'Gene, is that you?',
      'Crank that.',
    ]);
    const keyframes = [
      {
        duration: 2,
        text: '',
      },
      {
        duration: 1,
        text: '...',
      },
      {
        duration: 1,
        text: 'Gosh...',
      },
      {
        duration: 2,
        text: 'We have no words!',
      },
      {
        duration: 4,
        text: 'That was amazing.',
      },
      {
        duration: 4,
        text: 'You must be worn out.',
      },
      {
        duration: 6,
        text: 'Thanks so much for your contribution.',
      },
      {
        duration: 4,
        text: 'Let’s take a moment to admire your moves:',
      },
      {
        duration: 3,
        text: '',
      },
    ];

    for (let i = 0, l = compliments.length; i < l; i++) {
      const text = compliments.pop();
      keyframes.push({
        duration: 4 + Math.random() * 6,
        text: '',
      });
      keyframes.push({
        duration: Math.max(2, text.length * 0.15),
        text,
        getPosition: getHeadPosition.bind(this, randomIndex()),
      });
    }

    this.keyframes = keyframes.map(keyframe => {
      keyframe.time = time;
      time += keyframe.duration;
      return keyframe;
    });
    viewer.on('tick', this.tick);
  }

  componentWillUnmount() {
    viewer.off('tick', this.tick);
  }

  getTime() {
    return audio.totalTime;
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

  performUpdate({ text, getPosition, layers }) {
    // just !text would return true on empty string, so:
    if (text !== undefined) {
      this.setState({ text });
    }
    this.getLineTarget = getPosition;
    if (layers !== undefined) {
      this.props.onUpdateLayers(layers);
    }
  }

  render({ children, visible = true }, state) {
    return (
      <LineTitle
        {...state}
        visible={visible}
      >
        <AudioTimeline
          keyframes={this.keyframes}
          getTime={this.getTime}
          callback={this.performUpdate}
        />
      </LineTitle>
    );
  }
}
