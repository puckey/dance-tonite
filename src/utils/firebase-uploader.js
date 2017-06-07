import * as firebase from 'firebase';
import convertFPS from './convertFPS';

const config = {
  apiKey: 'AIzaSyCvrZWf22Z4QGRDpL-qI3YlLGkP9-BIsrY',
  authDomain: 'you-move-me.firebaseapp.com',
  databaseURL: 'https://you-move-me.firebaseio.com',
  storageBucket: 'you-move-me.appspot.com',
};
firebase.initializeApp(config);

const generateTokenURL = 'https://us-central1-you-move-me.cloudfunctions.net/getUploadToken';
const processSubmissionURL = 'https://us-central1-you-move-me.cloudfunctions.net/processSubmission';

const auth = firebase.auth();
const storageRef = firebase.storage().ref();

const login = (callback) => { // this will return immediately if the user is already logged in
  auth.signInAnonymously()
    .then(() => {
      callback(null);
    })
    .catch((error) => {
      callback(error);
    });
};

const contactServer = (URL, dataToSend) => {
  const promise = new Promise((resolve, reject) => {
    login((error) => {
      if (error) throw error;

      const request = new XMLHttpRequest();
      request.open('PUT', URL, true);

      request.onload = () => {
        if (request.status >= 200 && request.status < 400) {
          const response = JSON.parse(request.responseText);

          if (!response.success) {
            reject('error connecting to server');
          } else {
            const data = response.data;
            resolve(data);
          }
        } else {
          // problem reaching server
          reject('error connecting to server');
        }
      };

      request.onerror = (err) => {
        reject(err);
      };

      request.setRequestHeader('Content-Type', 'application/json');
      request.send(JSON.stringify(dataToSend));
    });
  });

  return promise;
};

const requestUploadToken = (roomID) => contactServer(generateTokenURL, { room: roomID });

const uploadDataString = (dataString, filename, uploadToken) => {
  const promise = new Promise((resolve, reject) => {
    const targetFileRef = storageRef.child(`_incoming/${filename}`);

    // metadata we want to store with the file
    const metadata = {
      contentType: 'application/json',
      customMetadata: {
        token: uploadToken,
      },
    };

    const uploadTask = targetFileRef.putString(dataString, undefined, metadata);

    uploadTask.on('state_changed', () => { // progress
      // uploadTask.on('state_changed', (snapshot) => { // progress
      // const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      // console.log('Upload is ' + progress + '% done');
      // TODO: emit upload progress events
    }, (error) => { // error
      reject(error);
    }, () => { // complete
      resolve(uploadTask.snapshot.downloadURL);
    });
  });

  return promise;
};

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
