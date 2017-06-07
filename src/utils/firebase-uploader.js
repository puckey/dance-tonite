import * as firebase from "firebase";
import emitter from 'mitt';
import convertFPS from './convertFPS';

const config = {
  apiKey: "AIzaSyCvrZWf22Z4QGRDpL-qI3YlLGkP9-BIsrY",
  authDomain: "you-move-me.firebaseapp.com",
  databaseURL: "https://you-move-me.firebaseio.com",
  storageBucket: "you-move-me.appspot.com",
};
firebase.initializeApp(config);

const generateTokenURL = 'https://us-central1-you-move-me.cloudfunctions.net/getUploadToken';
const processSubmissionURL = 'https://us-central1-you-move-me.cloudfunctions.net/processSubmission';

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

const contactServer = (URL, dataToSend) => {
  return new Promise((resolve, reject) => {
    login((error) => {
      if (error) throw error;

      const request = new XMLHttpRequest();
      request.open('PUT', URL, true);

      request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
          const response = JSON.parse(request.responseText);

          console.log(response);

          if (!response.success) {
            reject("error connecting to server");
          } else {
            const data = response.data;
            resolve(data);
          }

        } else {
          // problem reaching server
          reject( "error connecting to server" );
        }
      };

      request.onerror = function(error) {
        reject( error );
      };


      request.setRequestHeader("Content-Type", "application/json");
      request.send(JSON.stringify(dataToSend));
    });

  });
}

const requestUploadToken = (roomID) => {
  const dataToSend = { 'room':roomID }; 
  return contactServer(generateTokenURL, dataToSend)
}

const uploadDataString = (dataString, filename, uploadToken) => {

  return new Promise((resolve, reject) => {
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
      reject( error );
    }, function() {
      // Handle successful uploads on complete
      const snapshot = uploadTask.snapshot;
      var fileURL = snapshot.downloadURL;

      console.log("uploaded", fileURL)
      resolve( fileURL );
    });
  });
}

const startSubmissionProcessing = (token) => contactServer(processSubmissionURL, { token });

const firebaseUploader = {
  upload: async (roomData, roomID, callback) => {
    try {
      // Request an upload token
      const { uri_array, token } = await requestUploadToken(roomID);
      // Wait for all uploads to complete
      await Promise.all(
        uri_array.map(([fps, filename]) => (
          uploadDataString(
            (
              fps === 90
                ? roomData
                : convertFPS(roomData, fps)
            ).map(JSON.stringify).join('\n'),
            filename,
            token
          )
        ))
      );
      console.log('done all uploads');

      // now process files
      const { id } = await startSubmissionProcessing(token);
      // file processing is done, the recording is saved!
      callback(null, id);
    } catch (error) {
      callback(error);
    }
  },
};

export default firebaseUploader;
