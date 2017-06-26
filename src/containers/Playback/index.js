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
import ButtonItem from '../../components/ButtonItem';
import Overlay from '../../components/Overlay';

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
    if (viewer.vrEffect.isPresenting) {
      viewer.vrEffect.exitPresent();
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
    if (viewer.vrEffect.isPresenting) {
      viewer.vrEffect.exitPresent();
    }
    viewer.switchCamera('default');
    this.forceUpdate();
  }

  async asyncMount() {
    const { inContextOfRecording, roomId } = this.props;
    if (!viewer.vrEffect.isPresenting) {
      viewer.switchCamera('orthographic');
    }
    if (!inContextOfRecording) {
      this.setLoading('Moving dancers into position…');
    }

    const audioLoadTime = Date.now();
    await audio.load({
      src: feature.isChrome ? audioSrcOgg : audioSrcMp3,
      loops: settings.totalLoopCount,
      loop: true,
      progressive: true,
    });
    if (!this.mounted) return;

    if (inContextOfRecording) {
      // Start at 3 rooms before the recording, or 60 seconds before
      // the end of the track – whichever comes first.
      const watchTime = 30;
      const roomOffset = 2;
      const startTime = Math.min(
        (roomId - 2 + roomOffset) * audio.loopDuration,
        audio.duration - watchTime
      );
      audio.gotoTime(startTime);
      setTimeout(() => {
        if (!this.mounted) return;
        audio.fadeOut();
        transition.enter({
          text: 'Please take off your headset',
        });
        this.setState({
          takeOffHeadset: true,
        });
      }, watchTime * 1000);
    }

    const timeLeft = 1500 - (Date.now() - audioLoadTime);
    if (timeLeft > 0) {
      await sleep(timeLeft);
      if (!this.mounted) return;
    }

    this.setLoading(null);
    if (transition.isInside()) {
      transition.exit();
    }

    // Safari won't play unless we wait until next tick
    setTimeout(() => {
      audio.play();
      audio.fadeIn();
    });
  }

  render(
    {
      roomIndex,
      recordingId,
      inContextOfRecording,
      takeOffHeadset,
      onGotoSubmission,
    },
    { error, loading, orb, colophon }
  ) {
    const polyfillAndPresenting = feature.vrPolyfill
      && viewer.vrEffect.isPresenting;

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
      <div className="playback">
        {
          inContextOfRecording && (
            takeOffHeadset
              ? (
                <Overlay>
                  <ButtonItem text onClick={onGotoSubmission}>
                    I took off my headset
                  </ButtonItem>
                </Overlay>
              )
              : (
                <Align type="bottom-right">
                  <ButtonItem text onClick={onGotoSubmission}>Skip</ButtonItem>
                </Align>
              )
          )
        }
        {process.env.FLAVOR !== 'cms' &&
          <Colophon hide={!loading && !colophon} />
        }
        <Playlist
          pathRecording={recordingId}
          pathRoomIndex={roomIndex}
          orb={orb}
        />
        { process.env.FLAVOR !== 'cms'
          ? <Titles
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
      </div>
    );
  }
}
