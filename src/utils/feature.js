const userAgent = navigator.userAgent;
const vrSupported = navigator.getVRDisplays !== undefined;

const checkHasExternalDisplay = () => (
  new Promise((resolve, reject) => {
    if (!vrSupported) {
      resolve(false);
      return;
    }
    navigator
      .getVRDisplays()
      .then(
        (displays) => {
          resolve(
            !!displays[0] &&
            !!displays[0].capabilities &&
            !!displays[0].capabilities.hasExternalDisplay
          );
        }
      )
      .catch(reject);
  })
);

const checkHasVR = () => (
  new Promise((resolve) => {
    if (!vrSupported) {
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
  new Promise((resolve) => {
    if (!vrSupported) {
      resolve(false);
      return;
    }
    navigator
      .getVRDisplays()
      .then((displays) => {
        resolve(
          !!displays[0] &&
          !!displays[0].capabilities &&
          !!displays[0].capabilities.hasPosition &&
          !!displays[0].capabilities.hasOrientation
        );
      })
      .catch((error) => {
        console.log(error);
        resolve(false);
      });
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
