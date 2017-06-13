const userAgent = navigator.userAgent;

const vrSupported = () => {
  return navigator.getVRDisplays !== undefined;
};

const checkHasExternalDisplay = () => (
  new Promise((resolve) => {
    if (!vrSupported()) {
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
      .catch((error) => {
        console.log(error);
        resolve(false);
      });
  })
);

const checkHasVR = () => (
  new Promise((resolve) => {
    if (!vrSupported()) {
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
    if (!vrSupported()) {
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

const getVRDisplayName = () => (
  new Promise((resolve) => {
    if (!vrSupported()) {
      resolve(false);
      return;
    }
    navigator
      .getVRDisplays()
      .then((displays) => {
        resolve(displays[0].displayName);
      })
      .catch((error) => {
        console.log(error);
        resolve(false);
      });
  })
);
const isAndroid = /android/i.test(userAgent);
const feature = {
  isMobile: /android|ipad|iphone|iemobile/i.test(userAgent),
  isTablet: (isAndroid && !/mobile/i.test(userAgent)) // https://stackoverflow.com/questions/5341637/how-do-detect-android-tablets-in-general-useragent
    || /ipad/i.test(userAgent),
  isAndroid,
  isChrome: /chrome/i.test(userAgent),
  stats: /fps/.test(window.location.hash),
  prepare: () => (
    Promise.all([
      checkHasExternalDisplay()
        .then((hasExternalDisplay) => {
          feature.hasExternalDisplay = hasExternalDisplay;
        }),
      checkHasVR()
        .then((hasVR) => {
          feature.hasVR = !feature.isTablet && hasVR;
        }),
      checkHas6DOF()
        .then((has6DOF) => {
          feature.has6DOF = has6DOF;
        }),
      getVRDisplayName()
        .then((displayName) => {
          //  Expecting "Google, Inc. Daydream View".
          //  Unclear if stand-alone Daydream just announced at I/O 2017
          //  will eventually require its own displayName check.
          feature.isDaydream = /daydream/i.test(displayName);
          //  Expecting "HTC Vive DVT".
          feature.isVive = /vive/i.test(displayName);
          //  Expecting "Oculus VR HMD (HMD)" or "Oculus VR HMD (Sensor)".
          //  Note that "Rift" is NOT part of the displayName.
          feature.isOculus = /oculus/i.test(displayName);
          //  If it’s mobile but it’s not Daydream then we can consider
          //  it to be “Cardbaord” since we’re using the WebVR Polyfill
          //  to make any mobile device (with accelerometers) a potential
          //  3DOF virtual reality device.
          feature.isCardboard = feature.isMobile && !feature.isDaydream;
        }),
    ])
  ),
};

export default feature;
