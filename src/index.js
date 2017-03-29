// import store from './store';
// import rootSaga from './sagas';
// import 'babel-polyfill';

// store.runSaga(rootSaga);
import rafLoop from './lib/rafLoop';
import timeline from './lib/timeline';

const then = Date.now();

rafLoop.add(() => {
  const time = Date.now() - then;
  timeline.tick(time);
});

timeline.add(2000, 'pan-left');
timeline.add(4000, 'top-view', () => {
  console.log('top view is now active');
});

timeline.on('pan-left', () => {
  console.log('pan-left is now active');
});
