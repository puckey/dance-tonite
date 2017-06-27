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
    this.updateVRStatus = this.updateVRStatus.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
    this.updateVRStatus(viewer.vrEffect.isPresenting);
    viewer.on('vr-present-change', this.updateVRStatus);
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  updateVRStatus(presenting) {
    this.setState({ presenting });
  }

  render({ label, onClick }, { presenting }) {
    return (
      <ButtonItem
        label={label && (
          feature.hasVR
            ? presenting
              ? 'Exit VR'
              : 'Enter VR'
            : 'VR not found'
          )
        }
        onClick={onClick}
        icon={feature.hasVR ? enterIconSvg : enterIconDisabledSvg}
      />
    );
  }
}
