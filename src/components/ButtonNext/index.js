/** @jsx h */
import { h } from 'preact';

import ButtonItem from '../ButtonItem';
import icon from './icon.svg';

export default ({ onClick, disabled }) => (
  <ButtonItem
    onClick={onClick}
    icon={icon}
    disabled={disabled}
  />
);
