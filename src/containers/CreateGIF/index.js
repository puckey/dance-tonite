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
import download from 'downloadjs';
import GIF from '../../../third_party/gifjs/gif';

import './style.scss';

import * as THREE from '../../../third_party/threejs/three';
import viewer from '../../viewer';
import settings from '../../settings';
import audio from '../../audio';

import Room from '../../components/Room';
import Align from '../../components/Align';
import ButtonItem from '../../components/ButtonItem';
import Spinner from '../../components/Spinner';
import Title from '../../components/Title';

const logging = false;

const activities = [
  'Counting cones…',
  'Interpreting dance…',
  'Twiddling knobs…',
  'Googling “How to make a GIF”…',
  'Gluing pixels…',
  'Becoming self-aware…',
  'Coloring inside the lines…',
  'Raising expectations…',
  'Staring directly into the orb…',
  'Creating GIF…',
];

export default class CreateGIF extends Component {
  constructor() {
    super();
    this.state = {
      progress: 'Loading performance…',
    };

    this.setEncodeProgress = this.setEncodeProgress.bind(this);
    this.setFrameProgress = this.setFrameProgress.bind(this);
    this.downloadGif = this.downloadGif.bind(this);
    this.startRender = this.startRender.bind(this);
    this.count = 0;
    this.width = 600;
    this.height = 600;

    // Because we can only set gif frame delays in hundreds of seconds,
    // 1 frame every 3/100th sec = 33 FPS:
    this.fps = 33;
    this.delay = 30;
    this.duration = settings.loopDuration * 2;
    this.startTime = settings.loopDuration * 0.5;
    this.endTime = this.startTime + this.duration;
  }

  componentDidMount() {
    this.mounted = true;
    this.asyncMount();
  }

  componentWillUnmount() {
    this.mounted = false;
    viewer.startAnimating();
    viewer.animate();
    viewer.off('render', this.tick);
  }

  setFrameProgress(frame, total) {
    const progress = frame / total;
    this.setState({
      progress: `${activities[Math.floor(progress * 10)]}`,
    });
  }

  setEncodeProgress(progress) {
    this.setState({
      progress: `Encoding GIF – ${Math.round(progress * 100)}%`,
    });
  }

  downloadGif() {
    download(this.state.gifData, 'performance.gif', 'image/gif');
  }

  async asyncMount() {
    audio.reset();
    const renderer = this.renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0x000000);
    renderer.setSize(this.width, this.height);
    renderer.sortObjects = false;

    const orthographicDistance = 3;
    const aspectRatio = this.width / this.height;
    const camera = this.camera = new THREE.OrthographicCamera(
      -orthographicDistance * aspectRatio,
      orthographicDistance * aspectRatio,
      orthographicDistance,
      -orthographicDistance,
      -100,
      1000,
    );
    camera.position.set(0.06, 0.08, 0.08);
    camera.lookAt(new THREE.Vector3());

    camera.position.y = 2;
    camera.position.z = 1.3;
    camera.zoom = 0.7;
    camera.updateProjectionMatrix();

    const scene = this.scene = viewer.createScene();
    this.setState({ scene });
    this.gif = new GIF({
      workers: window.navigator.hardwareConcurrency
        ? (Math.min(4, window.navigator.hardwareConcurrency))
        : 2,
      quality: 1,
      workerScript: '/public/third_party/gifworker/gif.worker.js',
      globalPalette: true,
      transparent: 0x00FFFF,
    });

    viewer.stopAnimating();
  }

  diffPixels(source) {
    const first = !this.sourceCtx;
    if (first) {
      this.sourceCanvas = document.createElement('canvas');
      this.sourceCanvas.width = this.width;
      this.sourceCanvas.height = this.height;
      this.sourceCtx = this.sourceCanvas.getContext('2d');
      this.sourceCtx.fillStyle = '#000000';
      this.sourceCtx.fillRect(0, 0, this.width, this.height);
    }
    this.sourceCtx.drawImage(source, 0, 0);
    const { data: sourceData } = this.sourceCtx.getImageData(0, 0, this.width, this.height);
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this.ctx = this.canvas.getContext('2d');
    }
    const currentImageData = this.ctx.getImageData(0, 0, this.width, this.height);
    const currentData = currentImageData.data;
    for (let i = 0, l = sourceData.length / 4; i < l; i++) {
      const offset = i * 4;
      const same = (
        sourceData[offset] === currentData[offset] &&
        sourceData[offset + 1] === currentData[offset + 1] &&
        sourceData[offset + 2] === currentData[offset + 2] &&
        sourceData[offset + 3] === currentData[offset + 3]
      );
      if (same) {
        currentData[i * 4] = 0;
        currentData[offset + 1] = 255;
        currentData[offset + 2] = 255;
        currentData[offset + 3] = 255;
      } else {
        currentData[offset] = sourceData[offset];
        currentData[offset + 1] = sourceData[offset + 1];
        currentData[offset + 2] = sourceData[offset + 2];
        currentData[offset + 3] = sourceData[offset + 3];
      }
    }
    this.ctx.putImageData(currentImageData, 0, 0);
    this.gif.addFrame(this.canvas, { delay: this.delay, dispose: 1, copy: true });
    this.ctx.drawImage(this.sourceCanvas, 0, 0);
  }

  startRender() {
    const then = Date.now();
    setTimeout(this.renderFrame.bind(this, () => {
      this.gif.on('progress', this.setEncodeProgress);
      this.gif.on('finished', (blob) => {
        if (!this.mounted) return;
        if (logging) console.log(`Encoding took: ${Date.now() - then}`);
        this.setState({
          progress: null,
          gifData: blob,
          gifUrl: window.URL.createObjectURL(blob),
        });
      });
      this.gif.render();
    }), 100);
  }

  renderFrame(callback) {
    if (!this.mounted) return;
    this.count++;
    this.setFrameProgress(this.count, this.duration * this.fps);
    const time = this.count * (1 / this.fps) + this.startTime;
    viewer.animate(null, time);
    this.renderer.render(viewer.renderScene, this.camera);
    this.diffPixels(this.renderer.domElement);
    if (time > this.endTime) {
      callback();
    } else {
      setTimeout(this.renderFrame.bind(this, callback), 1);
    }
  }

  render({ roomId, id }, { scene, progress, gifData, gifUrl }) {
    return (
      <div className="create-gif">
        { scene && <Room
          roomId={roomId}
          id={id}
          orbs
          fadeOrbs={false}
          hasAudio={false}
          onRoomLoaded={this.startRender}
          onRoomLoadError={this.onRoomLoadError}
        /> }
        <Title>{gifData ? 'Your GIF is ready!' : 'Hold on while we prepare your GIF…'}</Title>
        <Align type="center">
          {progress &&
            <Spinner
              text={progress}
            />
          }
          {gifUrl &&
            <img className="gif-image" src={gifUrl} />
          }
          {gifData &&
            <ButtonItem
              text="Press here to download your GIF"
              onClick={this.downloadGif}
              underline
            />
          }
        </Align>
        <Align type="bottom-right">
          <ButtonItem
            text={gifData ? 'Go back' : 'Cancel'}
            onClick={this.props.goBack}
            underline
          />
        </Align>
      </div>
    );
  }
}
