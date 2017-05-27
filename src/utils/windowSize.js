import emitter from 'mitt';

const size = Object.assign(
  emitter(),
  {
    width: window.innerWidth,
    height: window.innerHeight,
  }
);

size.aspectRatio = size.width / size.height;

window.addEventListener('resize', () => {
  const width = size.width = window.innerWidth;
  const height = size.height = window.innerHeight;
  const aspectRatio = size.aspectRatio = width / height;
  size.emit('resize', { width, height, aspectRatio });
});

export default size;
