/** @jsx h */
import { h, Component } from 'preact';

import Room from '../../components/Room';
import Align from '../../components/Align';
import audio from '../../audio';
import viewer from '../../viewer';

export default class Submission extends Component {
  constructor() {
    super();
    this.state = {
      loading: 'Loading performance…',
    };

    if (viewer.vrEffect.isPresenting) {
      viewer.vrEffect.exitPresent();
    }
    viewer.switchCamera('orthographic');
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
    audio.fadeOut();
  }

  render({ roomId, recordingId }) {
    return (
      <div>
        <Room
          roomId={roomId}
          id={recordingId}
          orbs
        />
      </div>
    );
  }
}
