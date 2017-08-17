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
import Tween from 'tween-ticker';
import cubicInOut from 'eases/cubic-out';
import viewer from '../viewer';

const tween = new Tween({
  eases: {
    cubicInOut,
  },
});

viewer.on('tick', tween.tick.bind(tween));

export default function createTweener() {
  let t;
  return (elements, param) => {
    if (t) {
      t.cancel();
    }
    t = tween.to(elements, param);
    if (param.onUpdate) {
      t.on('update', param.onUpdate);
    }
    t.promise = new Promise(resolve => {
      t.on('complete', resolve);
    });
    return t;
  };
}

