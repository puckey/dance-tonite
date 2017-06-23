/** @jsx h */
import { h, Component } from 'preact';
import './style.scss';
import viewer from '../../viewer';
import router from '../../router';
import { sleep } from '../../utils/async';
import Align from '../../components/Align';
import ButtonClose from '../../components/ButtonClose';

export default class InformationOverlay extends Component {
  constructor() {
    super();

    this.addPerformance = this.addPerformance.bind(this);
  }

  async addPerformance() {
    const { goto, toggleVROverlay } = this.props;
    toggleVROverlay();
    if (!viewer.isPresentingVR()) {
      await viewer.requestPresentVR();
    }
    // Wait for the VR overlay to cover the screen:
    await sleep(500);
    goto('record');
  }

  render({ type }) {
    if (type === 'add-performance') {
      return (
        <div className="information-overlay" onClick={this.props.close}>
          <div className="information-overlay-text">
            <a onClick={this.addPerformance}>Add your performance</a>
          </div>
        </div>
      );
    }

    if (type === 'room-scale-error') {
      return (
        <div className="information-overlay" onClick={() => router.navigate('/')}>
          <div className="information-overlay-text">
            <p>
              To add your dance, you will need a room-scale VR
              device and a WebVR-enabled browser.
            </p>
            <a href="https://webvr.info" target="_blank" rel="noopener noreferrer">
              Learn more
            </a> or <a onClick={() => router.navigate('/')}>
              continue watching
            </a>.
          </div>
        </div>
      );
    }

    if (type === 'no-vr') {
      return (
        <div>
          <Align type="top-right">
            <ButtonClose onClick={this.props.close} />
          </Align>
          <div className="information-overlay" onClick={this.props.close}>
            <div className="information-overlay-text">
              <p>Headset required to watch in VR.</p>
              <a href="https://webvr.info" target="_blank" rel="noopener noreferrer">
                Learn more
              </a> or <a onClick={this.props.close}>
                continue watching without VR
              </a>.
            </div>
          </div>
        </div>
      );
    }

    return false;
  }
}
