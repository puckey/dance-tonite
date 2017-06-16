import firebaseConnection from './connection';

const serverURL = firebaseConnection.serverURL;

// getDraftPlaylist:
// cms.getDraftPlaylist().then((data) => { console.log('getDraftPlaylist!', data); });
const getDraftPlaylist = () =>
      firebaseConnection.contactServer(`${serverURL}getDraftPlaylist`, {});

// updateDraftPlaylist:
// cms.updateDraftPlaylist({ room: 3, id: 'adsf' })
//   .then((data) => { console.log('update', data); });
const updateDraftPlaylist = ({ room, id }) =>
      firebaseConnection.contactServer(`${serverURL}updateDraftPlaylist`, { room, id });

// publishDraftPlaylist:
// cms.publishDraftPlaylist().then((data) => { console.log('publishDraftPlaylist!', data); });
const publishDraftPlaylist = () =>
      firebaseConnection.contactServer(`${serverURL}publishDraftPlaylist`, {});

// getUnmoderatedRecordings:
// cms.getUnmoderatedRecordings().then((data) => { console.log('data', data); });
const getUnmoderatedRecordings = () =>
      firebaseConnection.contactServer(`${serverURL}getUnmoderatedRecordings`, {});

// getRecording:
// cms.getRecording('EamZtQ').then((data) => { console.log('getRecording!', data); });
const getRecording = (id) =>
      firebaseConnection.contactServer(`${serverURL}getRecording`, { id });

// getAvailableRecordings:
// cms.getAvailableRecordings(1).then((data) => { console.log('getAvailableRecordings', data); });
const getAvailableRecordings = (room) =>
      firebaseConnection.contactServer(`${serverURL}getAvailableRecordings`, { room });

// getAllRecordings:
// cms.getAllRecordings().then((data) => { console.log('getAllRecordings', data); });
const getAllRecordings = () =>
      firebaseConnection.contactServer(`${serverURL}getAllRecordings`, {});

// updateRecording:
// cms.updateRecording({ id: 'EamZtQ', title: 'hello there', rating: 1, is_universal: false})
//   .then((data) => { console.log(data); });
//    if title, rating, or isUniversal are left null, their value will not be changed
//    is_universal is a boolean
//    rating:
//       0 = unrated
//       1 = good (star)
//      -1 = not good
const updateRecording = ({ id, title, rating, is_universal }) =>
      firebaseConnection.contactServer(
        `${serverURL}updateRecording`,
         { id, title, rating, is_universal }
       );

export default {
  getDraftPlaylist,
  updateDraftPlaylist,
  publishDraftPlaylist,
  getUnmoderatedRecordings,
  getRecording,
  getAllRecordings,
  getAvailableRecordings,
  updateRecording,
};
