/** @jsx h */
import { h } from 'preact';
import './style.scss';
import { sleep } from '../../../../utils/async';
import feature from '../../../../utils/feature';
import viewer from '../../../../viewer';
import audio from '../../../../audio';
import hud from '../../../../hud';
import MenuItem from '../MenuItem';
import enterIconSvg from '../../../../hud/icons/entervr.svg';
import enterIconDisabledSvg from '../../../../hud/icons/x_entervr.svg';

export default class EnterVRButton extends MenuItem {
  constructor() {
    super();

    this.toggleVR = this.toggleVR.bind(this);
  }

  async toggleVR() {
    if (!feature.hasVR) {
      return;
    }
    if (viewer.vrEffect.isPresenting) {
      viewer.vrEffect.exitPresent();
      viewer.switchCamera('orthographic');
    } else {
      viewer.vrEffect.requestPresent();
      this.removeMessage = hud.enterVR();
      await audio.fadeOut();
      viewer.switchCamera('default');
      await sleep(1000);
      audio.pause();
      audio.rewind();
      await sleep(4000);
      this.removeMessage();
      audio.play();
    }
  }

  render() {
    return (
      <div
        className="cms-menu-item"
        dangerouslySetInnerHTML={{ __html: feature.hasVR ? enterIconSvg : enterIconDisabledSvg }}
        onClick={this.toggleVR}
      />
    );
  }
}
