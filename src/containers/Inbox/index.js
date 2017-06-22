/** @jsx h */
import { h, Component } from 'preact';
import { debounce } from 'throttle-debounce';

import './style.scss';

import Container from '../../components/Container';

import CMSMenu from '../../components/CMSMenu';
import Room from '../../components/Room';
import Align from '../../components/Align';
import Spinner from '../../components/Spinner';
import Error from '../../components/Error';

import cms from '../../utils/firebase/cms';
import router from '../../router';

export default class Inbox extends Component {
  constructor() {
    super();
    this.state = {
      starred: false,
    };

    this.titleInputChanged = this.titleInputChanged.bind(this);
    this.toggleStarred = this.toggleStarred.bind(this);
    this.toggleMegaGridWorthy = this.toggleMegaGridWorthy.bind(this);
    this.toggleUniversal = this.toggleUniversal.bind(this);
    this.submit = this.submit.bind(this);
    this.updateTitle = debounce(300, this.updateTitle);
  }

  componentDidMount() {
    this.mounted = true;
    this.asyncMount();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  navigateToNextUnmoderated() {
    let { unmoderated } = this.state;
    const { recording } = this.state;
    if (recording) {
      unmoderated = unmoderated.filter(item => item.id !== recording.id);
    }
    router.navigate(
      unmoderated.length > 0
        ? `/inbox/${unmoderated[1].id}`
        : '/inbox/'
    );
  }

  async asyncMount() {
    let { data: unmoderated, error } = await cms.getUnmoderatedRecordings();
    if (!this.mounted) return;

    if (error) {
      this.setState({ error });
      return;
    }

    // Filter out faulty room with -1:
    unmoderated = unmoderated
      .filter(recording => recording.room >= 0);
    const { recordingId } = this.props;
    if (!recordingId && unmoderated.length) {
      const recording = unmoderated[0];
      router.navigate(`/inbox/${recording.id}`);
    } else {
      if (recordingId) {
        this.asyncLoadRecording(recordingId);
      }
      this.setState({
        unmoderatedCount: unmoderated.length,
        unmoderated,
      });
    }
  }

  async asyncLoadRecording(id) {
    this.setState({
      loadingRecording: true,
    });
    const { data: recording, error } = await cms.getRecording(id);
    if (!this.mounted) return;
    if (error) {
      this.setState({
        error,
        loadingRecording: false,
      });
      return;
    }
    if (recording.rating === 0) {
      // Unstarred by default:
      recording.rating = -1;
    }
    this.setState({
      loadingRecording: false,
      recording,
    });
  }

  titleInputChanged(event) {
    this.updateTitle(event.target.value);
  }

  toggleMegaGridWorthy() {
    const { recording } = this.state;
    recording.is_megagrid_worthy = !recording.is_megagrid_worthy;
    this.setState({
      recording,
    });
  }

  toggleUniversal() {
    const { recording } = this.state;
    recording.is_universal = !recording.is_universal;
    this.setState({
      recording,
    });
  }

  updateTitle(title) {
    const { recording } = this.state;
    recording.title = title;
    recording.rating = (title && title.length) ? 1 : -1;
    this.setState({
      recording,
    });
  }

  toggleStarred() {
    const { recording } = this.state;
    recording.rating = recording.rating === 1 ? -1 : 1;
    this.setState({
      recording,
    });
  }

  async submit() {
    this.setState({
      submitting: true,
    });
    const { error } = await cms.updateRecording(this.state.recording);
    if (!this.mounted) return;
    this.setState({
      submitting: false,
    });
    if (error) {
      this.setState({ error });
    } else {
      this.navigateToNextUnmoderated();
    }
  }

  render(
    { recordingId },
    { unmoderatedCount, recording, submitting, error }
  ) {
    const starred = !!recording && (recording.rating === 1);
    return (
      <Container>
        <CMSMenu
          unreadCount={unmoderatedCount}
          vr
          mute
          submissions
          inbox
          close
        />
        {
          recording && (
            <Align type="bottom-right" margin>
              <input
                placeHolder="Performance title"
                type="text"
                className="inbox-title-input"
                id="performanceTitle"
                onInput={this.titleInputChanged}
                value={recording.title}
              />
              <div>Mega Grid Worthy
                <input
                  type="checkbox"
                  checked={recording.is_megagrid_worthy}
                  onChange={this.toggleMegaGridWorthy}
                />
              </div>
              <div>Universal
                <input
                  type="checkbox"
                  checked={recording.is_universal}
                  onChange={this.toggleUniversal}
                />
              </div>
              <div
                className="inbox-submit"
                onClick={this.submit}
              >{starred ? 'Save' : 'Ignore'} and next &rarr;</div>
            </Align>
          )
        }
        {
          (!recording || submitting || error)
            ? (
              <Align type="center">
                { error
                  ? <Error>{error}</Error>
                  : unmoderatedCount === 0
                    ? <div>Inbox empty ✌️</div>
                    : <Spinner
                      text={
                        submitting
                          ? 'Submitting changes'
                          : !recordingId
                              ? 'Loading inbox'
                              : ''
                      }
                    />
                }
              </Align>
            )
            : <Room key={recording.id} recording={recording} />
        }
      </Container>
    );
  }
}
