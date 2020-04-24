import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react'
import { ConnectedRouter } from 'connected-react-router';
import { History } from 'history';
import Sidebar from './containers/Sidebar';
const customTitlebar = require('custom-electron-titlebar');

new customTitlebar.Titlebar({
  backgroundColor: customTitlebar.Color.fromHex('#444'),
  overflow: "hidden",
});

export default class App extends React.Component {
  render() {

    const { store, persistor, history } = this.props;

    return(
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ConnectedRouter history={history}>
            <Sidebar />
          </ConnectedRouter>
        </PersistGate>
      </Provider>
    )
  }
}
