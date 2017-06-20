import emitter from 'mitt';

const size = Object.assign(
  emitter(),
  {
    width: window.innerWidth,
    height: window.innerHeight,
  }
);

size.aspectRatio = size.width / size.height;

function onResize() {
  const width = size.width = window.innerWidth;
  const height = size.height = window.innerHeight;
  const aspectRatio = size.aspectRatio = width / height;
  size.emit('resize', { width, height, aspectRatio });
}

window.addEventListener('resize', onResize);
window.addEventListener('orientationchange', onResize);

export default size;
