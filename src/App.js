import React from 'react';
import './App.scss';
import LandingContainer from './components/landing/LandingContainer';
import TopNavContainer from './components/nav/TopNavContainer';
import BottomNav from './components/nav/BottomNav';

import {
  BrowserRouter as Router,
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
