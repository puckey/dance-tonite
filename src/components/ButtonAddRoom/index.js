/** @jsx h */
import { h } from 'preact';
import './style.scss';
import icon from './icon.svg';

import ButtonItem from '../ButtonItem';
import settings from '../../settings';

const randomRoom = Math.ceil(Math.random() * settings.roomCount);

export default (props) => (
  <ButtonItem
    {...props}
    icon={icon}
    label="Add your dance"
    navigate={`/record/${randomRoom}/head=yes/`}
  />
);
