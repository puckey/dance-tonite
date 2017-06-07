/** @jsx h */
import { h } from 'preact';
import router from '../../../../router';
import MenuItem from '../MenuItem';
import './style.scss';

export default class InboxCounter extends MenuItem {
  constructor() {
    super();

    this.state = {
      muted: false,
    };
  }

  render({ unreadCount }) {
    return (
      <div className="cms-menu-item cms-menu-item--wide" onClick={() => router.navigate('/inbox')}>
        Inbox ({ unreadCount })
      </div>
    );
  }
}
