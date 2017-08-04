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

import Error from '../../components/Error';
import Align from '../../components/Align';
import Spinner from '../../components/Spinner';
import RecordCountdown from '../../components/RecordCountdown';
import ConnectControllers from '../../components/ConnectControllers';
import Controllers from '../../components/Controllers';
import Room from '../../components/Room';

import audio from '../../audio';
import viewer from '../../viewer';
import settings from '../../settings';
import recording from '../../recording';
import transition from '../../transition';
import { sleep } from '../../utils/async';

import analytics from '../../utils/analytics';

export default class Record extends Component {
  constructor() {
    super();
    this.state = {
      mode: 'connect-controllers',
    };

    this.tick = this.tick.bind(this);
    this.performFinish = this.performFinish.bind(this);
    this.performStart = this.performStart.bind(this);
    this.performWaitRoom = this.performWaitRoom.bind(this);
    this.performRetry = this.performRetry.bind(this);
    this.performControllersDisconnected = this.performControllersDisconnected.bind(this);
    this.performControllersConnected = this.performControllersConnected.bind(this);
    this.performRecordRoom = this.performRecordRoom.bind(this);
    this.setLoading = this.setLoading.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
    const { roomId, hideHead } = this.props;
    recording.setup({ roomIndex: roomId - 1, hideHead });
    viewer.switchCamera('default');
    transition.exit();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  setLoading(loading) {
    this.setState({ loading });
  }

  async performFinish() {
    if (this.performedFinish) return;
    this.performedFinish = true;
    this.setState({
      controllerInstructions: null,
    });
    await Promise.all([
      // Keep recording until loop finishes:
      sleep(
        (audio.duration - audio.time) < (settings.loopDuration * 0.5)
          ? (audio.duration - audio.time + 0.1) * 1000
          : 0
      ).then(() => {
        if (this.mounted) recording.stop();
      }),
      audio.fadeOut(),
      transition.fadeOut(),
    ]);
    viewer.off('tick', this.tick);
    analytics.recordDanceSessionStop(this.state.round);
    if (!this.mounted) return;

    this.props.goto('review');
  }

  performRecordRoom() {
    this.setState({
      controllerSettings: null,
    });
  }

  performWaitRoom() {
    if (audio.totalProgress > 1) {
      this.setState({
        controllerSettings: {
          removeOnPress: true,
          left: {
            text: 'press\nto\nrestart',
            onPress: this.performRetry,
          },
          right: {
            text: 'press\nto\nfinish',
            onPress: this.performFinish,
          },
        },
      });

      setTimeout(() => {
        viewer.controllers.forEach(controller => {
          const hapticActuator = controller.gamepad && controller.gamepad.hapticActuators[0];
          if (hapticActuator) {
            hapticActuator.pulse(1, 60);
          }
        });
      }, 500);
    }
    const round = Math.floor(audio.totalProgress / 2);
    this.setState({ round });
    if (round === settings.maxLayerCount) {
      this.performFinish();
    }
  }

  async performStart() {
    this.setState({
      mode: 'recording',
    });
    this.performWaitRoom();
    audio.dim(true);
    audio.play();
    viewer.on('tick', this.tick);
    analytics.recordDanceSessionStart();
  }

  async performRetry() {
    analytics.recordSectionChange('retry');
    this.setState({
      mode: 'retry',
    });
    await transition.enter({
      text: 'Let’s try that again...',
      duration: 3000,
    });
    audio.fadeOut();
    await transition.fadeOut();
    if (this.mounted) this.props.goto('record');
  }

  performControllersConnected() {
    this.setState({
      controllerSettings: {
        removeOnPress: true,
        right: {
          text: 'press\nto\nstart',
          onPress: this.performStart,
        },
      },
    });
  }

  performControllersDisconnected() {
    this.setState({
      controllerSettings: null,
    });
  }

  tick() {
    if (this.state.mode === 'recording') {
      recording.tick();
    }
  }

  render(
    {
      roomId,
    },
    {
      error,
      loading,
      round,
      countdownSeconds,
      controllerSettings,
      mode,
    }
  ) {
    return (
      <div>
        <Room
          orbs={mode === 'recording'}
          reverseOrbs
          record
          roomId={roomId}
          onOrbEnteredRoom={this.performRecordRoom}
          onOrbLeftRoom={this.performWaitRoom}
        />
        { mode === 'connect-controllers'
          ? <ConnectControllers
            onConnected={this.performControllersConnected}
            onDisconnected={this.performControllersDisconnected}
          />
          : null
        }
        { !loading
          ? <Controllers settings={controllerSettings} />
          : null
        }
        { (mode === 'recording' && round !== undefined)
          ? <RecordCountdown
            key={round}
            round={round}
            seconds={countdownSeconds}
          />
          : null
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
