/** @jsx h */
import { h } from 'preact';
import './style.scss';
import icon from './icon.svg';

import ButtonItem from '../ButtonItem';
import settings from '../../settings';

// Recording url for random room, ignoring first and last room:
const randomRoom = () => {
  const room = Math.floor(Math.random() * (settings.roomCount - 3)) + 2;
  return room;
};

// Random room, ignoring first and last rooms:
export default (props) => (
  <ButtonItem
    {...props}
    icon={icon}
    label="Add your dance"
    navigate={`/record/${randomRoom()}/head=yes/`}
  />
);
