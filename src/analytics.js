import feature from './utils/feature';


//  Google Analytics injection.

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
window.ga('create', 'UA-97851584-1', 'auto');
window.ga('send', 'pageview');


//  Custom Analytics
//  https://github.com/puckey/you-move-me/issues/315

const verbosity = 1;


const analytics = {
  //  Super general event recording. Most stuff gets funneled through this.
  record: (obj) => {
    if (verbosity >= 0.5) console.log('Note:', obj);
    if (window.ga !== undefined && typeof window.ga === 'function') {
      window.ga('send', obj);
      if (verbosity >= 0.5) console.log('Noted.');
    }
  },
  //  This is basically a “bounce” event recording.
  recordOutboundLink: (a) => {
    const url = a.getAttribute('href');
    if (verbosity >= 0.5) console.log('Note:', url);
    if (window.ga !== undefined && typeof window.ga === 'function') {
      window.ga('send', 'event', 'outbound', 'click', url, {
        transport: 'beacon',
        hitCallback: function () {},
        //hitCallback: function(){ document.location = url }
      });
    }
    return true;
  },
  //  -------------------------------------------------- Section Session
  // -------------- *************** check with GA that this records session time automagically!!!!!
  // right now this must be called manually
  //  but can we make a location.href event listener instead? would that make sense??????
  recordSectionChange: (label) => {
    if (verbosity >= 0.5) console.log('Note:', label);
    if (window.ga !== undefined && typeof window.ga === 'function') {
      window.ga('set', {
        page: document.location.href,
        title: label,
      });
      window.ga('send', 'pageview');
    }
  },
  recordInternalLink: (a) => { // ****** HOW IS THIS DIF THAN ABOVE?????????
    // const url = a.getAttribute('href');
    // if (verbosity >= 0.5) console.log('Note:', url);
    // if (window.ga !== undefined && typeof window.ga === 'function') {
    //   window.ga('send', 'event', 'outbound', 'click', url, {
    //     transport: 'beacon',
    //     hitCallback: function () {},
    //     //hitCallback: function(){ document.location = url }
    //   });
    // }
    // return true;
  },
  //  -------------------------------------------------- Countables
  countables: [],
  recordCountable: (label) => {
    if (typeof analytics.countables[label] !== 'number') analytics.countables[label] = 0;
    analytics.countables[label]++;
    analytics.record({
      hitType: 'event',
      eventCategory: 'Countables',
      eventAction: label,
      value: analytics.countables[label],
      nonInteraction: true, // Don’t count this as separate “page.”
    });
  },
  //  -------------------------------------------------- Timeables
  timeables: [],
  recordTimeableStart: (label) => {
    analytics.timeables[label] = Date.now();
  },
  recordTimeableStop: (label) => {
    if (analytics.timeables[label] !== undefined) {
      const duration = Date.now() - analytics.timeables[label];
      analytics.record({
        hitType: 'event',
        eventCategory: 'Timeables',
        eventAction: label,
        value: duration / 1000, //  Unit is seconds, accurate to milliseconds.
        nonInteraction: true,   //  Don’t count this as separate “page.”
      });
    }
  },


  //  -------------------------------------------------- VR Session: VR entry / exit ATTEMPT
  //  NOTE: These functions must be called manually when
  //  the user clicks or taps to initiate a VR session.
  //  Compare to VR entry / exit SUCCESS (far) below.
  recordVREntryAttempt: () => {
    analytics.record({
      hitType: 'event',
      eventCategory: 'VR Session',
      eventAction: 'VR Entry',
      eventLabel: 'VR entry attempted',
    });
  },
  recordVRExitAttempt: () => {
    analytics.record({
      hitType: 'event',
      eventCategory: 'VR Session',
      eventAction: 'VR Exit',
      eventLabel: 'VR exit attempted',
    });
  },
  //  -------------------------------------------------- VR Session: Orb select
  orbSelects: 0,
  recordOrbSelect: () => {
    analytics.orbSelects++;
    analytics.record({
      hitType: 'event',
      eventCategory: 'VR Session',
      eventAction: 'Milestones',
      eventLabel: 'Orb select',
      value: analytics.orbSelects,
      nonInteraction: true, // Don’t count this as separate “page.”
    });
  },
  //  -------------------------------------------------- VR Session: Clicks on Heads
  headSelects: 0,
  recordHeadSelect: () => {
    analytics.headSelects++;
    analytics.record({
      hitType: 'event',
      eventCategory: 'VR Session',
      eventAction: 'Milestones',
      eventLabel: 'Head clicks',
      value: analytics.headSelects,
      nonInteraction: true, // Don’t count this as separate “page.”
    });
  },
  //  -------------------------------------------------- VR Session: Made it to credits
  creditViews: 0,
  recordCreditsView: () => {
    analytics.creditViews++;
    analytics.record({
      hitType: 'event',
      eventCategory: 'VR Session',
      eventAction: 'Milestones',
      eventLabel: 'Credits',
      value: analytics.creditViews,
      nonInteraction: true, // Don’t count this as separate “page.”
    });
  },


  mount: () => {
    /*

    Some things already covered by Google Analytics:
    - Platform (divided by device, OS, browser, etc.)
    - Desktop vs Mobile (divded into phone / tablet)
    - Inbound links (divided into Direct, Social, etc.)
    - Total time on site.

    *******
    need to add look through all anchor elements to add link tracking.
    inbound vs outbound vs section change tracking???

    */
    //  -------------------------------------------------- Capabilities: WebGL
    if (feature.hasWebGL) {
      analytics.record({
        hitType: 'event',
        eventCategory: 'Capabilities',
        eventAction: 'WebGL Detect',
        eventLabel: 'WebGL is present',
        nonInteraction: true,
      });
    } else {
      analytics.record({
        hitType: 'event',
        eventCategory: 'Capabilities',
        eventAction: 'WebGL Detect',
        eventLabel: 'WebGL is absent',
        nonInteraction: true,
      });
    }
    //  -------------------------------------------------- Capabilities: WebVR
    if (feature.hasWebVR) {
      analytics.record({
        hitType: 'event',
        eventCategory: 'Capabilities',
        eventAction: 'WebVR API Detect',
        eventLabel: 'WebVR API is present',
        nonInteraction: true,
      });
    } else {
      analytics.record({
        hitType: 'event',
        eventCategory: 'Capabilities',
        eventAction: 'WebVR API Detect',
        eventLabel: 'WebVR API is absent',
        nonInteraction: true,
      });
    }
    //  -------------------------------------------------- Capabilities: VR Displays
    if (feature.vrDisplays.length > 0) {
      analytics.record({
        hitType: 'event',
        eventCategory: 'Capabilities',
        eventAction: 'VR Displays Detect',
        eventLabel: 'VR Displays are present',
        value: feature.vrDisplays.length,
        nonInteraction: true,
      });
    } else {
      analytics.record({
        hitType: 'event',
        eventCategory: 'Capabilities',
        eventAction: 'VR Displays Detect',
        eventLabel: 'VR Displays are absent',
        nonInteraction: true,
      });
    }
    //  -------------------------------------------------- Capabilities: VR device STRING
    //  NOTE: We’re only recording the primary VR device,
    //  ie. whatever’s in vrDisplays[0], because that’s what
    //  our code will render for. They might have two VR
    //  devices, like a Rift and Vive, but we want to know
    //  what they’re actually using for this experience.
    if (feature.vrDisplay) {
      analytics.record({
        hitType: 'event',
        eventCategory: 'Capabilities',
        eventAction: 'VR Device String',
        eventLabel: feature.vrDisplay.displayName,
        nonInteraction: true,
      });
    }
    //  -------------------------------------------------- Capabilities: VR device BUCKET
    //  Subtle difference between STRING and BUCKET is these
    //  names below correspond to our own feature detection
    //  buckets while the STRING is the raw displayName reported
    //  directly from vrDisplay without intervention.
    if (feature.vrDisplay) {
      (function () {
        const obj = {
          hitType: 'event',
          eventCategory: 'Capabilities',
          eventAction: 'VR Device Bucket',
          nonInteraction: true,
        };
        if (feature.isVive) {
          obj.eventLabel = 'HTC Vive';
        } else if (feature.isOculus) {
          obj.eventLabel = 'Oculus';//  Note that “Rift” is not part of the name.
        } else if (feature.isSamsungGearVR) {
          obj.eventLabel = 'Samsung GearVR';
        } else if (feature.isDaydream) {
          obj.eventLabel = 'Google Daydream';
        } else if (feature.isCardboard) {
          obj.eventLabel = 'Cardboard (fallback)';// isMobile + Polyfill (ie NOT Daydream)
        } else obj.eventLabel = 'Unknown';
        analytics.record(obj);
      }());
    }
    //  -------------------------------------------------- VR Session: VR entry / exit SUCCESS
    if (feature.vrDisplay) {
      window.addEventListener('vrdisplaypresentchange', () => {
        if (feature.vrDisplay.isPresenting) { // ******* MAKE SURE THIS LOGIC IS NOT ACCIDENTALLY REVERSED!!!!!!!!!!!!!!!!!!!!!!!!!!
          analytics.vrSessionBeganAt = Date.now();
          analytics.record({
            hitType: 'event',
            eventCategory: 'VR Session',
            eventAction: 'VR Entry',
            eventLabel: 'VR entry successful',
            nonInteraction: true, //  The ATTEMPT is an interaction. Its SUCCESS is not.
          });
        } else {
          analytics.vrSessionEndedAt = Date.now();
          analytics.vrSessionDuration = null;
          if (analytics.vrSessionBeganAt !== undefined) {
            analytics.vrSessionDuration = (analytics.vrSessionEndedAt -
              analytics.vrSessionBeganAt) / 1000;
          }
          analytics.record({
            hitType: 'event',
            eventCategory: 'VR Session',
            eventAction: 'VR Exit',
            eventLabel: 'VR exit successful',
            value: analytics.vrSessionDuration, //  Unit here is seconds, accurate to milliseconds.
            nonInteraction: true, //  The ATTEMPT is an interaction. Its SUCCESS is not.
          });
        }
      }, false);
    }
    //  -------------------------------------------------- VR controller info?!?!?!
  },
};


export default analytics;
