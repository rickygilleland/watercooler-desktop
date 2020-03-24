import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from './constants/routes.json';
import EnsureLoggedInContainer from './containers/EnsureLoggedInContainer';
import LoginPage from './containers/LoginPage';
import HomePage from './containers/HomePage';
import RoomPage from './containers/RoomPage';

export default function Routes() {
  return (
    <Switch>
    <Route path={routes.LOGIN} component={LoginPage} />
    <EnsureLoggedInContainer>
        <Route path={routes.ROOM} component={RoomPage} />
        <Route path={routes.HOME} component={HomePage} />
    </EnsureLoggedInContainer>
    </Switch>
  );
}

