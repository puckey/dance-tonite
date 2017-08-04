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
import { h, Component } from 'preact';

import viewer from '../../viewer';
import windowSize from '../../utils/windowSize';
import audio from '../../audio';
import settings from '../../settings';
import feature from '../../utils/feature';

import './style.scss';

const getRatio = event => event.clientX / windowSize.width;

const updateRate = 200;

export default class ProgressBar extends Component {
  constructor() {
    super();
    // set initial time:
    this.state = { };
    this.targetRatio = 0;
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.tick = this.tick.bind(this);
    this.lastUpdate = Date.now();
  }

  componentDidMount() {
    viewer.on('tick', this.tick);
  }

  shouldComponentUpdate() {
    return false;
  }

  componentWillUnmount() {
    viewer.off('tick', this.tick);
  }

  onMouseMove(event) {
    this.moveRatio = getRatio(event);
    event.stopPropagation();
  }

  onMouseLeave() {
    this.moveRatio = null;
  }

  onClick(event) {
    audio.gotoTime(audio.duration * getRatio(event));
    event.stopPropagation();
  }

  onMouseDown(event) {
    event.stopPropagation();
  }

  tick() {
    if (audio.progress === undefined) return;

    // don't update progress bar if we're in VR but don't have external display
    if (!viewer.vrEffect.isPresenting || feature.hasExternalDisplay) {
      let newRatio;
      // if they're mousing over the progress bar
      if (this.moveRatio) {
        newRatio = this.targetRatio = this.targetRatio * 0.8 + this.moveRatio * 0.2;
      }
      // else if it's time to update the progress bar
      //  css transform causes re-layout which is expensive
      else if (Date.now() - this.lastUpdate > updateRate) {
        newRatio = (audio.progress / settings.totalLoopCount);
      }

      if (newRatio) {
        this.progressEl.style.transform = `scaleX(${newRatio})`;
        this.lastUpdate = Date.now();
      }
    }
  }

  render() {
    const { isMobile } = feature;
    return (
      <div
        className="audio-progress-bar-container"
        onClick={this.onClick}
        onMouseDown={!isMobile && this.onMouseDown}
        onMouseLeave={!isMobile && this.onMouseLeave}
        onMouseMove={!isMobile && this.onMouseMove}
      >
        <div
          className="audio-progress-bar"
          ref={(el) => { this.progressEl = el; }}
        />
      </div>
    );
  }
}

