/** @jsx h */
import { h } from 'preact';
import './style.scss';

export default ({ onClick }) => (
  <div className="cms-close" onClick={onClick}>×</div>
);
