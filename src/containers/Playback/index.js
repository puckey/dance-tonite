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

import Menu from '../../components/Menu';
import Container from '../../components/Container';
import Error from '../../components/Error';
import Align from '../../components/Align';
import Spinner from '../../components/Spinner';
import Titles from '../../components/Titles';
import ProgressBar from '../../components/ProgressBar';
import Colophon from '../../components/Colophon';
import Playlist from '../Playlist';
import ButtonItem from '../../components/ButtonItem';
import Overlay from '../../components/Overlay';
import Controllers from '../../components/Controllers';

import audio from '../../audio';
import viewer from '../../viewer';
import settings from '../../settings';
import transition from '../../transition';
import feature from '../../utils/feature';
import { sleep } from '../../utils/async';

const audioSrcOgg = `${settings.assetsURL}sound/tonite.ogg`;
const audioSrcMp3 = `${settings.assetsURL}sound/tonite.mp3`;

export default class Playback extends Component {
  constructor() {
    super();

    this.onTitlesChanged = this.onTitlesChanged.bind(this);
    this.performExitPresent = this.performExitPresent.bind(this);
    this.performExitVRInstructions = this.performExitVRInstructions.bind(this);
  }

  componentWillMount() {
    this.setState({
      hoverHead: null,
      orb: true,
      colophon: this.props.colophon !== false,
      loading: this.props.inContextOfRecording
        ? null
        : 'Moving dancers into position…',
    });
  }

  componentDidMount() {
    this.mounted = true;
    this.asyncMount();
  }

  componentWillUnmount() {
    this.mounted = false;
    if (viewer.vrEffect.isPresenting) {
      viewer.vrEffect.exitPresent();
    }
  }

  onTitlesChanged({ titles, colophon }) {
    this.setState({
      orb: !titles,
      colophon: !!colophon,
    });
  }

  setLoading(loading) {
    this.setState({ loading });
  }

  performExitPresent() {
    if (viewer.vrEffect.isPresenting) {
      viewer.vrEffect.exitPresent();
    }
    this.forceUpdate();
  }

  async performExitVRInstructions() {
    // Return early if we unmounted in the meantime:
    if (!this.mounted) return;

    // Fade to black from viewer scene
    await Promise.all([
      audio.fadeOut(),
      transition.fadeOut(),
    ]);
    if (!this.mounted) return;

    // Removes background color if any and stops moving camera:
    this.setState({
      stopped: true,
      takeOffHeadset: true,
    });

    await transition.enter({
      text: 'Please take off your headset',
    });
  }

  async asyncMount() {
    const { inContextOfRecording, roomId } = this.props;

    const audioLoadTime = Date.now();
    await audio.load({
      src: feature.isChrome ? audioSrcOgg : audioSrcMp3,
      loops: settings.totalLoopCount,
      loop: true,
      progressive: true,
    });
    if (!this.mounted) return;

    if (inContextOfRecording) {
      // Start at 3 rooms before the recording:
      const watchTime = 30;
      const roomOffset = 2;
      const startTime = (roomId - 2 + roomOffset) * settings.loopDuration;
      audio.gotoTime(startTime);
      setTimeout(this.performExitVRInstructions, watchTime * 1000);
    }

    const timeLeft = 1500 - (Date.now() - audioLoadTime);
    if (timeLeft > 0) {
      await sleep(timeLeft);
      if (!this.mounted) return;
    }

    this.setLoading(null);
    if (transition.isInside()) {
      transition.exit();
    }

    // Safari won't play unless we wait until next tick
    setTimeout(() => {
      audio.play();
    });
  }

  render(
    {
      roomId,
      id,
      inContextOfRecording,
      onGotoSubmission,
    },
    {
      error,
      loading,
      orb,
      colophon,
      takeOffHeadset,
      stopped,
    },
    {
      presenting,
    }
  ) {
    const polyfillAndPresenting = feature.vrPolyfill
      && viewer.vrEffect.isPresenting;

    if (polyfillAndPresenting) {
      return (
        <Container>
          <Playlist
            pathRecordingId={id}
            pathRoomId={roomId}
            orb={orb && !presenting}
          />
        </Container>
      );
    }

    return (
      <div className="playback">
        {
          inContextOfRecording && (
            takeOffHeadset
              ? (
                <Overlay opaque>
                  <a onClick={onGotoSubmission}>
                    <span>Press here to continue</span>
                  </a>
                </Overlay>
              )
              : (
                <Align type="bottom-right">
                  <ButtonItem text="Skip Preview" onClick={this.performExitVRInstructions} />
                </Align>
              )
          )
        }
        {process.env.FLAVOR !== 'cms' &&
          <Colophon hide={!loading && !colophon} />
        }
        <Playlist
          pathRecordingId={id}
          pathRoomId={roomId}
          orb={orb && !presenting}
          stopped={stopped}
          fixedControllers={inContextOfRecording}
          hideRoomCountdown={inContextOfRecording}
        />
        { process.env.FLAVOR !== 'cms'
          ? <Titles
            onUpdate={this.onTitlesChanged}
          />
          : null
        }
        { inContextOfRecording ?
          <Controllers
            settings={{
              right: {
                text: 'skip\npreview',
                onPress: this.performExitVRInstructions,
                removeOnPress: true,
              },
            }}
          /> :
          <ProgressBar />
        }
        <Align type="center">
          { error
            ? <Error>{error}</Error>
            : loading
              ? <Spinner
                text={`${loading}`}
              />
              : null
          }
        </Align>
      </div>
    );
  }
}
