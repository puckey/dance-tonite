/** @jsx h */
import { h, Component } from 'preact';

import Menu from '../../components/Menu';
import Container from '../../components/Container';
import Error from '../../components/Error';
import Align from '../../components/Align';
import Spinner from '../../components/Spinner';
import RecordCountdown from '../../components/RecordCountdown';
import ConnectControllers from '../../components/ConnectControllers';
import RecordOrbs from '../../components/RecordOrbs';
import Controllers from '../../components/Controllers';

import Room from '../../room';
import audio from '../../audio';
import viewer from '../../viewer';
import settings from '../../settings';
import recording from '../../recording';
import transition from '../../transition';
import { waitRoomColor, getRoomColor } from '../../theme/colors';
import { sleep } from '../../utils/async';
import layout from '../../room/layout';

export default class Playback extends Component {
  constructor() {
    super();
    this.state = { };

    this.tick = this.tick.bind(this);
    this.performFinish = this.performFinish.bind(this);
    this.performStart = this.performStart.bind(this);
    this.performNextRound = this.performNextRound.bind(this);
    this.performWaitRoom = this.performWaitRoom.bind(this);
    this.performRetry = this.performRetry.bind(this);
    this.performControllersDisconnected = this.performControllersDisconnected.bind(this);
    this.performControllersConnected = this.performControllersConnected.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
    const { roomIndex, hideHead } = this.props;
    recording.setup({ roomIndex, hideHead });
    this.roomColor = getRoomColor(roomIndex);
    this.asyncMount();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  setLoading(loading) {
    this.setState({ loading });
  }

  async asyncMount() {
    Room.reset();
    this.setLoading('Loading audio…');
    await audio.load({
      src: `/public/sound/room-${layout.loopIndex(recording.roomIndex)}.ogg`,
      loops: 2,
      loopOffset: 0.5,
    });
    this.setLoading();
    if (!this.mounted) return;

    viewer.switchCamera('default');
    this.room = new Room({
      recording,
      index: recording.roomIndex,
      single: true,
    });
    this.room.changeColor(waitRoomColor);

    this.setState({
      mode: 'connect-controllers',
    });

    transition.exit();
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
        (audio.duration - audio.time) < (audio.loopDuration * 0.5)
          ? (audio.duration - audio.time + 0.1) * 1000
          : 0
      ).then(() => {
        if (this.mounted) recording.stop();
      }),
      audio.fadeOut(),
      transition.enter({
        text: 'Let’s review your performance',
      }),
    ]);
    if (this.mounted) this.props.goto('review');
  }

  performNextRound() {
    this.room.changeColor(waitRoomColor);
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
    }
    const round = Math.floor(audio.totalProgress / 2);
    this.setState({ round });
    if (round === settings.maxLayerCount) {
      this.performFinish();
    }
  }

  performWaitRoom() {
    if (this.room) {
      this.room.changeColor(this.roomColor);
    }
    this.setState({
      controllerSettings: null,
    });
  }

  async performStart() {
    this.setState({
      mode: 'recording',
    });
    audio.play();
    audio.mute();
    audio.fadeIn();
    viewer.events.on('tick', this.tick);
  }

  async performRetry() {
    await transition.enter({
      text: 'Let’s try that again...',
    });
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

  performControllersDisonnected() {
    this.setState({
      controllerSettings: null,
    });
  }

  tick() {
    this.room.gotoTime(audio.time);
    recording.tick();
  }

  render(
    props,
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
      <Container>
        {mode === 'recording' &&
          <RecordOrbs
            onEnteredRoom={this.performNextRound}
            onLeftRoom={this.performWaitRoom}
          />
        }
        { mode === 'connect-controllers' &&
          <ConnectControllers
            onConnected={this.performControllersConnected}
            onDisconnected={this.performControllersDisconnected}
          />
        }
        { !loading &&
          <Controllers settings={controllerSettings} />
        }
        { round !== undefined &&
          <RecordCountdown
            key={round}
            round={round}
            seconds={countdownSeconds}
          />
        }
        <Align type="center">
          { error
            ? <Error>{error}</Error>
            : (loading &&
              <Spinner
                text={`${loading}`}
              />)
          }
        </Align>
        <Menu
          addRoom={false}
          enterVR={false}
        />
      </Container>
    );
  }
}
