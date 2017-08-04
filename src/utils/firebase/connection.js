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
const loginAnonymously = () => {
  return new Promise((resolve) => {
    auth.signInAnonymously().then((user) => {
      userAuth.id = user.uid;
      user.getIdToken().then((token) => {
        userAuth.token = token;
        resolve();
      });
    })
    .catch((error) => {
      resolve(error);
    });
  });
};

// URL: endpoint of http function
// dataToSend: data object to send in the request body
const contactServer = (URL, dataToSend, secretAuth) => {
  const promise = new Promise((resolve, reject) => {
    loginAnonymously().then((error) => {
      if (error) return reject(error);

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
  loginAnonymously,
  serverURL,
  userAuth,
};

export default firebaseConnection;
