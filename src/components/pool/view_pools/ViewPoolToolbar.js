import React, {Component} from 'react';
import {Container, Row, Col, Form} from 'react-bootstrap';

export default class ViewPoolToolbar extends Component {
  render() {
    return (
      <div>
      <Row className="toolbar-row">
        <Col lg={8}>
              <div className="h4 left-align-text">View pools</div>
        </Col>
        <Col lg={4}>
          <Form.Check type="checkbox" label="Only show my pool holdings" />
        </Col>  
      </Row>
      </div>
      
      )
  }
}