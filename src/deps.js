import feature from './utils/feature';

const deps = {
  prepare: () => (
    new Promise((resolve) => {
      require.ensure([], function (require) {
        if (feature.has6DOF) {
          deps.SDFText = require('./sdftext');
          deps.controllers = require('./controllers').default;
          deps.GIF = require('./lib/gif');
        }
        resolve();
      });
    })
  ),
};

export default deps;
