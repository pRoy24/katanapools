import React from 'react';
import logo from './logo.svg';
import './App.scss';
import Landing from './components/landing/Landing';
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
      <Landing/>
      </div>
    </Router>
  );
}

export default App;
