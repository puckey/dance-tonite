/** @jsx h */
import { h, Component } from 'preact';

import Controllers from '../../components/Controllers';
import Playlist from '../../containers/Playlist';

import audio from '../../audio';
import viewer from '../../viewer';
import recording from '../../recording';
import transition from '../../transition';
import { sleep } from '../../utils/async';
import storage from '../../storage';

export default class Review extends Component {
  constructor() {
    super();

    this.state = {
      showPlaylist: true,
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

  setLoading(loading) {
    this.setState({ loading });
  }

  async asyncMount() {
    await Promise.all(
      [
        audio.load({
          src: `/public/sound/room-${this.props.roomId}.ogg`,
          loops: 2,
        }),
        sleep(5000),
      ]
    );
    if (!this.mounted) return;

    await transition.exit();
    if (!this.mounted) return;

    audio.play();
  }

  async performSubmit() {
    const persisting = storage.persist(
      recording.serialize(),
      recording.roomIndex
    );
    audio.fadeOut();

    await transition.fadeOut();
    this.setState({
      showPlaylist: false,
    });
    if (!this.mounted) return;

    viewer.events.off('tick', this.tick);
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

    viewer.events.off('tick', this.tick);

    await transition.enter({
      text: 'Okay, here we go again',
      duration: 5000,
    });
    if (!this.mounted) return;

    this.props.goto('record');
  }

  render(props, { showPlaylist }) {
    return showPlaylist && (
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
    );
  }
}
