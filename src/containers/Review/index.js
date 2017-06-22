/** @jsx h */
import { h, Component } from 'preact';

import Controllers from '../../components/Controllers';
import Playlist from '../../containers/Playlist';

import audio from '../../audio';
import recording from '../../recording';
import transition from '../../transition';
import { sleep } from '../../utils/async';
import storage from '../../storage';

export default class Review extends Component {
  constructor() {
    super();

    this.state = {
      visible: false,
    };
    this.performSubmit = this.performSubmit.bind(this);
    this.performRedo = this.performRedo.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
    this.asyncMount();
  }

  componentWillUnmount() {
    this.mounted = false;
    audio.fadeOut();
  }

  async asyncMount() {
    await Promise.all([
      transition.enter({
        text: 'Time to review your performance',
      }),
      audio.load({
        src: `/public/sound/room-${this.props.roomId}.ogg`,
        loops: 2,
      }),
      sleep(5000),
    ]);
    if (!this.mounted) return;

    await transition.fadeOut();
    if (!this.mounted) return;

    this.setState({
      visible: true,
    });
    audio.fadeIn();
    audio.play();
    transition.exit();
  }

  async performSubmit() {
    const persisting = storage.persist(
      recording.serialize(),
      recording.roomIndex
    );
    audio.fadeOut();

    await transition.fadeOut();
    this.setState({
      visible: false,
    });
    if (!this.mounted) return;

    const [recordingSrc] = await Promise.all([
      persisting,
      transition.enter({
        text: 'Submitting your recording. Please wait.',
      }),
      sleep(5000),
    ]);
    if (!this.mounted) return;

    const id = recordingSrc.replace('.json', '');
    this.props.goto(`/${recording.roomIndex}/${id}`);
  }

  async performRedo() {
    audio.fadeOut();
    await transition.fadeOut();
    if (!this.mounted) return;

    this.setState({
      visible: false,
    });

    await transition.enter({
      text: 'Okay, here we go again',
      duration: 3000,
    });
    if (!this.mounted) return;

    this.props.goto('record');
  }

  render(props, { visible }) {
    return visible ? (
      <div>
        <Controllers
          settings={{
            left: {
              text: 'press\nto\nredo',
              onPress: this.performRedo,
              removeOnPress: true,
            },
            right: {
              text: 'press\nto\nsubmit',
              onPress: this.performSubmit,
              removeOnPress: true,
            },
          }}
        />
        <Playlist
          review
          totalProgress
          fixedControllers
          recording={recording}
        />
      </div>
    )
    : null;
  }
}
