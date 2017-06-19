/** @jsx h */
import { h } from 'preact';
import './style.scss';

import router from '../../router';

import Align from '../../components/Align';
import ButtonMute from '../../components/ButtonMute';
import ButtonEnterVR from '../../components/ButtonEnterVR';
import ButtonInbox from '../../components/ButtonInbox';
import ButtonSubmissions from '../../components/ButtonSubmissions';
import ButtonClose from '../../components/ButtonClose';
import AudioControls from '../../components/AudioControls';

const navigateHome = () => router.navigate('/');

export default ({
  unreadCount,
  close,
  audio,
  vr,
  mute,
  submissions,
  inbox,
}) => (
  <div>
    <Align type="top-left" rows>
      {vr && <ButtonEnterVR />}
      {mute && <ButtonMute />}
      {submissions && <ButtonSubmissions />}
      {inbox && <ButtonInbox unreadCount={unreadCount} />}
    </Align>
    {
      close &&
      <Align type="top-right" rows>
        <ButtonClose onClick={navigateHome} />
      </Align>
    }
    {
      audio &&
      <Align type="top-right" rows>
        <AudioControls />
      </Align>
    }

  </div>
);
