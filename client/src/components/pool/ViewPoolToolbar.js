import React, {Component} from 'react';
import {Container, Row, Col} from 'react-bootstrap';

export default class ViewPoolToolbar extends Component {
  render() {
    return (
      <div>
      <Row className="toolbar-row">
        <Col lg={8}>
              <div className="h5">View pools</div>
        </Col>
        <Col lg={2}>
            BNT
        </Col>
        <Col lg={2}>
            USDB
        </Col>
      </Row>
      </div>
      
      )
  }
}