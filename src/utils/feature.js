const userAgent = navigator.userAgent;

const checkHasExternalDisplay = () => (
  new Promise((resolve, reject) => {
    if (navigator.getVRDisplays === undefined) {
      resolve(false);
      return;
    }
    navigator.getVRDisplays().then(
      (displays) => {
        resolve(
          !!displays[0] &&
          !!displays[0].capabilities &&
          !!displays[0].capabilities.hasExternalDisplay
        );
      }
    ).catch(reject);
  })
);

const checkHasVR = () => (
  new Promise((resolve, reject) => {
    if (navigator.getVRDisplays === undefined) {
      resolve(false);
      return;
    }
    navigator.getVRDisplays().then(() => {
      resolve(true);
    })
    .catch(reject);
  })
);

const checkHas6DOF = () => (
  new Promise((resolve, reject) => {
    if (navigator.getVRDisplays === undefined) {
      resolve(false);
      return;
    }
    navigator.getVRDisplays().then(
      (displays) => {
        resolve(
          !!displays[0] &&
          !!displays[0].capabilities &&
          !!displays[0].capabilities.hasPosition &&
          !!displays[0].capabilities.hasOrientation
        );
      }
    ).catch(reject);
  })
);

const version = window.localStorage.getItem('version');

const feature = {
  isMobile: /android|ipad|iphone|iemobile/i.test(userAgent),
  isAndroid: /android/i.test(userAgent),
  isChrome: /chrome/i.test(userAgent),
  isIODaydream: version === 'io-daydream',
  isIOVive: version === 'io-vive',
  prepare: () => (
    Promise.all([
      checkHasExternalDisplay().then((hasExternalDisplay) => {
        feature.hasExternalDisplay = hasExternalDisplay;
      }),
      checkHasVR().then((hasVR) => {
        feature.hasVR = hasVR;
      }),
      checkHas6DOF().then((has6DOF) => {
        feature.has6DOF = has6DOF;
      }),
    ])
  ),
};

feature.isIO = !!feature.isIODaydream || !!feature.isIOVive;

export default feature;
