/** @jsx h */
import { h, Component } from 'preact';

import Menu from '../../components/Menu';
import Controllers from '../../components/Controllers';
import POV from '../../components/POV';
import Playlist from '../../containers/Playlist';

import audio from '../../audio';
import viewer from '../../viewer';
import recording from '../../recording';
import transition from '../../transition';
import { sleep } from '../../utils/async';
import storage from '../../storage';

export default class Review extends Component {
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

    await transition.fadeOut();
    if (!this.mounted) return;

    audio.play();
  }

  async performSubmit() {
    const persisting = storage.persist(recording.serialize(), recording.roomIndex);
    audio.fadeOut();

    await transition.fadeOut();
    if (!this.mounted) return;

    viewer.events.off('tick', this.tick);
    const [recordingSrc] = await Promise.all([
      persisting,
      transition.enter({
        text: 'Please take off your headset',
      }),
      sleep(5000),
    ]);

    if (!this.mounted) return;

    this.props.goto(`/${recording.roomIndex}/${recordingSrc.replace('.json', '')}`);
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

  render() {
    return (
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
