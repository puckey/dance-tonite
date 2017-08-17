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
let connection;

const getConnection = () => (
  new Promise((resolve) => {
    if (connection) return resolve(connection);
    require.ensure([], function (require) {
      connection = require('./connection').default;
      resolve(connection);
    });
  })
);

import convertFPS from '../convertFPS';

const uploadDataString = (dataString, filename) => {
  const promise = new Promise((resolve, reject) => {
    const targetFileRef = connection.firebase.storage().ref().child(`_incoming/${filename}`);

    // metadata we want to store with the file
    const metadata = {
      contentType: 'application/json',
      customMetadata: {
        uid: connection.userAuth.id,
        token: connection.userAuth.token,
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
      resolve();
    });
  });

  return promise;
};

const startSubmissionProcessing = (uid) => getConnection().then(
  () => connection.contactServer(`${connection.serverURL}processSubmission`, { uid })
);

const firebaseUploader = {
  upload: async (roomData, roomID, callback) => {
    await getConnection();

    const loginError = await connection.loginAnonymously();
    if (loginError) return callback(loginError);

    const standardFileDataRates = [15, 45, 90];
    const uid = connection.userAuth.id;

    // Wait for all uploads to complete
    await Promise.all(
      standardFileDataRates.map((fps) => (
        uploadDataString(
          (
            fps === 90
              ? roomData
              : convertFPS(roomData, fps)
          ).map(JSON.stringify).join('\n'),
          `${uid}_${fps}.json`
        )
      ))
    );

    // now process files
    const { data: submission, error: processingError } = await startSubmissionProcessing(uid);
    if (processingError) return callback(processingError);
    // file processing is done, the recording is saved!
    callback(null, submission.id);
  },
};

export default firebaseUploader;
