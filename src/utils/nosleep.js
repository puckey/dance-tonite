import NoSleep from '../lib/no-sleep';

let noSleep;

const nosleep = {
  create: () => {
    console.log('nosleep created')
    noSleep = new NoSleep();
  },
  enable: () => {
    console.log('nosleep enable')
    if (NoSleep) noSleep.enable();
  },
  disable: () => {
    console.log('nosleep disable')
    if (NoSleep) noSleep.disable();
  },
};

export default nosleep;
