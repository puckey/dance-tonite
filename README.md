# You MOVE Me

## Installing & developing

    npm install
    npm start

## Building

    npm run build


## Changing color of recording room
Go to /record?color=[color].
Where `color` is one of the following:
- `green`
- `red`
- `orange`
- `blue`
- `pink`

# Known caveats

Pressing the back button in your browser while mid-transition (when the scene fades to black in recording mode) messes up the routing system. Refresh to fix.
