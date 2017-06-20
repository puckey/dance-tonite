/** @jsx h */
import { h } from 'preact';
import './style.scss';

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

export default function TutorialOverlay({ onClickSkip }) {
  return (
    <div className="tutorial-overlay">
      <div className="tutorial-overlay-text">
        <a onClick={onClickSkip}>Add your performance!</a>
      </div>
    </div>
  );
}
