/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import feature from './feature';
import capitalize from './capitalize';

//  Google Analytics injection.

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
window.ga('create', 'UA-101720844-1', 'auto');
window.ga('send', 'pageview');


//  Custom Analytics
//  https://github.com/puckey/you-move-me/issues/315
//  requestIdleCallback:
//  https://developers.google.com/web/updates/2015/08/using-requestidlecallback

const verbosity = 0;


const analytics = {
  //  Super general event recording. Most stuff gets funneled through this.
  record: (obj) => {
    if (verbosity >= 0.5) console.log('Note:', obj);
    if (window.ga !== undefined && typeof window.ga === 'function') {
      const callback = () => {
        window.ga('send', obj);
        if (verbosity >= 0.5) console.log('Noted.');
      };
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(callback);
      } else {
        callback();
      }
    }
  },
  //  This is basically a “bounce” event recording.
  recordOutboundLink: (a) => {
    const url = a.getAttribute('href');
    if (verbosity >= 0.5) console.log('Note:', url);
    if (window.ga !== undefined && typeof window.ga === 'function') {
      const callback = () => {
        window.ga('send', 'event', 'outbound', 'click', url, {
          transport: 'beacon',
          hitCallback: function () {},
          //hitCallback: function(){ document.location = url }
        });
      };
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(callback);
      } else {
        callback();
      }
    }
    return true;
  },
  //  -------------------------------------------------- Section Session
  // -------------- *************** check with GA that this records session time automagically!!!!!
  // right now this must be called manually
  //  but can we make a location.href event listener instead? would that make sense??????
  recordSectionChange: (label) => {
    const labelProper = capitalize(label);
    if (verbosity >= 0.5) console.log('Note:', labelProper);
    if (window.ga !== undefined && typeof window.ga === 'function') {
      const callback = () => {
        window.ga('set', {
          page: document.location.href,
          title: labelProper,
        });
        window.ga('send', 'pageview');
      };
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(callback);
      } else {
        callback();
      }
    }
  },
  //  -------------------------------------------------- Countables
  countables: {},
  recordCountable: (label) => {
    if (typeof analytics.countables[label] !== 'number') analytics.countables[label] = 0;
    analytics.countables[label]++;
    analytics.record({
      hitType: 'event',
      eventCategory: 'Countables',
      eventAction: label,
      eventValue: analytics.countables[label],
      nonInteraction: true, // Don’t count this as separate “page.”
    });
  },
  //  -------------------------------------------------- Timeables
  timeables: {},
  recordTimeableStart: (label) => {
    analytics.timeables[label] = Date.now();
  },
  recordTimeableStop: (label) => {
    if (typeof analytics.timeables[label] === 'number') {
      const duration = Math.round((Date.now() - analytics.timeables[label]) / 1000);
      analytics.record({
        hitType: 'event',
        eventCategory: 'Timeables',
        eventAction: label,
        eventValue: duration, //  Unit here is seconds (rounded).
        nonInteraction: true, //  Don’t count this as separate “page.”
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
  //  -------------------------------------------------- Playback Session: Orb select
  recordOrbSelectStart: () => {
    analytics.orbSelectBeganAt = Date.now();
  },
  recordOrbSelectStop: () => {
    let duration = 0;
    if (typeof analytics.orbSelectBeganAt === 'number') {
      duration = Math.round((Date.now() - analytics.orbSelectBeganAt) / 1000);
    }
    analytics.record({
      hitType: 'event',
      eventCategory: 'Playback Session',
      eventAction: 'Milestones',
      eventLabel: 'Orb select',
      eventValue: duration, //  Unit here is seconds (rounded).
      nonInteraction: true, // Don’t count this as separate “page.”
    });
  },
  //  -------------------------------------------------- Playback Session: Head select
  recordHeadSelectStart: () => {
    analytics.headSelectBeganAt = Date.now();
  },
  recordHeadSelectStop: () => {
    let duration = 0;
    if (typeof analytics.headSelectBeganAt === 'number') {
      duration = Math.round((Date.now() - analytics.headSelectBeganAt) / 1000);
    }
    analytics.record({
      hitType: 'event',
      eventCategory: 'Playback Session',
      eventAction: 'Milestones',
      eventLabel: 'Head select',
      eventValue: duration, //  Unit here is seconds (rounded).
      nonInteraction: true, // Don’t count this as separate “page.”
    });
  },
  //  -------------------------------------------------- VR Session: Made it to credits
  // creditViews: 0,
  // recordCreditsView: () => {
  //   analytics.creditViews++;
  //   analytics.record({
  //     hitType: 'event',
  //     eventCategory: 'VR Session',
  //     eventAction: 'Milestones',
  //     eventLabel: 'Credits',
  //     eventValue: analytics.creditViews,
  //     nonInteraction: true, // Don’t count this as separate “page.”
  //   });
  // },


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
    // if (feature.vrDisplays && feature.vrDisplays.length > 0) {
    if (feature.vrDisplays) {
      analytics.record({
        hitType: 'event',
        eventCategory: 'Capabilities',
        eventAction: 'VR Displays Detect',
        eventLabel: 'VR Displays are present',
        eventValue: feature.vrDisplays, // .length,
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
        if (feature.vrDisplay.isPresenting) {
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
            analytics.vrSessionDuration = Math.round(
              (analytics.vrSessionEndedAt - analytics.vrSessionBeganAt) / 1000
            );
          }
          analytics.record({
            hitType: 'event',
            eventCategory: 'VR Session',
            eventAction: 'VR Exit',
            eventLabel: 'VR exit successful',
            eventValue: analytics.vrSessionDuration, //  Unit here is seconds (rounded).
            nonInteraction: true, //  The ATTEMPT is an interaction. Its SUCCESS is not.
          });
        }
      }, false);
    }
    //  -------------------------------------------------- VR controller info?!?!?!
  },
  //  -------------------------------------------------- Dance Session: Tutorial
  //  Do these still make sense??
  // - No. of users who close the tutorial
  // - No. of users who add performance (after tutorial)
  // - No. of users who see error (after tutorial) [Need some more info on this.]
  tutorialSkips: 0,
  recordTutorialSkip: () => {
    analytics.tutorialSkips++;
    analytics.record({
      hitType: 'event',
      eventCategory: 'Dance Session',
      eventAction: 'Tutorial',
      eventLabel: 'Skip',
      eventValue: analytics.tutorialSkips,
      nonInteraction: true,
    });
  },
  //  -------------------------------------------------- Dance Session: Recording
  danceSessionsRecorded: 0,
  recordDanceSessionStart: () => {
    analytics.danceTimeStart = Date.now();
  },
  //  Call this when user enters Review mode.
  //  ie. prior to submission.
  recordDanceSessionStop: (rounds) => {
    //  How many sessions?
    analytics.danceSessionsRecorded++;
    analytics.record({
      hitType: 'event',
      eventCategory: 'Dance Session',
      eventAction: 'Recording',
      eventLabel: 'Completed',
      eventValue: analytics.danceSessionsRecorded,
      nonInteraction: true,
    });
    //  How long was this session?
    if (typeof analytics.danceTimeStart === 'number') {
      const duration = Math.round((Date.now() - analytics.danceTimeStart) / 1000);
      analytics.record({
        hitType: 'event',
        eventCategory: 'Dance Session',
        eventAction: 'Recording',
        eventLabel: 'Duration',
        eventValue: duration, //  Unit here is seconds (rounded).
        nonInteraction: true,
      });
    }
    //  How many rounds in this session?
    if (typeof rounds === 'number') {
      analytics.record({
        hitType: 'event',
        eventCategory: 'Dance Session',
        eventAction: 'Recording',
        eventLabel: 'Rounds',
        eventValue: rounds,
        nonInteraction: true,
      });
    }
  },
  recordDanceSessionSubmit: () => {
    analytics.record({
      hitType: 'event',
      eventCategory: 'Dance',
      eventAction: 'Recording',
      eventLabel: 'Submit',
      nonInteraction: true,
    });
  },
  //  -------------------------------------------------- Social shares
  //  Examples:
  //  analytics.recordSocialShare('Google+');
  //  analytics.recordSocialShare('Facebook');
  //  analytics.recordSocialShare('Twitter');
  recordSocialShare: (label) => {
    analytics.record({
      hitType: 'event',
      eventCategory: 'Social',
      eventAction: 'Share Attempt', //  Remember: Just because they clicked to share doesn’t mean they finished.
      eventLabel: label,
      nonInteraction: true,
    });
  },
};


export default analytics;
