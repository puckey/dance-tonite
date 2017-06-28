const userAgent = navigator.userAgent;

const checkHasWebGL = () => {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl')
    || canvas.getContext('experimental-webgl');
  return (gl && gl instanceof WebGLRenderingContext);
};

const hasWebVR = navigator.getVRDisplays !== undefined;

const getVRDisplays = () => (
  new Promise((resolve) => {
    if (!hasWebVR) {
      resolve(false);
      return;
    }
    navigator
      .getVRDisplays()
      .then((displays) => {
        resolve(displays);
      })
      .catch((error) => {
        console.log(error);
        resolve(false);
      });
  })
);

const checkHasExternalDisplay = () => (
  new Promise((resolve) => {
    if (!hasWebVR) {
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
    if (!hasWebVR && !vrPolyfill) {
      resolve(false);
      return;
    }
    navigator
      .getVRDisplays()
      .then((displays) => {
        if (displays.length === 0) resolve(false);
        else resolve(true);
      })
      .catch((error) => {
        console.log(error);
        resolve(false);
      });
  })
);

const checkHas6DOF = () => (
  new Promise((resolve) => {
    if (!hasWebVR) {
      resolve(false);
      return;
    }
    navigator
      .getVRDisplays()
      .then((displays) => {
        resolve(
          !!displays[0] &&
          !!displays[0].capabilities &&
          !!displays[0].capabilities.hasPosition
        );
      })
      .catch((error) => {
        console.log(error);
        resolve(false);
      });
  })
);


const isAndroid = /android/i.test(userAgent);
const isMobile = /android|ipad|iphone|iemobile/i.test(userAgent);
const isTablet = (isAndroid && !/mobile/i.test(userAgent)) // https://stackoverflow.com/questions/5341637/how-do-detect-android-tablets-in-general-useragent
  || /ipad/i.test(userAgent);
const vrPolyfill = isMobile && !isTablet && !isAndroid && (navigator.getVRDisplays === undefined);


const feature = {
  isMobile,
  isTablet,
  isAndroid,
  isChrome: /chrome/i.test(userAgent),
  stats: /fps/.test(window.location.hash),
  vrPolyfill,
  hasWebGL: checkHasWebGL(),
  hasWebVR,
  prepare: () => (
    Promise.all([
      checkHasVR()
        .then((hasVR) => {
          feature.hasVR = !feature.isTablet && hasVR;
        }),
      getVRDisplays()
        .then((vrDisplays) => {
          feature.vrDisplays = vrDisplays.length;
          if (vrDisplays && vrDisplays.length > 0) {
            //  Yes, this must be the full vrDisplay instance
            //  because we want to check isPresenting in analytics!
            feature.vrDisplay = vrDisplays[0];
            const displayName = vrDisplays[0].displayName;
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
          }
        }),
      checkHasExternalDisplay()
        .then((hasExternalDisplay) => {
          feature.hasExternalDisplay = hasExternalDisplay;
        }),
      checkHas6DOF()
        .then((has6DOF) => {
          feature.has6DOF = has6DOF;
        }),
    ])
  ),
};

export default feature;
