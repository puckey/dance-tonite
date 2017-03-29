// import store from './store';
// import rootSaga from './sagas';
// import 'babel-polyfill';

// store.runSaga(rootSaga);
import timeline from './lib/timeline';

const tl1 = timeline([
  {
    time: 3000,
    marker: 'pan-left',
  },
  {
    time: 6000,
    marker: 'top-view',
    callback() {
      console.log('top-view is now active');
    },
  },
]);

tl1.on('pan-left', () => {
  console.log('pan-left is now active');
});
