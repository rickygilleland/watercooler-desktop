import React from 'react';
import ReactDOM from 'react-dom';
import {AppContainer} from 'react-hot-loader';
import { store, persistor, history } from './store';

const render = () => {
  const App = require('./app').default;
  ReactDOM.render(<AppContainer><App store={store} history={history} persistor={persistor} /></AppContainer>, document.getElementById('App'));
}

render();