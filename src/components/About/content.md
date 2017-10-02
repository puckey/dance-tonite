<div class="title-wrapper">
  <h1>Dance Tonite is an ever-changing VR collaboration by LCD Soundsystem and their fans</h1>
</div>

<div class="about-video-container">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/9cG675fJlEo" frameborder="0" allowfullscreen></iframe>
</div>

Dance Tonite features the new song by LCD Soundsystem, "Tonite." In it, you go from room to room experiencing a series of dance performances created entirely by fans. Using a new technology called WebVR, the experience is accessible from a single URL and works across platforms, giving the user a different role in the experience depending on their device. 

With Daydream View or other handheld VR headsets, you are on stage watching the experience unfold around you. With room-scale VR such as the HTC VIVE or Oculus Rift (which enable your physical movements to be reflected in your virtual environment), you are a performer. And without VR, you are in the audience getting a bird’s eye view perspective. 

Dance Tonite was created by artists Jonathan Puckey and Moniker in collaboration with the Data Arts Team, a specialized team within Google exploring the ongoing dialog between artists and emerging technologies. 

Take a look at the <a class="gallery-link">gallery of featured user contributions</a>.

## Technology
Dance Tonite previews one of the most exciting developments in Chrome, WebVR, allowing anyone to take part in the experience. It’s built for the Web — no apps or downloads required.

To learn more about how this was made, read the [technical deep dive](https://developers.google.com/web/showcase/2017/dance-tonite) or view the open source [project code](https://github.com/puckey/dance-tonite).

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
    <h3><a href="https://preactjs.com/">Preact</a></h3>
    Fast and tiny open-source JavaScript library for building user interfaces. Preact allows developers to create large web applications that use data which can change over time, without reloading the page.
  </div>

  <div>
    <h3><a href="https://developers.google.com/web/fundamentals/getting-started/primers/service-workers">Service Workers</a></h3>
    A browser feature that brings 'native app' functionality to the web, for rich offline experiences, periodic background syncs, and push notifications.
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
A performer is given an 16 second section of music to dance to. The music starts, and the recording begins. When section of music ends, it immediately starts over again, and the performer will see their previous “self” dancing in the room with them. They can add new elements to the dance as the music loops over and over. 

Similar to a loop pedal, this builds layers of choreography that results in complex patterns made from just VR headset and controller positional data. [Watch the tutorial.](/record/4/head=yes/)

### How can I add my own part?
Anyone can add to the experience using the “Add performance” link on the homepage. Room-scale VR and a [WebVR](http://webvr.info) supported browser are required.

### Why is everything so minimalistic?
Room-scale VR systems are essentially powerful motion-capture tools found in our homes and workspaces. Inspired by the rich motion data they capture, we wanted to explore how little visual information is necessary to convey a wide range of motion and humanity. 

As a creation tool, a minimal aesthetic ensures that the creativity and variety in the piece comes from people’s unique performances rather than special effects. 

### Why don’t I see my dance on the website?
Choreography on the website is curated by hand. Please be patient as we review and add submissions.

<div class="credits-intro">
  <h2>Credits</h2>

  <h3>Music by <a href="http://lcdsoundsystem.com">LCD Soundsystem</a></h3>

  <h3>Directed by <a href="http://puckey.studio">Jonathan Puckey</a>, <a href="http://studiomoniker.com">Moniker</a>, and the <a href="http://workshop.chromeexperiments.com/">Google Data Arts Team</a></h3>

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
  <h3><a href="http://studiomoniker.com">Moniker</a></h3>
  <a href="http://studiomoniker.com">
    Roel Wouters
  </a>
  </div>
  <div class="single-column">

  <h3><a href="https://github.com/dataarts">Data Arts Team</a></h3>
    Jeff Nusz,
    Sabah Kosoy,
    Alisha Jaeger,
    Michael Chang,
    Stewart Smith,
    Gianluca Martini,
    and special guests Christian Haas, 
    Takashi Kawashima
  </div>
</div>
<div class="credits mod-thanks">
  <h3>Typeface<br/><a href="https://bold-decisions.biz/typefaces/lars">Lars by Bold Decisions</a></h3>
</div>


## Contact

[Email us](mailto:dance.tonite.contact@gmail.com) or [download the press kit](https://storage.googleapis.com/you-move-me.appspot.com/presskit/DanceTonite_PressKit.zip).
