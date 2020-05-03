import React from 'react';
import logo from './logo.svg';
import './App.scss';
import LandingContainer from './components/landing/LandingContainer';
import TopNavContainer from './components/nav/TopNavContainer';
import BottomNav from './components/nav/BottomNav';
import 'react-toastify/dist/ReactToastify.css';

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
      <TopNavContainer/>
      <LandingContainer/>
      <BottomNav/>
      </div>
    </Router>
  );
}

export default App;
