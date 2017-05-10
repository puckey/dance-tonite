# You MOVE Me

## Installing & developing

    npm install
    npm start

## Building

    npm run build

## Recording
- To record a specific room, add the number behind the record url: `/record/1` up to `/record/21`.
- To record a room without heads, add the number 1 behind the room number. So, room 3, no heads: `/record/3/1`.

## Configuring for flows
- Visit `/version` to set up a browser to take on a specific flow during IO. This value is reflected in: `feature.isIODaydream` & `feature.isIOVive`.
- Here you can also select the color of the room when it is in recording mode to match the color of the space.

## Debug plane
- To add a debug plane to the recording room, visit `/plane` then trigger in all four corners of the room.
- To remove the debug plane again, visit `/plane` then press reset.
