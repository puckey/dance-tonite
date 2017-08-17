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
import createEmitter from 'mitt';

const emitter = createEmitter();
const prefixes = ['webkit', 'moz', 'ms', 'o'];
const property = (() => {
  if ('hidden' in document) return 'hidden';

  for (let i = 0; i < prefixes.length; i++) {
    const prop = `${prefixes[i]}Hidden`;
    if (prop in document) {
      return prop;
    }
  }

  return null;
})();

if (property) {
  const eventName = `${property.replace(/hidden/i, '')}visibilitychange`;
  document.addEventListener(eventName, () => {
    emitter.emit('change', !document[property]);
  }, false);
}

export default emitter;
