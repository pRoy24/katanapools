import React, {Component} from 'react';
import {Navbar,Nav } from 'react-bootstrap';
import {Link} from 'react-router-dom';
import './nav.scss';

export default class TopNav extends Component {
  render() {
    return (
      <div>
      <Navbar  expand="lg" className="app-top-nav">
  <Navbar.Brand href="#home">Katana</Navbar.Brand>
  <Navbar.Toggle aria-controls="basic-navbar-nav" />
  <Navbar.Collapse id="basic-navbar-nav">
    <Nav className="mr-auto">
      <Nav.Link>
        <Link to="/swap">Swap tokens</Link>
      </Nav.Link>
      <Nav.Link>
      <Link to="/pool">
        View pools
      </Link>
      </Nav.Link>
            <Nav.Link>
        <Link to="/relay">
        Create pool
        </Link>
      </Nav.Link>
  
            <Nav.Link>
        <Link to="/relay">
        My pools
        </Link>
      </Nav.Link>      
    </Nav>
  </Navbar.Collapse>
</Navbar>
      </div>
      )
  }
}