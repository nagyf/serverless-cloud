import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.css';
import { Dashboard } from './dashboard/Dashboard';
import { Login } from './login/Login';
import { Logout } from './logout/Logout';

function App() {
    return (
        <Router>
            <Switch>
                <Route path="/login">
                    <Login />
                </Route>
                <Route path="/logout">
                    <Logout />
                </Route>
                <Route path="/">
                    <Dashboard />
                </Route>
            </Switch>
        </Router>
    );
}

export default App;
