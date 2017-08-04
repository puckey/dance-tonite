import feature from './utils/feature';

const packs = [
  {
    test: () => feature.hasVR,
    prepare: () => (
      new Promise((resolve) => {
        require.ensure([], function (require) {
          deps.SDFText = require('./sdftext');
          deps.controllers = require('./controllers').default;
          resolve();
        });
      })
    ),
  },
  {
    test: () => feature.has6DOF,
    prepare: () => (
      new Promise((resolve) => {
        require.ensure([], function (require) {
          deps.GIF = require('./third_party/gif');
          resolve();
        });
      })
    ),
  },
];

const deps = {
  prepare: () => Promise.all(
    packs
      .filter(pack => pack.test())
      .map(pack => pack.prepare())
  ),
};

export default deps;
