import { isApp } from './utils/feature';
import store from './store';
import rootSaga from './sagas';

if (!isApp) {
  require('babel-polyfill'); // eslint-disable-line global-require
}

// So we can get a new hash when we want to:
window.HASH_VERSION = '1.6';

// Hack to avoid ios user zooming:
document.addEventListener('gesturestart', (e) => {
  e.preventDefault();
});

// import { whyDidYouUpdate } from 'why-did-you-update';
//
// if (process.env.NODE_ENV === 'development') {
//   whyDidYouUpdate(React);
// }

// setInterval(() => {
//   loop.once(() => {
//     window.ga('send', {
//       hitType: 'event',
//       eventCategory: 'Control',
//       eventAction: 'stay',
//       eventLabel: 'Bounce Rate',
//     });
//   });
// }, 120000);

store.runSaga(rootSaga);
