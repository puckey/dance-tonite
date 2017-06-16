/** @jsx h */
import { h } from 'preact';
import router from '../../router';
import ButtonItem from '../ButtonItem';

import './style.scss';

const navigateToInbox = () => router.navigate('/inbox');

export default ({ unreadCount }) => (
  <ButtonItem onClick={navigateToInbox}>
    Inbox { unreadCount && `(${unreadCount})` }
  </ButtonItem>
);
