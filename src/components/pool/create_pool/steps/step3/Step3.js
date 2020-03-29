import React, {Component} from 'react';
import {Form, Button, Container, Row, Col, Alert, InputGroup, ButtonGroup,
        ListGroup, ListGroupItem, Tooltip, OverlayTrigger} from 'react-bootstrap';

export default class Step3 extends Component {
  render() {
    const {isCreationStepPending} = this.props;
    return (
      <Container className="activation-page-container">
        <Row>
          <Col lg={12}>
            <div className="h5 activation-heading">Your pool is now ready to be activated !!</div>
            <div>
            <div className="activation-text">In order to activate the liquidity pool - </div>
            <div className="activation-text">You need to transfer pool ownership to the converter</div>
            <div className="activation-text">The converter contract needs to accept ownership of the pool</div>
            <div className="activation-text">The converter contract needs to be added to the converter registry</div>

            </div>
          </Col>
        </Row>
        <Row>
        <Col lg={4}>
        <Button onClick={this.props.activatePool} className="pool-activation-btn" disabled={isCreationStepPending}>Activate your pool</Button>
        </Col>
        </Row>
      </Container>
      )
  }
}