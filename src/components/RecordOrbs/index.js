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
    this.orb2.fadeOut();
    this.orb.fadeIn();
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
            time: 1,
            callback: this.performEnteredRoom,
          },
        ]}
      />
    );
  }
}
