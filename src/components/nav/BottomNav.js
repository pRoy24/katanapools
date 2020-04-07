import React, {Component} from 'react';
import './nav.scss';
import {Container, Row, Col} from 'react-bootstrap';

export default class BottomNav extends Component {
  render() {
    let appMessage = 'App is currently in public Beta, Please use with caution.';
    if (window.location.hostname === 'staging.katanapools.com') {
      appMessage = 'You are currently in Staging network. Please switch to Ropsten for testing';
    }
    return (
      <Container fluid className="bottom-nav">
        <Row>
        <Col lg={2}></Col>
          <Col lg={8}  xs={12} className="app-disclaimer-container">
            {appMessage}
          </Col>
          <Col lg={2} className="powered-by-container" xs={12}>
            Powered by <a href="https://www.bancor.network/" target="_blank">Bancor protocol</a>
          </Col>
        </Row>
      </Container>
      )
  }
}