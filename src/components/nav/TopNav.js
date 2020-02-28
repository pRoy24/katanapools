import React, {Component} from 'react';
import {Navbar,Nav, NavItem } from 'react-bootstrap';
import {Link} from 'react-router-dom';
import './nav.scss';
import { LinkContainer } from 'react-router-bootstrap';

export default class TopNav extends Component {
  render() {
    return (
      <div>
      <Navbar  expand="lg" className="app-top-nav">
  <Navbar.Brand href="/swap">Katana</Navbar.Brand>
  <Navbar.Toggle aria-controls="basic-navbar-nav" />
  <Navbar.Collapse id="basic-navbar-nav">
    <Nav className="mr-auto">
      <LinkContainer to="/swap">
        <NavItem key={1}>Swap tokens</NavItem>
      </LinkContainer>
    <LinkContainer to="/pool/view">
    <NavItem key={2}>View pools</NavItem>
  </LinkContainer>
        <LinkContainer to="/pool/create">
    <NavItem key={3}>Create pool</NavItem>
  </LinkContainer>
    </Nav>
  </Navbar.Collapse>
</Navbar>
      </div>
      )
  }
}