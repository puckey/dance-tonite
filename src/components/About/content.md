# Dance Tonite is an evolving VR collaboration by LCD Soundsystem and their fans

<div class="about-video-container">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/WdL_IsD646I" frameborder="0" allowfullscreen></iframe>
</div>

_Dance Tonite_ features VR motion capture recordings of users dancing to the song titled “Tonite” by LCD Soundsystem. Built in WebVR, the performance can be experienced in three different ways. Without VR, you are in the audience. On Daydream View, you are on stage watching the experience unfold around you. In room-scale VR, you are a performer.

Each room is made from a single person’s choreography. The entire experience evolves over time with every new user contribution.  

## Technology
Dance Tonite previews one of the most exciting developments in Chrome, WebVR, letting anyone can take part in the experience. Built for the web, no apps or downloads are required.

This project is released open source. [View source code](https://github.com/puckey/you-move-me).

To learn more, watch this video or read the technical deep dive.

<div class="about-video-container">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/WdL_IsD646I" frameborder="0" allowfullscreen></iframe>
</div>

## Technologies used in Dance Tonite

<div class="column-wrapper">
  <div>
    <h3><a href="http://webvr.info">WebVR API</a></h3>
    Open standard that brings virtual reality to the Web. Allows anyone access to the same VR experience, regardless of their device, without the need for apps or downloads.
  </div>

  <div>
    <h3><a href="https://github.com/googlevr/webvr-polyfill">WebVR Polyfill</a></h3>
    Open-source JavaScript implementation of the WebVR spec. Emulates the WebVR API without requiring a special browser build, and allows users to view that same content as a “magic window” or first-person experience if no VR headset is present.
  </div>

  <div>
    <h3><a href="https://w3c.github.io/gamepad/">Gamepad API</a></h3>
    Open standard that allows the browser to communicate with external game controllers. When paired with WebVR, allows the browser to use room-scale VR controllers to directly interact with the virtual world.
  </div>

  <div>
    <h3><a href="https://github.com/stewdio/THREE.VRController">VRController</a></h3>
    Open-source Javascript library that extends Three.js and wraps the Gamepad API to handle controller discovery, tracking, and button events for all conforming VR controller models.
  </div>

  <div>
    <h3><a href="http://threejs.org">Three.js</a></h3>
    Open-source Javascript 3D library for rendering content as WebGL, SVG, and CSS3D. Through WebGL, allows developers to harness the power of a user’s graphics card for high frame rate, hardware-accelerated performance.
  </div>

  <div>
    <h3><a href="https://firebase.google.com/">Firebase</a></h3>
    Mobile and Web application development platform from Google that makes creating and maintaining highly scalable backends a snap.
  </div>

  <div>
    <h3><a href="https://cloud.google.com/storage/">Cloud Storage</a></h3>
    Geo-redundant storage solution from Google that stores data and media in the cloud.
  </div>

  <div>
    <h3><a href="https://cloud.google.com/appengine/">App Engine</a></h3>
    Fully managed cloud platform from Google that abstracts away backend infrastructure.
  </div>
</div>


## FAQs

### How does this work?
The cones and cylinders are VR motion capture recordings of actual users who’ve submitted their choreography to the project. VR headsets are represented as cones, controllers as cylinders. Each room is made by a single person dancing to a specific portion of the song. All submissions are made using the same recording tools provided by this project.

### How does the recording process work?
Users choreograph specific segments of the song in layers. Each layer includes one round of dancing. Once a round is complete, the music loops and the next round begins. Similar to a loop pedal, this builds layers of choreography that results in complex patterns made from just VR headset and controller positional data. Watch the tutorial.

### How can I add my own part?
Anyone can add to the experience using the “Add performance” link on the homepage. Room-scale VR and a [WebVR](http://webvr.info) supported browser are required.

### Why is everything so simple?
Room-scale VR are essentially powerful motion capture tools found in our homes and workspaces. Inspired by this data, we wanted to explore how little visual information is necessary to convey a wide range of motion and humanity. In keeping the aesthetic minimal, the creativity comes from the user.

### Why don’t I see my dance on the website?
Choreography on the website is curated by hand. Please be patient as we review and add submissions.

<div class="credits-intro">
  <h2>Credits</h2>

  <h3>Music by <a href="http://lcdsoundsystem.com">LCD Soundsystem</a></h3>

  <h3>Directed by <a href="http://puckey.studio">Jonathan Puckey</a>, <a href="http://studiomoniker.com">Moniker</a>, and <a href="http://workshop.chromeexperiments.com/">Google’s Data Arts Team</a></h3>

</div>
<div class="column-wrapper credits">
<div>
  <h3><a href="http://puckey.studio">Studio Puckey</a></h3>
  <a href="http://puckey.studio">
    Jonathan Puckey</a>,
  <a href="http://neufv.website">
    David van Gelder de Neufville</a>,
  <a href="http://mariusschwarz.com">
    Marius Schwarz
  </a>
</div>
<div>
  <h3><a href="http://studiomoniker.com">Studio Moniker</a></h3>
  <a href="http://studiomoniker.com">
    Roel Wouters
  </a>
  </div>
  <div>

  <h3><a href="https://github.com/dataarts">Data Arts Team</a></h3>
  <a href="http://custom-logic.com">
    Jeff Nusz</a>,
  <a href="http://sabahme.com">
    Sabah Kosoy</a>,
  Alisha Jaeger,
  <a href="http://gianlucamartini.me/">
    Gianluca Martini</a>,
  <a href="http://minmax.design/">
    Michael Chang</a>,
  <a href="http://stewartsmith.io/">
    Stewart Smith
  </a>
  </div>
  <div>

  <h3><a href="http://gpixer.com">Grainey Pictures</a></h3>
  <a href="http://gpixer.com">
    Colin Gray, Megan Raney Aarons, Sherry Daniel, Nathan McGuire, Will Henderson-Nold, Nicholas Lee, Nicole Ryan
  </a>
  </div>
</div>
<div class="credits mod-thanks">
  <p>Special thanks to the following folks at Google<br/>
  <a href="http://haasmade.com/">
    Christian Haas</a>,
  <a href="http://takashikawashima.com/">
    Takashi Kawashima</a>,
  <a href="http://grow.io">
    Jeremy Weinstein</a>
  </p>
  <h3>Typeface<br/><a href="https://bold-decisions.biz/typefaces/lars">Lars by Bold Decisions</a></h3>
</div>
