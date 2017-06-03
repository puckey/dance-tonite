const userAgent = navigator.userAgent;

/*
const vrFeatures = {
  hasVR: false,
  hasExternalDisplay: false,
  has3DOF: false,
  has6DOF: false,
};
if (navigator.getVRDisplays !== undefined) {
  navigator.getVRDisplays().then((displays) => {
    if (!!displays && displays.length) {
      vrFeatures.hasVR = true;
      //  We’re going to take the FIRST display and call it a day.
      //  I look forward to the day this becomes an issue ;)
      const display = displays[0];
      if (display.capabilities !== undefined) {
        Object.assign(vrFeatures, {
          hasExternalDisplay: !!display.capabilities.hasExternalDisplay,
          has3DOF: !!display.capabilities.hasPosition +
            !!display.capabilities.hasOrientation === 1,
          has6DOF: !!display.capabilities.hasPosition && !!display.capabilities.hasOrientation,
        });
      }
    }
  });
}*/


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
  new Promise((resolve) => {
    if (!navigator.getVRDisplays) {
      resolve(false);
      return;
    }
    navigator
      .getVRDisplays()
      .then(() => {
        resolve(true);
      })
      .catch((error) => {
        console.log(error);
        resolve(false);
      });
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

const feature = {
  isMobile: /android|ipad|iphone|iemobile/i.test(userAgent),
  isAndroid: /android/i.test(userAgent),
  isChrome: /chrome/i.test(userAgent),
  stats: /fps/.test(window.location.hash),
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

export default feature;
