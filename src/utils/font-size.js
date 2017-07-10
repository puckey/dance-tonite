import windowSize from './windowSize';

const maxWidth = 1920;
const minWidth = 1024;
const maxFontSize = 40;
const minFontSize = 20;

export default () => (
  windowSize.width < minWidth
    ? minFontSize
    : windowSize.width > maxWidth
      ? maxFontSize
      : minFontSize / minWidth * windowSize.width
);
