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
/** @jsx h */
import { Component } from 'preact';

import viewer from '../../viewer';
import cull from '../../cull';

export default class AudioTimeline extends Component {
  constructor() {
    super();
    this.tick = this.tick.bind(this);
  }

  componentWillMount() {
    this.mounted = true;
    viewer.on('tick', this.tick);
    cull.reset();
  }

  componentWillUnmount() {
    this.mounted = false;
    viewer.off('tick', this.tick);
  }

  tick() {
    if (!viewer.insideTransition) cull.tick();
  }
}
