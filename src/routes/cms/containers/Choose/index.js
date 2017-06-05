/** @jsx h */
import { h, Component } from 'preact';
import './style.scss';

import Room from '../../components/Room';
import Container from '../../components/Container';
import Error from '../../components/Error';
import Align from '../../components/Align';
import Close from '../../components/Close';
import Mute from '../../components/Mute';
import EnterVR from '../../components/EnterVR';
import PaginatedList from '../../components/PaginatedList';

const choices = [
  {
    id: '1030619202368-bd491815',
    name: 'First',
  },
  {
    id: '1030183816095-9085ceb6',
    name: 'Explosion',
  },
  {
    id: '1030261510603-8bad2f3c',
    name: 'Drummer',
  },
  {
    id: '1030262646806-72cfa2a3',
    name: 'Standing up',
  },
  {
    id: '1030280695249-75f03b49',
    name: 'Marching',
  },
  {
    id: '1030279610994-2050ebff',
    name: 'flies',
  },
  {
    id: '1030184941183-3d4bb76a',
    name: 'campfire',
  },
  {
    id: '1030187137836-f4c0f1c7',
    name: 'flying hands',
  },
  {
    id: '1030276578477-8a79e35e',
    name: 'tunnel',
  },
  {
    id: '1030233234037-23f0590f',
    name: 'jeff squares',
  },
  {
    id: '1030231817998-689babac',
    name: 'jeff walk away',
  },
  {
    id: '1030273435171-f4249b52',
    name: 'lonely guy',
  },
];

export default class Choose extends Component {
  constructor() {
    super();
    this.state = {
      items: choices,
      item: choices[1],
    };
    this.changeItem = this.changeItem.bind(this);
  }

  changeItem(item) {
    this.setState({ item });
  }

  render({ roomId, goHome }, { items, item }) {
    return (
      <Container>
        <Align type="top-left row">
          <EnterVR /><Mute />
        </Align>
        <Align type="bottom-right">
          <PaginatedList
            item={item}
            items={items}
            performChange={this.changeItem}
          />
        </Align>
        <Align type="top-right">
          <Close
            onClick={goHome}
          />
        </Align>
        {
          !choices[roomId]
            ? (
              <Align type="center">
                <Error>Room not found</Error>
              </Align>
            )
            : <Room loopIndex={roomId} recordingId={item.id} key={item.id} />
        }
      </Container>
    );
  }
}
