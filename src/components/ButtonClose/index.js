/** @jsx h */
import { h } from 'preact';
import './style.scss';
import ButtonItem from '../ButtonItem';
import icon from './icon.svg';

export default ({ onClick, className }) => (
  <ButtonItem
    onClick={onClick}
    className={`${className} close`}
    icon={icon}
  />
);
