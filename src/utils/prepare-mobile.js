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
import nosleep from './nosleep';

export default () => {
  document.body.classList.add('mod-mobile');

  // create the no-sleep video element
  nosleep.create();

  if (!feature.isIOs) return;

  // Disable pinch to zoom and double tap on iOs devices, since they no longer
  // listen to the 'user-scalable=no' viewport meta tag:
  let lastTouchEvent = 0;

  document.addEventListener('touchmove', (event) => {
    // Disable scaling
    if (event.scale !== 1) event.preventDefault();
  }, false);

  document.addEventListener('gesturestart', (event) => {
    // Disable gestures
    event.preventDefault();
  }, false);

  document.addEventListener('touchstart', (event) => {
    // Disable double tap (prev touch less than 300ms prior) and disable using multiple fingers
    if (event.timeStamp - lastTouchEvent <= 300 || event.touches.length > 1) {
      event.preventDefault();
    }

    // Record time of last touch
    lastTouchEvent = event.timeStamp;
  }, false);
};
