const GIFEncoder = require('./gif-encoder.js');

const renderFrame = (frame) => {
  let page;
  let transfer;
  const encoder = new GIFEncoder(frame.width, frame.height);
  if (frame.index === 0) {
    encoder.writeHeader();
  } else {
    encoder.firstFrame = false;
  }
  encoder.setTransparent(frame.transparent);
  encoder.setDispose(frame.dispose);
  encoder.setRepeat(frame.repeat);
  encoder.setDelay(frame.delay);
  encoder.setQuality(frame.quality);
  encoder.setDither(frame.dither);
  encoder.setGlobalPalette(frame.globalPalette);
  encoder.addFrame(frame.data);
  if (frame.last) {
    encoder.finish();
  }
  if (frame.globalPalette === true) {
    frame.globalPalette = encoder.getGlobalPalette();
  }
  const stream = encoder.stream();
  frame.data = stream.pages;
  frame.cursor = stream.cursor;
  frame.pageSize = stream.constructor.pageSize;
  if (frame.canTransfer) {
    transfer = (() => {
      let i;
      let len;
      const ref = frame.data;
      const results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        page = ref[i];
        results.push(page.buffer);
      }
      return results;
    })();
  }
  return [frame, transfer];
};

export default renderFrame;

// self.onmessage = function(event) {
//   return renderFrame(event.data);
// };
