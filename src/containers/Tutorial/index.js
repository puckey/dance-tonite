/** @jsx h */
import { h, Component } from 'preact';

import Room from '../../components/Room';
import Overlay from '../../components/Overlay';
import TutorialTimeline from '../../components/TutorialTimeline';
import Align from '../../components/Align';

import audio from '../../audio';
import feature from '../../utils/feature';
import viewer from '../../viewer';
import { sleep } from '../../utils/async';
import router from '../../router';

export default class Tutorial extends Component {
  constructor() {
    super();
    this.state = {
      layers: 0,
      skipButton: true,
    };

    this.setLayers = this.setLayers.bind(this);
    this.performShowOverlay = this.performShowOverlay.bind(this);
    this.performHideOverlay = this.performHideOverlay.bind(this);
    this.performAddPerformance = this.performAddPerformance.bind(this);

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

  setLayers(layers) {
    this.setState({ layers });
  }

  performHideOverlay() {
    this.setState({
      skipButton: true,
      overlay: null,
    });
  }

  async performAddPerformance() {
    if (!viewer.vrEffect.isPresenting) {
      await viewer.vrEffect.requestPresent();
    }
    // Wait for the VR overlay to cover the screen:
    await sleep(500);
    this.props.goto('record');
  }

  performShowOverlay() {
    this.setState({
      skipButton: false,
      overlay: feature.has6DOF ? 'add-performance' : 'room-scale-error',
    });
  }

  render({ roomId }, { skipButton, layers, overlay }) {
    return (
      <div>
        {overlay === 'room-scale-error' &&
          <Overlay
            type={overlay}
            goto={this.props.goto}
            onClose={this.performHideOverlay}
          >
            <p>
              To add your dance, you will need a room-scale VR
              device and a WebVR-enabled browser.
            </p>
            <a href="https://webvr.info" target="_blank" rel="noopener noreferrer">
              <span>Learn more</span>
            </a> or <a onClick={() => router.navigate('/')}>
              <span>go back to the experience</span>
            </a>.
          </Overlay>
        }
        {overlay === 'add-performance' &&
          <Overlay
            type={overlay}
            goto={this.props.goto}
            onClose={this.performHideOverlay}
          >
            <a onClick={this.performAddPerformance}><span>Add your performance</span></a>
          </Overlay>
        }
        <Room
          roomId={roomId}
          id="hIR_Tw"
          orbs
          tutorialLayers={layers}
        >
          <TutorialTimeline
            onUpdateLayers={this.setLayers}
            onEnd={this.performShowOverlay}
          />
        </Room>
        { skipButton && (
          <Align type="bottom-right">
            <a onClick={this.performShowOverlay}>Skip Tutorial</a>
          </Align>
          )
        }
      </div>
    );
  }
}
