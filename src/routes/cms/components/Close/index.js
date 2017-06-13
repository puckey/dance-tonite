/** @jsx h */
import { h } from 'preact';
import './style.scss';

export default ({ onClick }) => (
  <a className="cms-close" onClick={onClick}>×</a>
);
