import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react'
import { ConnectedRouter } from 'connected-react-router';
import { History } from 'history';
import Routes from './Routes';

export default class App extends React.Component {
  render() {

    const { store, persistor, history } = this.props;

    console.log(persistor);

    return(
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ConnectedRouter history={history}>
            <Routes />
          </ConnectedRouter>
        </PersistGate>
      </Provider>
    )
  }
}
