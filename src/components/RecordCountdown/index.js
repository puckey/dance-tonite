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

import { sleep } from '../../utils/async';
import roundText from './round-text';

import RoomInstructions from '../RoomInstructions';
import audio from '../../audio';
import settings from '../../settings';
import transition from '../../transition';

export default class RecordCountdown extends Component {
  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    this.mounted = true;
    this.beginCountdown();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  async beginCountdown() {
    const { round } = this.props;
    this.setState({
      subtitle: roundText(round),
    });
    let remaining = Math.round(settings.loopDuration - audio.time);
    while (remaining > -2) {
      if (remaining > 0) {
        this.setState({
          main: remaining.toString(),
        });
      } else if (remaining === 0) {
        this.setState({
          main: '',
          subtitle: 'DANCE!',
        });
      }
      remaining--;
      await sleep(1000);
      if (!this.mounted) {
        remaining = -2;
      }
    }
    this.setState({
      subtitle: '',
    });
  }

  render(props, { main, subtitle }) {
    return !transition.isFadedOut() ? (
      <RoomInstructions
        main={main}
        subtitle={subtitle}
      />
    ) : null;
  }
}
