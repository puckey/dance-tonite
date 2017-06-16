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

const navigateHome = () => router.navigate('/');

export default ({ unreadCount, close }) => (
  <div>
    <Align type="top-left" rows>
      <ButtonEnterVR />
      <ButtonMute />
      <ButtonSubmissions />
      <ButtonInbox unreadCount={unreadCount} />
    </Align>
    {
      close &&
      <Align type="top-right" rows>
        <ButtonClose onClick={navigateHome} />
      </Align>
    }
  </div>
);
