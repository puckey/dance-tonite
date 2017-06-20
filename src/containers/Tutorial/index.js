/** @jsx h */
import { h, Component } from 'preact';

import Menu from '../../components/Menu';
import Container from '../../components/Container';
import Room from '../../components/Room';
import TutorialTimeline from '../../components/TutorialTimeline';
import Align from '../../components/Align';

import audio from '../../audio';
import feature from '../../utils/feature';
import { sleep } from '../../utils/async';
import viewer from '../../viewer';

export default class Review extends Component {
  constructor() {
    super();
    this.state = {
      layers: 0,
      skipButton: true,
    };

    this.updateLayers = this.updateLayers.bind(this);
    this.performSkip = this.performSkip.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
    audio.fadeOut();
  }

  setLoading(loading) {
    this.setState({ loading });
  }

  updateLayers(layers) {
    this.setState({ layers });
  }

  async performSkip() {
    const { goto, revealOverlay } = this.props;
    if (feature.has6DOF) {
      revealOverlay();
      this.setState({
        skipButton: false,
      });
      if (!viewer.vrEffect.isPresenting) {
        await viewer.vrEffect.requestPresent();
      }
      // Wait for the VR overlay to cover the screen:
      await sleep(500);
      goto('record');
    } else {
      goto('/');
    }
  }

  render() {
    const { skipButton, layers } = this.state;
    return (
      <Container>
        <Room
          roomId={1}
          id="hIR_Tw"
          orbs
          layers={layers}
        >
          <TutorialTimeline
            onUpdateLayers={this.updateLayers}
          />
        </Room>
        <Menu
          mute
          close
        />
        { skipButton && (
          <Align type="bottom-right">
            <a onClick={this.performSkip}>Skip Tutorial</a>
          </Align>
          )
        }
      </Container>
    );
  }
}
