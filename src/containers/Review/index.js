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

import Controllers from '../../components/Controllers';
import Error from '../../components/Error';
import Playlist from '../../containers/Playlist';
import Overlay from '../../components/Overlay';

import audio from '../../audio';
import recording from '../../recording';
import transition from '../../transition';
import { sleep } from '../../utils/async';
import storage from '../../storage';
import settings from '../../settings';
import feature from '../../utils/feature';

export default class Review extends Component {
  constructor() {
    super();

    this.state = {
      visible: false,
    };
    this.performSubmit = this.performSubmit.bind(this);
    this.performRedo = this.performRedo.bind(this);
    this.performGoHome = this.performGoHome.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
    this.asyncMount();
  }

  componentWillUnmount() {
    this.mounted = false;
    audio.fadeOut();
  }

  async asyncMount() {
    await Promise.all([
      transition.enter({
        text: 'Time to review your performance',
      }),
      sleep(5000),
    ]);
    if (!this.mounted) return;

    await transition.fadeOut();
    if (!this.mounted) return;

    await audio.load({
      src: `${settings.assetsURL}sound/room-${this.props.roomId}.${feature.isChrome ? 'ogg' : 'mp3'}`,
      loops: 2,
    });
    if (!this.mounted) return;

    this.setState({
      visible: true,
    });
    transition.exit();
  }

  async performSubmit() {
    await Promise.all([
      transition.fadeOut(),
      audio.fadeOut(),
    ]);
    if (!this.mounted) return;

    this.setState({
      visible: false,
    });

    await transition.enter({
      text: 'Submitting your recording. Please wait.',
    });
    if (!this.mounted) return;

    try {
      const [recordingSrc] = await Promise.all([
        storage.persist(
          recording.serialize(),
          recording.roomIndex + 1
        ),
        sleep(5000),
      ]);
      if (!this.mounted) return;

      await transition.fadeOut();
      if (!this.mounted) return;

      const id = recordingSrc.replace('.json', '');
      this.props.goto(`/${recording.roomIndex + 1}/${id}`);
    } catch (error) {
      this.setState({
        error,
      });
    }
  }

  async performRedo() {
    audio.fadeOut();
    await transition.fadeOut();
    if (!this.mounted) return;

    this.setState({
      visible: false,
    });

    await transition.enter({
      text: 'Okay, here we go again',
      duration: 3000,
    });
    if (!this.mounted) return;

    this.props.goto('record');
  }

  performGoHome() {
    window.location = '/';
  }

  render({ id, roomId }, { visible, error }) {
    if (error) {
      return (
        <Overlay opaque>
          <Error>Oops, an error occurred: {error}.</Error>
          <p>
            <a onClick={this.performGoHome}><span>Go home</span></a>
          </p>
        </Overlay>
      );
    }
    return visible ? (
      <div>
        <Controllers
          settings={{
            left: {
              text: 'press\nto\nredo',
              onPress: this.performRedo,
              removeOnPress: true,
            },
            right: {
              text: 'press\nto\nsubmit',
              onPress: this.performSubmit,
              removeOnPress: true,
            },
          }}
        />
        <Playlist
          review
          totalProgress
          fixedControllers
          hideRoomCountdown
          recording={recording}
          pathRecordingId={id}
          pathRoomId={roomId}
        />
      </div>
    )
    : null;
  }
}
