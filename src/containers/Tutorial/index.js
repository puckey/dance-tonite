/** @jsx h */
import { h, Component } from 'preact';

import Room from '../../components/Room';
import TutorialTimeline from '../../components/TutorialTimeline';
import Align from '../../components/Align';
import audio from '../../audio';
import feature from '../../utils/feature';
import viewer from '../../viewer';

export default class Tutorial extends Component {
  constructor() {
    super();
    this.state = {
      layers: 0,
      skipButton: true,
    };

    this.setLayers = this.setLayers.bind(this);
    this.performSkip = this.performSkip.bind(this);
    this.onAudioLoop = this.onAudioLoop.bind(this);

    viewer.vrEffect.exitPresent();
    viewer.switchCamera('orthographic');
  }

  componentDidMount() {
    this.mounted = true;
    audio.on('loop', this.onAudioLoop);
  }

  componentWillUnmount() {
    this.mounted = false;
    audio.fadeOut();
    audio.off('loop', this.onAudioLoop);
  }

  onAudioLoop(loopCount) {
    // Update the max layer count every time the audio loops,
    // but only if the loop count is smaller than the max layers already set:
    const count = loopCount + 1;
    if (count > this.state.layers) {
      this.setLayers(count);
    }
  }

  setLayers(layers) {
    this.setState({ layers });
  }

  performSkip() {
    this.props.revealOverlay(feature.has6DOF ? 'add-performance' : 'room-scale-error');
    this.setState({
      skipButton: false,
    });
  }

  render({ roomId }, { skipButton, layers }) {
    return (
      <div>
        <Room
          roomId={roomId}
          id="hIR_Tw"
          orbs
          layers={layers}
        >
          <TutorialTimeline
            onUpdateLayers={this.setLayers}
            onEnd={this.performSkip}
          />
        </Room>
        { skipButton && (
          <Align type="bottom-right">
            <a onClick={this.performSkip}>Skip Tutorial</a>
          </Align>
          )
        }
      </div>
    );
  }
}
