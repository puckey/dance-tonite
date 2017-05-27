import emitter from 'mitt';

const size = Object.assign(
  emitter(),
  {
    width: window.innerWidth,
    height: window.innerHeight,
  }
);

window.addEventListener('resize', () => {
  const width = size.width = window.innerWidth;
  const height = size.height = window.innerHeight;
  size.emit('resize', width, height);
});

export default size;
