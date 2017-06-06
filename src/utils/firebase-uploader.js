import * as firebase from "firebase";
import emitter from 'mitt';

const config = {
  apiKey: "AIzaSyCvrZWf22Z4QGRDpL-qI3YlLGkP9-BIsrY",
  authDomain: "you-move-me.firebaseapp.com",
  databaseURL: "https://you-move-me.firebaseio.com",
  storageBucket: "you-move-me.appspot.com",
};
firebase.initializeApp(config);

const generateTokenURL = 'https://us-central1-you-move-me.cloudfunctions.net/getUploadToken';

const auth = firebase.auth();
const storageRef = firebase.storage().ref();

const login = (callback) => { // this will return immediately if the user is already logged in
  auth.signInAnonymously().then(
    function () {
      var user = firebase.auth().currentUser;
      callback(null);
    },
    function (error) {
      callback(error);
    }
  );
}

const requestUploadToken = (roomID, callback) => {
  login((error) => {
    if (error) throw error;

    const request = new XMLHttpRequest();
    request.open('PUT', generateTokenURL, true);

    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        // Success!
        const data = JSON.parse(request.responseText);

        console.log(data);

        const filename = data.uri;
        const token = data.token;

        callback(filename, token);
      } else {
        // We reached our target server, but it returned an error
        throw "error connecting to server"
      }
    };

    request.onerror = function(error) {
      throw error
    };

    const dataToSend = { 'room':roomID }; 

    request.setRequestHeader("Content-Type", "application/json");
    request.send(JSON.stringify(dataToSend));
  });
}

const uploadDataString = (dataString, filename, uploadToken, callback) => {
  const targetFileRef = storageRef.child('_incoming/' + filename);

  // metadata we want to store with the file
  const metadata = {
    contentType: 'application/json',
    customMetadata: {
      'token': uploadToken
    }
  };

  const uploadTask = targetFileRef.putString(dataString, undefined, metadata);

  uploadTask.on('state_changed', function(snapshot){
    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

    console.log('Upload is ' + progress + '% done');
    // TODO: emit upload progress events

  }, function(error) {
    throw error;
  }, function() {
    // Handle successful uploads on complete
    const snapshot = uploadTask.snapshot;
    var fileURL = snapshot.downloadURL;
    callback(fileURL)
  });
}



const firebaseUploader = {

  upload: (json, roomID, callback) => {
    // request an upload token
    requestUploadToken(roomID, function(filename, token){
      // now that we have the token, upload to the given URL
      uploadDataString(json, filename, token, function(fileURL){
        // the upload is done!
        callback(fileURL)
      });
    });
  }

};

export default firebaseUploader;