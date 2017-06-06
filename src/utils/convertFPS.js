import * as serializer from './serializer';

const ORIGINAL_FPS = 90;

const convertFrame = (frames, number) => {
  const ratio = number % 1;
  const lower = serializer.getFrame(frames, Math.floor(number));
  const higher = serializer.getFrame(frames, Math.ceil(number));
  const newValues = [];
  for (let i = 0, l = serializer.count(lower); i < l; i++) {
    for (let j = 0; j < 3; j++) {
      serializer.serialize(
        serializer.avgPosition(lower, higher, ratio, i, j),
        serializer.avgQuaternion(lower, higher, ratio, i, j)
      ).forEach(num => newValues.push(num));
    }
  }
  return newValues;
};

const numberedArray = (length) => Array // eslint-disable-line
  .apply(null, { length })
  .map(Number.call, Number);

export default (data, fps) => {
  const frames = data.slice(1);
  const count = Math.floor(frames.length / ORIGINAL_FPS * fps);
  const newFrames = numberedArray(count)
    .map(number => convertFrame(frames, number / fps * ORIGINAL_FPS));
  newFrames.unshift(Object.assign({ fps }, data[0]));
  return newFrames;
};
