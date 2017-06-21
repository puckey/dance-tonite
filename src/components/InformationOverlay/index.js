/** @jsx h */
import { h, Component } from 'preact';
import './style.scss';
import viewer from '../../viewer';
import router from '../../router';
import { sleep } from '../../utils/async';

// TODO: implement:
// const createOverlay = () => {
//   if (elements.overlayEl) return;
//   elements.overlayEl = feature.has6DOF ? hud.create(
//     'div.tutorial-overlay',
//     h('div.tutorial-overlay-text', h('a', { onclick: performSkip }, 'Add your performance')),
//   ) :
//   hud.create(
//     'div.tutorial-overlay',
//     h(
//       'div.tutorial-overlay-text',
//       h(
//         'span',
//         h('h3', 'Shucks, room-scale VR not found.'),
//         h('p', 'This requires room-scale VR and a WebVR-enabled browser.'),
//         h('a', { href: 'https://webvr.info', target: '_blank' }, 'Get set up'),
//         ' or ',
//         h('a', { onclick: performSkip }, 'return home.')
//       )
//     ),
//   );
// };

export default class InformationOverlay extends Component {
  constructor() {
    super();

    this.addPerformance = this.addPerformance.bind(this);
  }

  async addPerformance() {
    const { goto, toggleVROverlay } = this.props;
    toggleVROverlay();
    if (!viewer.vrEffect.isPresenting) {
      await viewer.vrEffect.requestPresent();
    }
    // Wait for the VR overlay to cover the screen:
    await sleep(500);
    goto('record');
  }

  render({ type }) {
    if (type === 'add-performance') {
      return (
        <div className="information-overlay">
          <div className="information-overlay-text">
            <a onClick={this.addPerformance}>Add your performance</a>
          </div>
        </div>
      );
    }

    if (type === 'room-scale-error') {
      return (
        <div className="information-overlay">
          <div className="information-overlay-text">
            <p>To add your dance, you will need a room-scale VR device and a WebVR-enabled browser.</p>
            <a href="https://webvr.info" target="_blank" rel="noopener noreferrer">
              Learn more
            </a> or <a onClick={() => router.navigate('/')}>
              continue watching
            </a>
          </div>
        </div>
      );
    }

    return false;
  }
}
