/** @jsx h */
import { h, Component } from 'preact';
import './style.scss';
import { sleep } from '../../utils/async';
import feature from '../../utils/feature';
import viewer from '../../viewer';
import audio from '../../audio';
import enterIconSvg from './icons/entervr.svg';
import enterIconDisabledSvg from './icons/x_entervr.svg';
import ButtonItem from '../ButtonItem';

export default class ButtonEnterVR extends Component {
  constructor() {
    super();

    this.state = {
      processingClick: false,
    };

    this.toggleVR = this.toggleVR.bind(this);
  }

  async toggleVR() {
    if (this.state.processingClick) return;

    this.setState({ processingClick: true });

    if (!feature.hasVR) {
      return;
    }
    if (viewer.vrEffect.isPresenting) {
      viewer.vrEffect.exitPresent();
      viewer.switchCamera('orthographic');
      this.setState({ processingClick: false });
    } else {
      viewer.vrEffect.requestPresent();
      this.props.toggleVROverlay();
      await audio.fadeOut();

      viewer.switchCamera('default');
      await sleep(1000);

      audio.pause();
      audio.rewind();
      await sleep(4000);

      this.props.toggleVROverlay();
      this.setState({ processingClick: false });
      audio.play();
    }
  }

  render({ label }) {
    return (
      <ButtonItem
        label={label && (
          feature.hasVR
            ? viewer.vrEffect.isPresenting
              ? 'Exit VR'
              : 'Enter VR'
            : 'VR not found'
          )
        }
        onClick={this.toggleVR}
        icon={feature.hasVR ? enterIconSvg : enterIconDisabledSvg}
      />
    );
  }
}
