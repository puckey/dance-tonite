/** @jsx h */
import { h, Component } from 'preact';

import Menu from '../../components/Menu';
import Container from '../../components/Container';
import Error from '../../components/Error';
import Align from '../../components/Align';
import Spinner from '../../components/Spinner';
import RecordInstructions from '../../components/RecordInstructions';
import RecordCountdown from '../../components/RecordCountdown';

import Room from '../../room';
import Orb from '../../orb';
import audio from '../../audio';
import viewer from '../../viewer';
import settings from '../../settings';
import recording from '../../recording';
import createTimeline from '../../lib/timeline';
import controllers from '../../controllers';
import transition from '../../transition';
import { waitRoomColor, getRoomColor } from '../../theme/colors';
import { sleep } from '../../utils/async';
import layout from '../../room/layout';

export default class Playback extends Component {
  constructor() {
    super();

    this.state = {
    };

    this.controllersTick = this.controllersTick.bind(this);
    this.tick = this.tick.bind(this);
    this.performFinish = this.performFinish.bind(this);
    this.performStart = this.performStart.bind(this);

    this.controllerSettings = {
      pressToFinish: {
        removeOnPress: true,
        left: {
          text: 'press\nto\nrestart',
          onPress: async () => {
            await transition.enter({
              text: 'Let’s try that again...',
            });
            if (this.mounted) this.props.goto('record');
          },
        },
        right: {
          text: 'press\nto\nfinish',
          onPress: this.performFinish,
        },
      },
      pressToStart: {
        removeOnPress: true,
        right: {
          text: 'press\nto\nstart',
          onPress: this.performStart,
        },
      },
    };

    this.timeline = createTimeline([
      {
        time: 0,
        callback: () => {
          this.room.changeColor(waitRoomColor);
          this.orb2.fadeOut();
          this.orb.fadeIn();
          if (audio.totalProgress > 1) {
            controllers.update(this.controllerSettings.pressToFinish);
          }
          const round = Math.floor(audio.totalProgress / 2);
          const countdownSeconds = Math.round(audio.loopDuration - audio.time);
          this.setState({ round, countdownSeconds });
          if (round === settings.maxLayerCount) {
            this.performFinish();
            controllers.update();
          }
        },
      },
      {
        time: 1,
        callback: () => {
          this.room.changeColor(this.roomColor);
          controllers.update();
        },
      },
    ]);
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

    viewer.events.on('tick', this.controllersTick);

    controllers.add();

    this.orb = new Orb();
    this.orb2 = new Orb();

    transition.exit();
  }

  async performFinish() {
    if (this.performedFinish) return;
    this.performedFinish = true;
    await Promise.all([
      // Wait for loop to finish:
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

  async performStart() {
    this.setState({
      instructions: null,
    });
    audio.play();
    audio.mute();
    audio.fadeIn();
    viewer.events.on('tick', this.tick);
    viewer.events.off('tick', this.controllersTick);
  }

  tick() {
    Room.clear();
    audio.tick();
    this.room.gotoTime(audio.time);
    const progress = audio.progress - 1; // value between -1 and 1
    this.timeline.tick(audio.progress);

    const z = (progress - 0.5) * settings.roomDepth + settings.roomOffset;
    this.orb.position.z = z;
    if (audio.totalProgress > 1) {
      this.orb2.position.z = z + settings.roomDepth * 2;
    }
    recording.tick();
  }

  controllersTick() {
    const count = controllers.countActiveControllers();
    controllers.update(count === 2 ? this.controllerSettings.pressToStart : null);
    this.setState({
      instructions: count === 2
        ? 'press right controller to start'
        : count === 1
          ? 'turn on both of your controllers'
          : 'turn on your controllers\nthen press any button to begin',
    });
  }

  render(props, { error, loading, round, countdownSeconds, instructions }) {
    return (
      <Container>
        { round !== undefined
          ? <RecordCountdown
            key={round}
            round={round}
            seconds={countdownSeconds}
          />
          : instructions !== undefined &&
            <RecordInstructions
              subtitle={instructions}
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
