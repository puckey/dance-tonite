/** @jsx h */
import { h } from 'preact';

import ButtonItem from '../ButtonItem';
import icon from './icon.svg';
import iconLarge from './icon-large.svg';

import './style.scss';

export default ({ onClick, large }) => (
  <ButtonItem
    onClick={onClick}
    icon={large ? iconLarge : icon}
    className="button-play"
  />
);
