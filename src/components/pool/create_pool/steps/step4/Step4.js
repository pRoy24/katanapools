import React, {Component} from 'react';
import {Form, Button, Container, Row, Col, Alert, InputGroup, ButtonGroup,
        ListGroup, ListGroupItem, Tooltip, OverlayTrigger} from 'react-bootstrap';

export default class Step4 extends Component {
  render() {
    return (
      <Container>
        <Row>
          <Col lg={12}>
            <div className="h5 activation-heading">Your pool is now ready to be activated !!</div>
            <div>
            <div className="activation-text">In order to activate the liquidity pool - </div>
            <div className="activation-text">You need to transfer pool ownership to the converter</div>
            <div className="activation-text">The converter contract needs to accept ownership of the pool</div>
            <div className="activation-text">The converter contract needs to be added to the converter registry</div>
            <div className="activation-sub-text">Click below to activate your pool now.</div>
            </div>
          </Col>
        </Row>
        <Button onClick={this.props.activatePool} className="pool-activation-btn">Activate your pool</Button>
      </Container>
      )
  }
}