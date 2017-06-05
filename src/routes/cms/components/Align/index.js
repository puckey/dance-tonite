/** @jsx h */
import { h } from 'preact';
import './style.scss';

export default ({ children, type }) => (
  <div className={`cms-aligner mod-${type}`}>
    {children}
  </div>
);
