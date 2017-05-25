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

const feature = {
  isMobile: /android|ipad|iphone|iemobile/i.test(userAgent),
  isAndroid: /android/i.test(userAgent),
  isChrome: /chrome/i.test(userAgent),
  prepare: () => (
    Promise.all([
      checkHasExternalDisplay().then((hasExternalDisplay) => {
        feature.hasExternalDisplay = hasExternalDisplay;
      }),
      checkHasVR().then((hasVR) => {
        feature.hasVR = hasVR;
      }),
    ])
  ),
};

export default feature;
