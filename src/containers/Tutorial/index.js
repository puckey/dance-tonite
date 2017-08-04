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
import './style.scss';

import Room from '../../components/Room';
import Overlay from '../../components/Overlay';
import TutorialTimeline from '../../components/TutorialTimeline';
import Align from '../../components/Align';

import audio from '../../audio';
import feature from '../../utils/feature';
import viewer from '../../viewer';
import { sleep } from '../../utils/async';
import router from '../../router';

import analytics from '../../utils/analytics';
import stopPropagation from '../../utils/stop-propagation';

export default class Tutorial extends Component {
  constructor() {
    super();
    this.state = {
      layers: 0,
      skipButton: true,
    };

    this.setLayers = this.setLayers.bind(this);
    this.performShowOverlay = this.performShowOverlay.bind(this);
    this.performHideOverlay = this.performHideOverlay.bind(this);
    this.performAddPerformance = this.performAddPerformance.bind(this);

    viewer.exitPresent();
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
    audio.fadeOut();
  }

  setLayers(layers) {
    this.setState({ layers });
  }

  performHideOverlay() {
    this.setState({
      skipButton: true,
      overlay: null,
    });
  }

  async performAddPerformance() {
    if (!viewer.vrEffect.isPresenting) {
      await viewer.vrEffect.requestPresent();
    }
    // Wait for the VR overlay to cover the screen:
    await sleep(500);
    this.props.goto('record');
  }

  performShowOverlay() {
    this.setState({
      skipButton: false,
      overlay: feature.has6DOF ? 'add-performance' : 'room-scale-error',
    });
  }

  render({ roomId }, { skipButton, layers, overlay }) {
    return (
      <div>
        {overlay === 'room-scale-error' &&
          <Overlay
            type={overlay}
            goto={this.props.goto}
            onClose={this.performHideOverlay}
          >
            <p>
              To add your dance, you will need a room-scale VR
              device and a WebVR-enabled browser.
            </p>
            <a
              href="https://webvr.info"
              target="_blank"
              rel="noopener noreferrer"
              onClick={stopPropagation}
            >
              <span>Learn more</span>
            </a> or <a onClick={() => router.navigate('/')}>
              <span>go back to the experience</span>
            </a>.
          </Overlay>
        }
        {overlay === 'add-performance' &&
          <Overlay
            type={overlay}
            goto={this.props.goto}
            onClose={this.performHideOverlay}
          >
            <a
              className="add-your-performance"
              onClick={this.performAddPerformance}
            ><span>Add your performance</span></a>
          </Overlay>
        }
        <Room
          roomId={roomId}
          id="hIR_Tw"
          orbs
          tutorialLayers={layers}
          highlightLast={layers < 6}
          morph={false}
          progressive={feature.isIOs}
        >
          <TutorialTimeline
            onUpdateLayers={this.setLayers}
            onEnd={this.performShowOverlay}
            visible={!overlay}
          />
        </Room>
        { skipButton && (
          <Align type="bottom-right">
            <a
              className="skip-tutorial"
              onClick={() => {
                this.performShowOverlay();
                analytics.recordTutorialSkip();
              }}
            >Skip Tutorial</a>
          </Align>
          )
        }
      </div>
    );
  }
}
