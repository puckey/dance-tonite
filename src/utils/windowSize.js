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
  //  Possible issue causing IOS to not get the correct sizes:
  //  https://github.com/dimsemenov/PhotoSwipe/issues/1315
  window.setTimeout(function () {
    const width = size.width = window.innerWidth;
    const height = size.height = window.innerHeight;
    size.aspectRatio = width / height;
    size.emit('resize', size);
  }, 500);
});

export default size;
