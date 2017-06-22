/** @jsx h */
import { h } from 'preact';
import router from '../../router';
import ButtonItem from '../ButtonItem';

import './style.scss';

const navigateToPublish = () => router.navigate('/publish');

export default () => (
  <ButtonItem onClick={navigateToPublish} text>Publish Playlist</ButtonItem>
);
