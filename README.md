# You MOVE Me

## Installing & developing

    npm install
    npm start

## Building

    npm run build

## Recording
- To record a specific room, add the number behind the record url: `/record/1` up to `/record/21`.
- To record a room without heads, add the number 1 behind the room number. So, room 3, no heads: `/record/3/1`.

## Debug plane
- To add a debug plane to the recording room, visit `/plane` then trigger in all four corners of the room.
- To remove the debug plane again, visit `/plane` then press reset.

## Changing color of recording room
Go to /record?color=[color].
Where `color` is one of: `green` `red` `orange` `blue` `pink`

## Known caveats

Pressing the back button in your browser while mid-transition (when the scene fades to black in recording mode) messes up the routing system. Refresh to fix.
