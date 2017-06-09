import * as firebase from 'firebase';

const config = {
  apiKey: 'AIzaSyCvrZWf22Z4QGRDpL-qI3YlLGkP9-BIsrY',
  authDomain: 'you-move-me.firebaseapp.com',
  databaseURL: 'https://you-move-me.firebaseio.com',
  storageBucket: 'you-move-me.appspot.com',
};
firebase.initializeApp(config);

const auth = firebase.auth();

// this will return immediately if the user is already logged in
const loginAnonymously = (callback) => {
  auth.signInAnonymously()
    .then(() => {
      callback(null);
    })
    .catch((error) => {
      callback(error);
    });
};

// URL: endpoint of http function
// dataToSend: data object to send in the request body
const contactServer = (URL, dataToSend) => {
  const promise = new Promise((resolve, reject) => {
    loginAnonymously((error) => {
      if (error) throw error;

      const request = new XMLHttpRequest();
      request.open('PUT', URL, true);

      request.onload = () => {
        if (request.status >= 200 && request.status < 400) {
          const response = JSON.parse(request.responseText);

          if (!response.success) {
            reject(response.error);
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

const firebaseConnection = {
  firebase,
  contactServer,
};

export default firebaseConnection;
