import thunk from 'redux-thunk';
import { createStore, applyMiddleware, compose } from 'redux';
import { logger, saga, error } from '../middleware';
import rootReducer from '../reducers';

const create = window.devToolsExtension
  ? window.devToolsExtension()(createStore)
  : createStore;

const createStoreWithMiddleware = compose(
  applyMiddleware(
    error,
    thunk,
    logger,
    saga,
  ),
)(create);

const store = createStoreWithMiddleware(rootReducer);

export default {
  ...store,
  runSaga: saga.run,
};
