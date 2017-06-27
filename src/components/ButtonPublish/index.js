/** @jsx h */
import { h } from 'preact';
import ButtonItem from '../ButtonItem';

import './style.scss';

export default () => (
  <ButtonItem navigate="/publish" text="Publish Playlist" className="cms-button-item--wide" />
);
