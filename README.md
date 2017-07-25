# You MOVE Me

## Installing

    npm install

## Developing

    Start website: npm start
    Start cms: npm run start-cms

## Building

    Build website: npm run build
    Build cms: npm run build-cms

## Deployments

### __Development Servers__

Password to access deployments: dat

- __Staging__: Commits on [master](https://github.com/puckey/you-move-me/tree/master) branch are automatically deployed to staging: http://staging-tonite-dance.puckey.studio
- __Production__: Commits on [deploy-dance-tonite](https://github.com/puckey/you-move-me/tree/deploy-dance-tonite) branch are automatically deployed to production: http://dance-tonite.puckey.studio
- __CMS__: The CMS version of the latest master branch: http://dance-tonite-cms.puckey.studio
- __Branches__: Builds of all branches can be accessed through: `https://{branch-name}--dance-tonite.netlify.com/`

### __App Engine__

https://master-dot-you-move-me.appspot.com/
password: dat

secret key: you can supply a secret key rather than enter it in the prompt, via query string [?k=dat](https://master-dot-you-move-me.appspot.com/?k=dat). You only have to do this once per browser, and then it's stored in local storage from then on.

__Deploying__:

  1. Install the [Go SDK for App Engine](https://cloud.google.com/appengine/downloads#Google_App_Engine_SDK_for_Go)
  2. run the command: `npm run deploy`

## Recording
- To record a specific room, add the number behind the record url: `/record/1/head=yes/` up to `/record/21/head=yes/`.
- To record a room without heads, add the number 1 behind the room number. So, room 3, no heads: `/record/3/head=no/`.
