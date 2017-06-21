/** @jsx h */
import { h, Component } from 'preact';
import './style.scss';
import viewer from '../../viewer';
import feature from '../../utils/feature';
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
    if (feature.has6DOF) {
      toggleVROverlay();
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

  render({ type }) {
    return (
      <div className="information-overlay">
        <div className="information-overlay-text">
          <a onClick={this.addPerformance}>Add your performance</a>
        </div>
      </div>
    );
  }
}
