/** @jsx h */
import { h } from 'preact';
import './style.scss';
import ButtonItem from '../ButtonItem';

export default ({ onClick }) => (
  <ButtonItem onClick={onClick}>×</ButtonItem>
);
