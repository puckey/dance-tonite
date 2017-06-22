/** @jsx h */
import { h } from 'preact';
import classNames from 'classnames';

import './style.scss';
import ButtonItem from '../ButtonItem';
import icon from './icon.svg';

export default ({ onClick, className, dark }) => (
  <ButtonItem
    onClick={onClick}
    className={classNames(className, 'close', dark && 'mod-dark')}
    icon={icon}
  />
);
