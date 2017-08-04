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
import emitter from 'mitt';

const size = Object.assign(
  emitter(),
  {
    width: window.innerWidth,
    height: window.innerHeight,
  }
);

size.aspectRatio = size.width / size.height;

window.addEventListener('resize', () => {
  //  Possible issue causing IOS to not get the correct sizes:
  //  https://github.com/dimsemenov/PhotoSwipe/issues/1315
  window.setTimeout(function () {
    const width = size.width = window.innerWidth;
    const height = size.height = window.innerHeight;
    size.aspectRatio = width / height;
    size.emit('resize', size);
  }, 500);
});

export default size;
