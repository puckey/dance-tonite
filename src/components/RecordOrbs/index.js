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
import audio from '../../audio';
import settings from '../../settings';
import Orb from '../../orb';

import AudioTimeline from '../../components/AudioTimeline';

export default class RecordOrbs extends Component {
  constructor() {
    super();
    this.state = {};
    this.orb = new Orb();
    this.orb2 = new Orb();

    this.performLeftRoom = this.performLeftRoom.bind(this);
    this.performEnteredRoom = this.performEnteredRoom.bind(this);
    this.performEarlyLeftRoom = this.performEarlyLeftRoom.bind(this);
    this.performEarlyEnteredRoom = this.performEarlyEnteredRoom.bind(this);
    this.tick = this.tick.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
    viewer.on('tick', this.tick);
    if (this.props.onCreatedOrb) {
      this.props.onCreatedOrb(this.orb);
    }
  }

  shouldComponentUpdate({ mode }) {
    if (this.props.mode !== mode && mode === 'left') {
      this.orb2.fadeOut();
      this.orb.fadeIn();
    }
  }

  componentWillUnmount() {
    this.mounted = false;
    viewer.off('tick', this.tick);
    this.orb.destroy();
    this.orb2.destroy();
  }

  tick() {
    const { reversed } = this.props;
    const { roomDepth, roomOffset } = settings;
    const multiplier = reversed ? 1 : -1;
    const progress = audio.progress - 1; // value between -1 and 1
    const z = ((progress - 0.5) * roomDepth + roomOffset) * multiplier;
    this.orb.position.z = z;
    if (audio.totalProgress > 1) {
      this.orb2.position.z = z + roomDepth * 2 * multiplier;
    }
  }

  performLeftRoom() {
    if (this.props.fade) {
      this.orb2.fadeOut();
      this.orb.fadeIn();
    }
    const { onLeftRoom } = this.props;
    if (onLeftRoom) {
      onLeftRoom();
    }
  }

  performEnteredRoom() {
    const { onEnteredRoom } = this.props;
    if (onEnteredRoom) {
      onEnteredRoom();
    }
  }

  performEarlyEnteredRoom() {
    const { onEarlyEnteredRoom } = this.props;
    if (onEarlyEnteredRoom) {
      onEarlyEnteredRoom();
    }
  }

  performEarlyLeftRoom() {
    const { onEarlyLeftRoom } = this.props;
    if (onEarlyLeftRoom) {
      onEarlyLeftRoom();
    }
  }

  render() {
    return (
      <AudioTimeline
        progress
        keyframes={[
          {
            time: 0,
            callback: this.performLeftRoom,
          },
          {
            time: 0.9,
            callback: this.performEarlyEnteredRoom,
          },
          {
            time: 1,
            callback: this.performEnteredRoom,
          },
          {
            time: 1.9,
            callback: this.performEarlyLeftRoom,
          },
        ]}
      />
    );
  }
}
