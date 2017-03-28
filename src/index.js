import { isApp } from './utils/feature';
import store from './store';
import rootSaga from './sagas';
import 'babel-polyfill';

store.runSaga(rootSaga);
