/** @jsx h */
import { h } from 'preact';
import './style.scss';

export default function Error({ children }) {
  return <div className="cms-error">Error: {children}</div>;
}

