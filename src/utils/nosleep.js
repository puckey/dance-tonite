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
import NoSleep from '../../third_party/no-sleep';

let noSleep;
const logging = false;

const nosleep = {
  create: () => {
    if (logging) console.log('nosleep created')
    noSleep = new NoSleep();
  },
  enable: () => {
    if (logging) console.log('nosleep enable')
    if (noSleep) noSleep.enable();
  },
  disable: () => {
    if (logging) console.log('nosleep disable')
    if (noSleep) noSleep.disable();
  },
};

export default nosleep;
