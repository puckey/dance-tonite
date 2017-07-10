/** @jsx h */
import { h } from 'preact';

import Room from '../Room';
import POV from '../POV';

export default function POVRoom({ presenting, id, roomId, children, onRoomLoadError }) {
  return (
    <Room
      id={id}
      roomId={roomId}
      key={id}
      orbs={!presenting}
      onRoomLoadError={onRoomLoadError}
    >
      {children}
      {presenting && <POV offset={1} /> }
    </Room>
  );
}
