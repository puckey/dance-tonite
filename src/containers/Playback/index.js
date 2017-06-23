/** @jsx h */
import { h, Component } from 'preact';
import './style.scss';

import Menu from '../../components/Menu';
import CMSMenu from '../../components/CMSMenu';
import Container from '../../components/Container';
import Error from '../../components/Error';
import Align from '../../components/Align';
import Spinner from '../../components/Spinner';
import Titles from '../../components/Titles';
import ProgressBar from '../../components/ProgressBar';
import Colophon from '../../components/Colophon';
import Playlist from '../Playlist';

import audio from '../../audio';
import audioSrcOgg from '../../public/sound/tonite.ogg';
import audioSrcMp3 from '../../public/sound/tonite.mp3';
import viewer from '../../viewer';
import settings from '../../settings';
import transition from '../../transition';
import feature from '../../utils/feature';
import { sleep } from '../../utils/async';

export default class Playback extends Component {
  constructor() {
    super();

    this.state = {
      hoverHead: null,
      orb: true,
      colophon: true,
    };
    this.onTitlesChanged = this.onTitlesChanged.bind(this);
    this.performExitPresent = this.performExitPresent.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
    this.asyncMount();
  }

  componentWillUnmount() {
    this.mounted = false;
    if (viewer.isPresentingVR()) {
      viewer.exitPresentVR();
    }
  }

  onTitlesChanged(titles, colophon = true) {
    this.setState({
      orb: !titles,
      colophon,
    });
  }

  setLoading(loading) {
    this.setState({ loading });
  }

  performExitPresent() {
    if (viewer.isPresentingVR()) {
      viewer.exitPresentVR();
    }
    viewer.switchCamera('default');
    this.forceUpdate();
  }

  async asyncMount() {
    const { roomIndex } = this.props;
    if (!viewer.isPresentingVR()) {
      viewer.switchCamera('orthographic');
    }

    this.setLoading('Moving dancers into position…');

    await Promise.all([
      audio.load({
        src: feature.isChrome ? audioSrcOgg : audioSrcMp3,
        loops: settings.totalLoopCount,
        loop: true,
        progressive: true,
      }),
      sleep(1500),
    ]);

    if (!this.mounted) return;

    this.setLoading(null);
    if (transition.isInside()) {
      transition.exit();
    }

    if (roomIndex) {
      // Start at 3 rooms before the recording, or 60 seconds before
      // the end of the track – whichever comes first.
      const watchTime = 30;
      const startTime = Math.min(
        (roomIndex - 2) * audio.loopDuration,
        audio.duration - watchTime
      );
      audio.gotoTime(startTime);
      if (viewer.isPresentingVR()) {
        setTimeout(() => {
          if (!this.mounted) return;
          audio.fadeOut();
          transition.enter({
            text: 'Please take off your headset',
          });
          // TODO add share screen
        }, watchTime * 1000);
      }
    }

    // Safari won't play unless we wait until next tick
    setTimeout(() => {
      audio.play();
      audio.fadeIn();
    });
  }

  render({ roomIndex, recordingId }, { error, loading, orb, colophon }) {
    const polyfillAndPresenting = feature.vrPolyfill
      && viewer.isPresentingVR();

    if (polyfillAndPresenting) {
      return (
        <Container>
          <Playlist
            pathRecording={recordingId}
            pathRoomIndex={roomIndex}
            orb={orb}
          />
          <Menu
            close={this.performExitPresent}
          />
        </Container>
      );
    }

    return (
      <Container>
        {process.env.FLAVOR !== 'cms' &&
          <Colophon
            className={
              !loading &&
              !colophon &&
              'mod-hidden'
            }
          />
        }
        <Playlist
          pathRecording={recordingId}
          pathRoomIndex={roomIndex}
          orb={orb}
        />
        { process.env.FLAVOR !== 'cms'
          ? <Titles
            viewer={viewer}
            audio={audio}
            onUpdate={this.onTitlesChanged}
          />
          : null
        }
        <ProgressBar />
        <Align type="center">
          { error
            ? <Error>{error}</Error>
            : loading
              ? <Spinner
                text={`${loading}`}
              />
              : null
          }
        </Align>
        {
          process.env.FLAVOR === 'cms'
            ? <CMSMenu
              vr
              audio
              mute
              submissions
              inbox
              publish
            />
            : (
              <Menu
                vr
                addRoom
                about
                mute
              />
            )
        }
      </Container>
    );
  }
}
