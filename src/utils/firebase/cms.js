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

// getDraftPlaylist:
// cms.getDraftPlaylist().then((data) => { console.log('getDraftPlaylist!', data); });
const getDraftPlaylist = () => getConnection().then(
  () => connection.contactServer(`${connection.serverURL}getDraftPlaylist`, {}, true)
);

// updateDraftPlaylist:
// cms.updateDraftPlaylist({ room: 3, id: 'adsf' })
//   .then((data) => { console.log('update', data); });
const updateDraftPlaylist = ({ room, id }) => getConnection().then(
  () => connection.contactServer(`${connection.serverURL}updateDraftPlaylist`, { room, id }, true)
);

// publishDraftPlaylist:
// cms.publishDraftPlaylist().then((data) => { console.log('publishDraftPlaylist!', data); });
const publishDraftPlaylist = () => getConnection().then(
  () => connection.contactServer(`${connection.serverURL}publishDraftPlaylist`, {}, true)
);

// getUnmoderatedRecordings:
// cms.getUnmoderatedRecordings().then((data) => { console.log('data', data); });
const getUnmoderatedRecordings = () => getConnection().then(
  () => connection.contactServer(`${connection.serverURL}getUnmoderatedRecordings`, {}, true)
);

// getRecording:
// cms.getRecording('EamZtQ').then((data) => { console.log('getRecording!', data); });
const getRecording = (id) => getConnection().then(
  () => connection.contactServer(`${connection.serverURL}getRecording`, { id }, true)
);

// banRecording:
// cms.banRecording('EamZtQ').then((data) => { console.log('recording banned!', data); });
const banRecording = (id) => getConnection().then(
  () => connection.contactServer(`${connection.serverURL}banRecording`, { id }, true)
);

// getAvailableRecordings:
// cms.getAvailableRecordings(1).then((data) => { console.log('getAvailableRecordings', data); });
const getAvailableRecordings = (room) => getConnection().then(
  () => connection.contactServer(`${connection.serverURL}getAvailableRecordings`, { room }, true)
);

// getAllRecordings:
// cms.getAllRecordings().then((data) => { console.log('getAllRecordings', data); });
const getAllRecordings = () => getConnection().then(
  () => connection.contactServer(`${connection.serverURL}getAllRecordings`, {}, true)
);

// updateRecording:
// cms.updateRecording({ id: 'EamZtQ', title: 'hello there', rating: 1, is_universal: false, is_megagrid_worthy:true})
//   .then((data) => { console.log(data); });
//    if title, rating, or isUniversal are left null, their value will not be changed
//    is_universal is a boolean
//    is_megagrid_worthy is a boolean
//    rating:
//       0 = unrated
//       1 = good (star)
//      -1 = not good
const updateRecording = ({ id, title, rating, is_universal, is_megagrid_worthy, room }) => (
  getConnection().then(
    () => connection.contactServer(
     `${connection.serverURL}updateRecording`,
      { id, title, rating, is_universal, is_megagrid_worthy, room },
      true
    )
  )
);

export default {
  getDraftPlaylist,
  updateDraftPlaylist,
  publishDraftPlaylist,
  getUnmoderatedRecordings,
  getRecording,
  banRecording,
  getAllRecordings,
  getAvailableRecordings,
  updateRecording,
};
