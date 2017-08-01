import NoSleep from '../lib/no-sleep';

let noSleep;
const logging = false;

const nosleep = {
  create: () => {
    if (logging) console.log('nosleep created')
    noSleep = new NoSleep();
  },
  enable: () => {
    if (logging) console.log('nosleep enable')
    if (NoSleep) noSleep.enable();
  },
  disable: () => {
    if (logging) console.log('nosleep disable')
    if (NoSleep) noSleep.disable();
  },
};

export default nosleep;
