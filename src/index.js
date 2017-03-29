// import store from './store';
// import rootSaga from './sagas';
// import 'babel-polyfill';

// store.runSaga(rootSaga);
import rafLoop from './lib/rafLoop';
import timeline from './lib/timeline';

const then = Date.now();
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

tl1.once(4000, 'one-time-event', () => {
  console.log('this event is triggered exactly once if the specified time has elapsed');
});

rafLoop.add(() => {
  const time = Date.now() - then;
  tl1.tick(time);
});

tl1.on('pan-left', () => {
  console.log('pan-left is now active');
});
