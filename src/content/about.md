# Dance Tonite is a music video concept featuring a collaborative VR experience

<div class="video-container">
<iframe width="560" height="315" src="https://www.youtube.com/embed/WdL_IsD646I" frameborder="0" allowfullscreen></iframe>
</div>

## Technology

### Line Detection
We used a combination of OpenCV Structured Forests and ImageJ’s Ridge Detection to analyze and identify dominant visual lines in the initial dataset of 50,000+ images. This helped cull down the original dataset to just a few thousand of the most interesting images.

### Fast Data Lookup
For the draw application, we stored the resulting line data in a vantage point tree. This data structure made it fast and easy to find matches from the dataset in real time right in your phone or desktop web browser.

### WebGL
We used Pixi.js, an open source library built upon the WebGL API, to rapidly draw and redraw 2D WebGL graphics without hindering performance.

### Google Cloud Storage
All images are hosted on Google Cloud Storage so images are served quickly to users worldwide.

## Credits

## Terms and privacy
