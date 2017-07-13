import feature from './utils/feature';

const packs = [
  {
    test: () => feature.hasWebVR,
    prepare: () => (
      new Promise((resolve) => {
        require.ensure([], function (require) {
          deps.SDFText = require('./sdftext');
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
          //  race condition vs the above sdftext require above
          //  this has to be here too?
          //  FIXME
          deps.SDFText = require('./sdftext');
          deps.controllers = require('./controllers').default;
          deps.GIF = require('./lib/gif');
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
