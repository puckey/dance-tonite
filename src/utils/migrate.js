/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*

USAGE:

--------------------

Migrate a single json file:

migrate.migrateJSON('1030266141029-b5ba6ff6.json?tutorial');

--------------------

Migrate a playlist by loading if from the web:

migrate.loadAndMigratePlaylist('https://dance-tonite.puckey.studio/public/playlists/curated.json')


--------------------

Migrate a playlist via an array:

const playlistToMigrate = [
"1030619202368-bd491815.json?first",
"1030183816095-9085ceb6.json?explosion",
"1030261510603-8bad2f3c.json?drummer",
"1030262646806-72cfa2a3.json?standing up",
"1030280695249-75f03b49.json?marching",
"1030279610994-2050ebff.json?flies",
"1030184941183-3d4bb76a.json?campfire",
"1030187137836-f4c0f1c7.json?flying hands",
"1030276578477-8a79e35e.json?tunnel",
"1030233234037-23f0590f.json?jeff squares",
"1030231817998-689babac.json?jeff walk away",
"1030273435171-f4249b52.json?lonely guy",
"1030186081791-7bcb248c.json?gym",
"1030272393550-2e080727.json?wave",
"1030280166957-2a4309b8.json?backs to camera hands up on aaaah",
"1030271006837-49c6eea7.json?plants",
"1030185553157-56f65baf.json?dance",
"1030232691136-bb71947f.json?intense spin",
"1030270623237-5c8ea55e.json?line Dance",
"1030270406489-28f04589.json?thriller",
"1030270289280-52e9762b.json?end"
]
migrate.migratePlaylistArray(playlistToMigrate)

*/
import firebaseUploader from './firebase/uploader';


function loadPlaylistAndMigrate(filename) {
  const request = new XMLHttpRequest();
  request.open('GET', filename, true);


  request.onload = function () {
    if (request.status >= 200 && request.status < 400) {
      const jsonString = request.responseText;
      const playlistArray = JSON.parse(jsonString);

      migratePlaylist(playlistArray);
    }
  };

  request.onerror = function () {
    // There was a connection error of some sort
    console.log('connection error');
  };

  request.send();
}

function migrateJSON(filename, forceRoomID) {
  const promise = new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('GET', `https://d1nylz9ljdxzkb.cloudfront.net/${filename}`, true);

    request.onload = function () {
      if (request.status >= 200 && request.status < 400) {
        const jsonString = request.responseText;

        // get roomID from json (unless specified in parameter)
        const dataLines = jsonString.split('\n');
        const headerData = JSON.parse(dataLines[0]);
        const roomID = (forceRoomID !== undefined) ? forceRoomID : headerData.loopIndex;

        firebaseUploader.upload(
          dataLines.map(JSON.parse),
          roomID,
          (error, data) => {
            if (error) console.log('ERROR!', error);
            else console.log('file uploaded!', data);

            resolve(data);
          }
        );
      }
    };

    request.onerror = function () {
      reject('connection error');
    };

    request.send();
  });

  return promise;
}

function migratePlaylist(playlistArray) {
  const migrationPromises = [];
  const convertedPlaylist = [];
  for (let i = 0; i < playlistArray.length; i++) {
    const playlistItem = playlistArray[i];
    const jsonFilename = playlistItem.split('?')[0];
    const description = playlistItem.split('?')[1];

    const roomID = i + 1;
    const promise = migrateJSON(jsonFilename, roomID);
    migrationPromises.push(promise);

    promise.then((id) => {
      console.log(`done  ${roomID} ${id}`);
      convertedPlaylist[roomID - 1] = `${id}?${description}`;
    });
  }

  Promise.all(migrationPromises).then(() => {
    console.log('all done');
    console.log('----');
    console.log(JSON.stringify(convertedPlaylist));
  });
}


const migrate = {
  loadAndMigratePlaylist: (filename) => {
    loadPlaylistAndMigrate(filename);
  },
  migratePlaylistArray: (playlistArray) => {
    migratePlaylist(playlistArray);
  },
  migrateJSON: (filename, roomID) => {
    migrateJSON(filename, roomID);
  },
};

export default migrate;
