/*

USAGE:

--------------------

Migrate a single json file:

migrate.migrateJSON('1030184941183-3d4bb76a.json?campfire');

--------------------

Migrate a playlist by loading if from the web:

migrate.loadAndMigratePlaylist('https://dance-tonite.puckey.studio/public/playlists/curated.json')


--------------------

Migrate a playlist via an array:

const playlistToMigrate = [
"1030619202368-bd491815.json?first",
"1030183816095-9085ceb6.json?explosion",
"1030261510603-8bad2f3c.json?drummer",
"1030270289280-52e9762b.json?end"
]
migrate.migratePlaylistArray(playlistToMigrate)

*/
import firebaseUploader from './firebase-uploader';


function loadPlaylistAndMigrate(filename){
	var request = new XMLHttpRequest();
	request.open('GET', filename, true);


	request.onload = function() {
	  if (request.status >= 200 && request.status < 400) {
	    var jsonString = request.responseText;

	    var playlistArray = JSON.parse(jsonString)

	    console.log("migrating:", playlistArray)

	  } 
	};

	request.onerror = function() {
	  // There was a connection error of some sort
	  console.log('connection error')
	};

	request.send();
}

function migrateJSON(filename, roomID){

  return new Promise((resolve, reject) => {
    var request = new XMLHttpRequest();
    request.open('GET', 'https://d1nylz9ljdxzkb.cloudfront.net/' + filename, true);

    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        // Success!
        //var data = JSON.parse(request.responseText);
        //var data = JSON.parse(request.responseText);
        var jsonString = request.responseText;
        //console.log("got it!");

        firebaseUploader.upload(
          jsonString.split('\n').map(JSON.parse),
          roomID,
          (error, data) => {
            if (error) console.log('ERROR!', error)
            else console.log('file uploaded!', data)

            resolve(data);
          }
        );

      } 
    };

    request.onerror = function() {
      // There was a connection error of some sort
      reject('connection error')
    };

    request.send();
  });
}

function migratePlaylist (playlistArray) {

  var migrationPromises = [];
  var convertedPlaylist = [];
  for (var i = 0; i < playlistArray.length; i++) {
    const playlistItem = playlistArray[i];
    const jsonFilename = playlistItem.split('?')[0];
    const description = playlistItem.split('?')[1];

    console.log(jsonFilename, description)

    const roomID = i + 1;
    const promise = migrateJSON(jsonFilename, roomID );
    migrationPromises.push(promise);

    promise.then( (id) => {
      console.log("done " + roomID + " " + id)
      convertedPlaylist[roomID - 1] = id + "?" + description;
    })
  }

  Promise.all(migrationPromises).then( () => {

    console.log("all done")
    console.log("----")
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
    migrateJSON(filename, roomID)
  },
};

export default migrate;