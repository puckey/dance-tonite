import feature from './feature';

export default () => {
  document.body.classList.add('mod-mobile');

  if (!feature.isIOs) return;

  // Disable pinch to zoom and double tap on iOs devices, since they no longer
  // listen to the 'user-scalable=no' viewport meta tag:
  let lastTouchEvent = 0;

  document.addEventListener('touchmove', (event) => {
    // Disable scaling
    if (event.scale !== 1) event.preventDefault();
  }, false);

  document.addEventListener('gesturestart', (event) => {
    // Disable gestures
    event.preventDefault();
  }, false);

  document.addEventListener('touchstart', (event) => {
    // Disable double tap (prev touch less than 300ms prior) and disable using multiple fingers
    if (event.timeStamp - lastTouchEvent <= 300 || event.touches.length > 1) {
      event.preventDefault();
    }

    // Record time of last touch
    lastTouchEvent = event.timeStamp;
  }, false);
};
