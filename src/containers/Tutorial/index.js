/** @jsx h */
import { h, Component } from 'preact';

import Room from '../../components/Room';
import TutorialTimeline from '../../components/TutorialTimeline';
import Align from '../../components/Align';
import audio from '../../audio';
import feature from '../../utils/feature';

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

  performSkip() {
    this.props.revealOverlay(feature.has6DOF ? 'add-performance' : 'room-scale-error');
    this.setState({
      skipButton: false,
    });
  }

  render() {
    const { skipButton, layers } = this.state;
    return (
      <div>
        <Room
          roomId={1}
          id="hIR_Tw"
          orbs
          layers={layers}
        >
          <TutorialTimeline
            onUpdateLayers={this.updateLayers}
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
