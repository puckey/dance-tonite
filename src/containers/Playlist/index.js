/** @jsx h */
import { h, Component } from 'preact';
import asyncEach from 'async/eachLimit';

import './style.scss';

import Room from '../../room';
import audio from '../../audio';
import viewer from '../../viewer';
import storage from '../../storage';
import layout from '../../room/layout';
import size from '../../utils/windowSize';
import { worldToScreen } from '../../utils/three';
import router from '../../router';
import background from '../../background';
import setupPOV from '../../pov';
import Orb from '../../orb';
import settings from '../../settings';
import transition from '../../transition';

const easeOut = t => -t * (t - 2.0);

export default class Playlist extends Component {
  constructor() {
    super();
    this.rooms = [];
    this.orb = new Orb();
    this.tick = this.tick.bind(this);
  }

  componentWillMount() {
    this.mounted = true;

    const { recording } = this.props;
    const { rooms } = this;

    if (recording) {
      for (let index = 1; index < 20; index += 2) {
        const room = new Room({ recording, index, wall: true });
        rooms.push(room);
      }
    }

    this.pov = setupPOV(this);
    this.pov.setupInput();
    this.moveOrb(0);
    Room.reset();
    Room.rotate180();

    this.asyncMount();
    viewer.events.on('tick', this.tick);
  }

  componentWillReceiveProps({ orb }) {
    if (orb) {
      this.orb.show();
    } else {
      this.orb.hide();
    }
  }

  componentWillUnmount() {
    this.orb.destroy();
    this.rooms.forEach((room, index) => {
      room.destroy();
      // if (process.env.FLAVOR === 'cms') {
      //   document.body.removeChild(document.getElementById(`room-label-${index}`));
      // }
    });
    viewer.events.off('tick', this.tick);
    this.pov.removeInput();
    background.destroy();
  }

  async asyncMount() {
    const { pathRecording, pathRoomIndex } = this.props;
    const entries = await storage.loadPlaylist();
    if (!this.mounted) return;

    for (let i = 0; i < entries.length; i++) {
      const isPathRecording = i === pathRoomIndex - 1;
      const entry = entries[i];
      this.rooms.push(
        new Room({
          id: isPathRecording
            ? `${pathRecording}`
            : process.env.FLAVOR === 'cms'
              ? entry.id
              : entry,
          index: i,
          pathRecording: isPathRecording,
        })
      );
    }

    await new Promise((resolve) => {
      // entries.forEach(
      //   (entry) => {
      //     // if (process.env.FLAVOR === 'cms') {
      //     //   const days = Math.floor(entry.days_featured);
      //     //   const hours = Math.floor(entry.days_featured % 1 * 24);
      //     //   document.body.appendChild(
      //     //     h(
      //     //       `div.room-label#room-label-${index}`,
      //     //       {
      //     //         onmousedown: (event) => {
      //     //           router.navigate(`/choose/${index + 1}`);
      //     //           event.stopPropagation();
      //     //         },
      //     //       },
      //     //       h('span', `Room ${index + 1}`),
      //     //       h('span.wrap', entry.title === '' ? 'Unnamed' : entry.title),
      //     //       h(
      //     //         'span.newline',
      //     //         `Featured ${days} day${days > 1 ? 's' : ''}, ${hours} hour${hours > 0 ? 's' : ''}`
      //     //       ),
      //     //     )
      //     //   );
      //     // }
      // 
      //   },
      // );
      const destroyedErrorName = 'playlist destroyed';
      asyncEach(
        this.rooms,
        4,
        (room, callback) => {
          // If destroyed, callback with error to stop loading further files:
          if (this.destroyed) {
            return callback(Error(destroyedErrorName));
          }
          room.load(callback);
        },
        (error) => {
          if (error && error.name !== destroyedErrorName) {
            this.onError(error);
          }
          resolve();
        },
      );
    });
  }

  moveOrb(progress) {
    const position = layout.getPosition(progress + 0.5);
    position.y += settings.holeHeight;
    position.z *= -1;
    this.orb.position.copy(position);
  }

  tick() {
    if (!this.rooms || transition.isInside()) return;
    Room.clear();
    this.pov.update(audio.progress);
    background.update(audio.time);
    this.moveOrb(audio.progress || 0);

    for (let i = 0; i < this.rooms.length; i++) {
      const room = this.rooms[i];
      let time = audio.time;
      if (layout.isOdd(room.index)) {
        time += audio.loopDuration;
      }
      // Slow down recordings to a stop after music stops:
      const slowdownDuration = 0.4;
      const maxTime = 216.824266 - (slowdownDuration * 0.5);
      if (audio.time > maxTime) {
        time = maxTime + easeOut(
          Math.min(
            slowdownDuration,
            audio.time - maxTime
          ) / slowdownDuration
        ) * slowdownDuration;
      }
      room.gotoTime(time % (audio.loopDuration * 2));

      // if (process.env.FLAVOR === 'cms') {
      //   const coords = worldToScreen(viewer.camera, room.worldPosition);
      //   const label = document.getElementById(`room-label-${i}`);
      //   if (coords.x > 0 && coords.x < size.width && label && !label.classList.contains('mod-hidden')) {
      //     label.classList.remove('mod-removed');
      //     label.style.transform = `translate(${coords.x}px, ${coords.y}px)`;
      //   } else if (label) {
      //     label.classList.add('mod-removed');
      //   }
      // }
    }
  }
  
  // render() {
  //   return process.env.FLAVOR === 'cms' && (
  //     
  //   )
  // }
}
