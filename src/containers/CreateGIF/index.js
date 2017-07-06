/** @jsx h */
import { h, Component } from 'preact';
import GIF from '../../lib/gif';
import download from 'downloadjs';

// import LineTitle from '../../components/LineTitle';
// 
import './style.scss';

import Room from '../../components/Room';
import Align from '../../components/Align';
import ButtonItem from '../../components/ButtonItem';
import audio from '../../audio';
import viewer from '../../viewer';

const width = 768;
const height = 768;
const duration = 16; //  Unit is Seconds.
const fps = 20;
const workers = 8;

export default class CreateGIF extends Component {
  constructor() {
    super();
    this.state = {
      loading: 'Loading performance…',
    };

    this.gotoSubmission = this.gotoSubmission.bind(this);
    this.setProgress = this.setProgress.bind(this)
    this.tick = this.tick.bind(this);
    this.count = 0;
  }

  componentDidMount() {
    this.mounted = true;
    this.asyncMount();
    viewer.on('render', this.tick);
  }

  componentWillUnmount() {
    this.mounted = false;
    audio.fadeOut();
    viewer.off('render', this.tick);
  }

  setProgress(progress) {
    this.setState({
      progress: `${Math.round(progress * 100)}%`,
    });
  }

  gotoSubmission() {
    this.props.goto('submission');
  }

  async asyncMount() {
    const { roomId, id } = this.props;
    const renderer = this.renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0x000000);
    renderer.setPixelRatio(1); // window.devicePixelRatio
    renderer.setSize(width, height);
    renderer.sortObjects = false;

    const orthographicDistance = 3;
    const aspectRatio = width / height;
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
    renderer.domElement.style.zIndex = 2000;
    document.body.appendChild(renderer.domElement);

    const scene = this.scene = viewer.createScene();
    this.setState({ scene });

    const filename = `${
      width.toString().padStart(4, '0')
    }x${
      height.toString().padStart(4, '0')
    }-${
      duration.toString().padStart(2, '0')
    }sec@${fps}fps-`;
    this.gif = new GIF({
      workers: Math.ceil((window.navigator.hardwareConcurrency || 2) / 2),
      quality: 1,
      workerScript: '/public/gif.worker.js',
      globalPalette: true,
    });
    let then;
    this.gif.on('progress', this.setProgress);
    this.gif.on('finished', function(blob) {
      console.log(Date.now() - then);
      window.open(URL.createObjectURL(blob));
    });

    audio.on('play', () => {
      then = Date.now();
      this.capturer.start();
      this.capturing = true;
    });
    this.capturing = true;
    audio.on('loop', (index) => {
      if (index !== 2) return;
      this.capturing = false;
      then = Date.now();
      this.gif.render();
    });
  }

  tick() {
    this.count++;
    if (this.capturing && this.count % 3 === 0 && audio.time > 4) {
      this.renderer.render(viewer.renderScene, this.camera);
      this.gif.addFrame(this.renderer.domElement, { delay: 16, dispose: true, copy: true });
    }
  }

  render({ roomId, id }, { scene }) {
    return (
      <div className="create-gif">
        { scene && <Room
          roomId={roomId}
          id={id}
          orbs
          onRoomLoadError={this.onRoomLoadError}
        />
      }
      <Align type="top-right">
        <div>{this.state.progress}</div>
      </Align>
        <Align type="bottom-right">
          <ButtonItem
            text="Cancel"
            onClick={this.gotoSubmission}
            underline
          />
        </Align>
      </div>
    );
  }
}
