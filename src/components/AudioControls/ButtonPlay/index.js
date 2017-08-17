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

import ButtonItem from '../../ButtonItem';
import audio from '../../../audio';

import iconPlay from '../../ButtonPlay/icon.svg';
import iconPause from './icon-pause.svg';

export default class ButtonPlay extends Component {
  constructor() {
    super();

    this.state = {
      playing: false,
    };

    this.onPlay = this.setPlaying.bind(this, true);
    this.onPause = this.setPlaying.bind(this, false);
    this.togglePlaying = this.togglePlaying.bind(this);
  }

  componentDidMount() {
    audio.on('play', this.onPlay);
    audio.on('pause', this.onPause);
  }

  componentWillUnmount() {
    audio.off('play', this.onPlay);
    audio.off('pause', this.onPause);
  }

  setPlaying(playing) {
    this.setState({ playing });
  }

  togglePlaying() {
    audio.toggle();
  }

  render(props, { playing }) {
    return (
      <ButtonItem
        onClick={this.togglePlaying}
        icon={playing ? iconPause : iconPlay}
      />
    );
  }
}
