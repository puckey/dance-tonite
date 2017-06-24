import feature from './utils/feature';


//  Google Analytics injection.

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
window.ga('create', 'UA-97851584-1', 'auto');
window.ga('send', 'pageview');


const verbosity = 1;


/*

https://github.com/puckey/you-move-me/issues/315

X = Done.
L = Covered by hyperlink click tracking.
? = Quetionable if possible or worthwhile.
T = T/K.

Homepage
L  No. of users who click ?
L  No. of users who click Enter VR
L  No. of users who click Add Performance
-  No. of users coming from a shared link
  No. of clicks into heads and orb
  No. of users who reach end credits

About
?  Time spent on each section of the about page (we did this on the madeby.google website)

Enter VR
  No. of users who see Enter VR error
  Time spent watching in VR
X  No. of users watching Polyfill
X  No. of users watching WebVR

Add Performance | Tutorial
L  No. of users who skip the tutorial
L  No. of users who close the tutorial
L  No. of users who add performance (after tutorial)
?  No. of users who see error (after tutorial)

Add Performance | Record
  No. of rounds recorded per session
  Time spent recording a dance before user submits
  No. of users who submit
  No. of users who record again (can we do this?)

Add Performance | Share
L  No. of shares on FB
L  No. of shares on G+
L  No. of shares on T

VR device detection
X  No. users on mobile WebVR
X  No. users on mobile WebVR Polyfill
X  No. users on Vive
X  No. users on Oculus
X  No. users on Samsung Gear

Outbound links
L  Homepage & About - User clicks on WebVR badge
L  Homepage & About - User clicks on terms
L  Homepage & About - User clicks on privacy
L  About - User clicks source code link
L  About - User clicks on technical case study link
L  About - User clicks on any sublinks from tech section (under technology section)


*/


const analytics = {
  record: (obj) => {
    if (verbosity >= 0.5) console.log('Note:', obj);
    if (window.ga !== undefined && typeof window.ga === 'function') {
      window.ga('send', obj);
      if (verbosity >= 0.5) console.log('Noted.');
    }
  },
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
  mount: () => {
    //  ---------------------------------------- WebGL
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
    //  ---------------------------------------- WebVR
    if (feature.hasVR) {
      analytics.record({
        hitType: 'event',
        eventCategory: 'Capabilities',
        eventAction: 'VR Display Detect',
        eventLabel: 'VR Display is present',
        value: 0, // displays.length,
        nonInteraction: true,
      });
    } else {
      analytics.record({
        hitType: 'event',
        eventCategory: 'Capabilities',
        eventAction: 'VR Display Detect',
        eventLabel: 'VR Display is absent',
        nonInteraction: true,
      });
    }
    //  ---------------------------------------- VR device model
    (function () {
      const obj = {
        hitType: 'event',
        eventCategory: 'Capabilities',
        eventAction: 'VR Device Model',
        nonInteraction: true,
      };
      if (feature.isVive) {
        obj.eventLabel = 'HTC Vive';
      } else if (feature.isOculus) {
        obj.eventLabel = 'Oculus Rift';
      } else if (feature.isSamsungGearVR) {
        obj.eventLabel = 'Samsung GearVR';
      } else if (feature.isDaydream) {
        obj.eventLabel = 'Google Daydream';
      } else if (feature.isCardboard) {
        obj.eventLabel = 'Cardboard (fallback)';// isMobile + Polyfill (NOT Daydream)
      } else obj.eventLabel = 'Unknown';
      analytics.record(obj);
    }());
  },
};


export default analytics;


/*

Outbound links

  Homepage & About - User clicks on WebVR badge
  Homepage & About - User clicks on terms
  Homepage & About - User clicks on privacy
  About - User clicks source code link
  About - User clicks on technical case study link
  About - User clicks on any sublinks from tech section (under technology section)

  clickedHomepageWebVRBadge
  clickedHomepageTerms
  clickedHomepagePrivacy
  clickedAboutSourceCode
  clickedAboutTCS
  clicked ... any sublinks from tech section (under technology section)


button.onclick = function() {

		if( Moar.effect.isPresenting ){

			Moar.note({

				hitType:       'event',
				eventCategory: 'VR Session',
				eventAction:   'VR Exit',
				eventLabel:    'VR exit attempted'
			})
			three.classList.remove( 'show' )
			button.classList.remove( 'ready' )
			window.setTimeout( function(){ Moar.effect.exitPresent() }, 500 )
		}
		else {

			Moar.note({

				hitType:       'event',
				eventCategory: 'VR Session',
				eventAction:   'VR Entry',
				eventLabel:    'VR entry attempted'
			})
			three.classList.remove( 'show' )
			button.classList.add( 'engaged' )
			window.setTimeout( function(){ Moar.effect.requestPresent() }, 500 )
		}
	}
	window.addEventListener( 'vrdisplaypresentchange', function( event ){

		if( Moar.effect.isPresenting ){

			Moar.note({

				hitType:       'event',
				eventCategory: 'VR Session',
				eventAction:   'VR Entry',
				eventLabel:    'VR entry successful',
				nonInteraction: true
			})
			button.classList.add( 'ready' )
		}
		else {

			Moar.note({

				hitType:       'event',
				eventCategory: 'VR Session',
				eventAction:   'VR Exit',
				eventLabel:    'VR exit successful',
				nonInteraction: true
			})
			button.classList.remove( 'engaged' )
		}
		three.classList.add( 'show' )

	}, false )

*/
