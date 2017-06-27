/** @jsx h */
import { h } from 'preact';
import './style.scss';
import icon from './icon.svg';

import ButtonItem from '../ButtonItem';

export default (props) => <ButtonItem {...props} icon={icon} />;
