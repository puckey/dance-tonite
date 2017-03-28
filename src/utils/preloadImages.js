import eachLimit from 'async.eachlimit';

function preloadImage(src, callback) {
  if (!src) {
    callback();
    return;
  }
  function onError() {
    callback('an error occurred');
  }

  function onLoad() {
    callback();
  }

  const image = new Image();
  image.src = src;
  image.onload = onLoad;
  image.onerror = onError;
  image.onabort = onError;
}

export default function preloadImages(images, callback) {
  if (!images) {
    callback();
    return;
  }
  eachLimit(images, 4, preloadImage, callback);
}
