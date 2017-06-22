/** @jsx h */
import { h, Component } from 'preact';

import './style.scss';
import enterIconSvg from './icons/entervr.svg';
import enterIconDisabledSvg from './icons/x_entervr.svg';

import { sleep } from '../../utils/async';
import feature from '../../utils/feature';
import viewer from '../../viewer';
import audio from '../../audio';
import pov from '../../pov';

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
    audio.pause();

    if (viewer.vrEffect.isPresenting) {
      viewer.vrEffect.exitPresent();
      viewer.switchCamera('orthographic');
      this.setState({ processingClick: false });
    } else {
      this.props.toggleVROverlay();

      if (!feature.hasVR) {
        this.setState({ processingClick: false });
        return;
      }

      viewer.vrEffect.requestPresent();
      await audio.fadeOut();

      viewer.switchCamera('default');
      await sleep(1000);

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
