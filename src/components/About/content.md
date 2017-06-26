# Dance Tonite is an evolving VR collaboration by LCD Soundsystem and their fans

<div class="about-video-container">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/WdL_IsD646I" frameborder="0" allowfullscreen></iframe>
</div>

_Dance Tonite_ features VR motion capture recordings of users dancing to the song titled “Tonite” by LCD Soundsystem. Built in WebVR, the performance can be experienced in three different ways. Without VR, you are in the audience. On Daydream View, you are on stage watching the experience unfold around you. In room-scale VR, you are a performer.

Each room is made from a single person’s choreography. The entire experience evolves over time with every new user contribution.  

## Technology
_Dance Tonite_ previews one of the most exciting developments in Chrome, WebVR, letting anyone can take part in the experience. Built for the web, no apps or downloads are required.

This project is released open source. View source code.

To learn more, watch this video or read the technical deep dive.

<div class="about-video-container">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/WdL_IsD646I" frameborder="0" allowfullscreen></iframe>
</div>

Technologies used in this project

### WebVR
An open web standard that brings VR to the web. It lets anyone access the same VR experience regardless of their device without the need for apps or downloads.


### WebVR Polyfill
An open-source JavaScript implementation of the WebVR spec. This project lets you use WebVR without requiring a special browser build, and view that same content without a VR headset.

### Gamepad API
An open API that lets the browser detect external controllers that are plugged into the computer. Tied into WebVR, it allows the browser to detect room-scale VR controllers.


### ControllerView
An open-source Javascript library built upon the Gamepad API and WebVR API that standardizes outgoing event data from various VR controllers.
Three.js
A Javascript library built upon WebGL that lets you create 3D graphics using the computer’s graphics card.


### Firebase
A mobile and web application development platform made by Google that lets you build scalable content such as databases
Cloud Storage
A geo-redundant storage solution made by Google that stores data and media in the cloud.


### App Engine
A fully managed platform that abstracts away infrastructure made by Google.



## FAQs

### How does this work?
The cones and cylinders are VR motion capture recordings of actual users who’ve submitted their choreography to the project. VR headsets are represented as cones, controllers as cylinders. Each room is made by a single person dancing to a specific portion of the song. All submissions are made using the same recording tools provided by this project.

### How does the recording process work?
Users choreograph specific segments of the song in layers. Each layer includes one round of dancing. Once a round is complete, the music loops and the next round begins. Similar to a loop pedal, this builds layers of choreography that results in complex patterns made from just VR headset and controller positional data. Watch the tutorial.

### How can I add my own part?
Anyone can add to the experience using the “Add performance” link on the homepage. Room-scale VR and a WebVR supported browser are required.

### Why is everything so simple?
Room-scale VR are essentially powerful motion capture tools found in our homes and workspaces. Inspired by this data, we wanted to explore how little visual information is necessary to convey a wide range of motion and humanity. In keeping the aesthetic minimal, the creativity comes from the user.

### Why don’t I see my dance on the website?
Choreography on the website is curated by hand. Please be patient as we review and add submissions.


## Credits
### Music by LCD Soundsystem

### Created by [Studio Puckey](http://puckey.studio), [Moniker](http://studiomoniker.com), and [Google’s Data Arts Team](http://workshop.chromeexperiments.com/)

### Studio Puckey
Jonathan Puckey, David van Gelder de Neufville, Marius Schwarz

### Studio Moniker
Roel Wouters

### Data Arts Team
Jeff Nusz, Sabah Kosoy, Alisha Jaeger, Gianluca Martini, Michael Chang, Stewart Smith

### Grainey Pictures
Colin Gray, Megan Raney Aarons, Sherry Daniel, Nathan McGuire, Will Henderson-Nold, Nicholas Lee, Nicole Ryan

### Special thanks to the following folks at Google
Christian Haas, Takashi Kawashima, Jeremy Weinstein
