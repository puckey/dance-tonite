import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/storage';

const serverURL = 'https://us-central1-you-move-me.cloudfunctions.net/';
// const serverURL = 'http://localhost:5002/you-move-me/us-central1/';

const config = {
  apiKey: 'AIzaSyCvrZWf22Z4QGRDpL-qI3YlLGkP9-BIsrY',
  authDomain: 'you-move-me.firebaseapp.com',
  databaseURL: 'https://you-move-me.firebaseio.com',
  storageBucket: 'you-move-me.appspot.com',
};
firebase.initializeApp(config);

const auth = firebase.auth();
const userAuth = { id: '', token: '' };

// this will return immediately if the user is already logged in
const loginAnonymously = (callback) => {
  auth.signInAnonymously().then((user) => {
    userAuth.id = user.uid;
    user.getIdToken().then((token) => {
      userAuth.token = token;
      callback(null);
    });
  })
  .catch((error) => {
    callback(error);
  });
};

// URL: endpoint of http function
// dataToSend: data object to send in the request body
const contactServer = (URL, dataToSend, secretAuth) => {
  const promise = new Promise((resolve, reject) => {
    loginAnonymously((error) => {
      if (error) throw error;

      let authString = '';
      if (secretAuth) {
        // authorize with the secret key
        authString = localStorage ? localStorage.getItem('secret') : '';
      } else {
        // otherwise, auth with our user token
        authString = userAuth.token;
      }

      const request = new XMLHttpRequest();
      request.open('PUT', URL, true);
      request.setRequestHeader('Authorization', `Bearer ${authString}`);

      request.onload = () => {
        if (request.status >= 200 && request.status < 400) {
          resolve(JSON.parse(request.responseText));
        } else {
          console.log(request.responseText);
          // problem reaching server
          resolve({ success: false, error: 'error connecting to server' });
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

const firebaseConnection = {
  firebase,
  contactServer,
  serverURL,
  userAuth,
};

export default firebaseConnection;
