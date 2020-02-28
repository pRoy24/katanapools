import React from 'react';
import logo from './logo.svg';
import './App.scss';
import LandingContainer from './components/landing/LandingContainer';
import TopNav from './components/nav/TopNav';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";




function App() {
  return (
   <Router>
    <div className="App">
      <TopNav/>
      <LandingContainer/>
      </div>
    </Router>
  );
}

export default App;
