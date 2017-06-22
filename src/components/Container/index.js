/** @jsx h */
import { h } from 'preact';
import './style.scss';

export default function Container({ children }) {
  return <div className="app-container">{children}</div>;
}
