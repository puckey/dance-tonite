/** @jsx h */
import { h } from 'preact';
import ButtonItem from '../ButtonItem';

import './style.scss';

export default ({ unreadCount }) => (
  <ButtonItem
    navigate="/inbox"
    text={`Inbox${unreadCount ? ` (${unreadCount})` : ''}`}
  />
);
