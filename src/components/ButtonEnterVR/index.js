/** @jsx h */
import { h } from 'preact';
import './style.scss';
import { sleep } from '../../utils/async';
import feature from '../../utils/feature';
import viewer from '../../viewer';
import audio from '../../audio';
import hud from '../../hud';
import enterIconSvg from './icons/entervr.svg';
import enterIconDisabledSvg from './icons/x_entervr.svg';
import ButtonItem from '../ButtonItem';

const toggleVR = async () => {
  if (!feature.hasVR) {
    return;
  }
  if (viewer.vrEffect.isPresenting) {
    viewer.vrEffect.exitPresent();
    viewer.switchCamera('orthographic');
  } else {
    viewer.vrEffect.requestPresent();
    const removeMessage = hud.enterVR();
    await audio.fadeOut();
    viewer.switchCamera('default');
    await sleep(1000);
    audio.pause();
    audio.rewind();
    await sleep(4000);
    removeMessage();
    audio.play();
  }
};

export default ({ label }) => (
  <ButtonItem
    label={label && (feature.hasVR ? 'Enter VR' : 'VR not found')}
    onClick={toggleVR}
    icon={feature.hasVR ? enterIconSvg : enterIconDisabledSvg}
  />
);
