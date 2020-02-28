import React, {Component} from 'react';
import './nav.scss';
import {Container, Row, Col} from 'react-bootstrap';

export default class BottomNav extends Component {
  render() {
    return (
      <Container fluid className="bottom-nav">
        <Row>
        <Col lg={2}></Col>
          <Col lg={8}  xs={12} className="app-disclaimer-container">
            App is currently in Alpha, Please use with caution. 
            Switch to Ropsten network for testing.
          </Col>
          <Col lg={2} className="powered-by-container" xs={12}>
            Powered by <a href="https://www.bancor.network/" target="_blank">Bancor protocol</a>
          </Col>
        </Row>
      </Container>
      )
  }
}