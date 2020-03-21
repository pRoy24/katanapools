import React, {Component} from 'react';
import {Form, Button, Container, Row, Col, Alert, InputGroup, ButtonGroup,
        ListGroup, ListGroupItem, Tooltip, OverlayTrigger} from 'react-bootstrap';
import Stepper, { Step } from "react-material-stepper";
import {
  StepperAction,
  StepperContent,
  StepperContext
} from "react-material-stepper";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {  faPlus, faSpinner, faTimes, faQuestionCircle } from '@fortawesome/free-solid-svg-icons'

export default class Step1 extends Component {
  constructor(props) {
    super(props);
    this.state = {poolName: '', poolSymbol: '', poolDecimals: 18, txMsg: {}}
  }

  onSubmit = (e) => {
    e.preventDefault();
    const self = this;
    this.props.deployPoolContract(this.state);
  }

  formNameChanged = (evt) => {
    this.setState({poolName: evt.target.value});
  }

  formSymbolChanged = (evt) => {
    this.setState({poolSymbol: evt.target.value});
  }

  formDecimalsChanged = (evt) => {
    this.setState({poolDecimals: 18});
  }
  render() {
    const {poolName, poolSymbol, poolDecimals} = this.state;
    const {isFetching} = this.props;

function renderNameTooltip(props) {
  return <Tooltip {...props} className="wizard-tooltip">
    <div className="wizard-tooltip-text">
    <div>Pool name should be descriptive of the pool reserves to allow for easy searching and indexing.</div>
    <div>For instance, a pool name like Link Bat Smart Relay Token could refer to a pool with LINK, BAT, BNT in a 33/33/33 reserve ratio.</div>
    </div>
    </Tooltip>;
}


function renderSymbolTooltip(props) {
  return <Tooltip {...props} className="wizard-tooltip">
    <div className="wizard-tooltip-text">
    <div>Pool symbol should contain the symbols of pool reserves to allow for easy searching and indexing.</div>
    <div>For instance, a pool symbol like LINKBATBNT could refer to a pool with LINK, BAT, BNT in a 33/33/33 reserve ratio.</div>
    </div>
    </Tooltip>;
}

function renderDecimalTooltip(props) {
  return <Tooltip {...props} className="wizard-tooltip">
    <div className="wizard-tooltip-text">
    <div>Decimal precision of pool token.</div>
    <div>The standard is 18 for most ERC20 tokens.</div>
    <div>If you are unsure of what value to enter leave it at 18.</div>
    </div>
    </Tooltip>;
}
    return (
      <div className="create-pool-form-container">

      <div className="create-form-container">
         <Container>
        <Form onSubmit={this.onSubmit}>
        <Form.Group controlId="formBasicEmail">
          <Form.Label>
            Pool Name
            <OverlayTrigger
              placement="top"
              delay={{ show: 250, hide: 400 }}
              overlay={renderNameTooltip}>
              <FontAwesomeIcon icon={faQuestionCircle} className="info-tooltip-btn"/>
            </OverlayTrigger>
          </Form.Label>
          <Form.Control type="text" placeholder="name" onChange={this.formNameChanged} value={poolName}/>
          <Form.Text className="text-muted" >
            Enter the pool name eg. XXX Smart Relay Token
          </Form.Text>
        </Form.Group>
        <Form.Group controlId="formBasicPassword">
          <Form.Label>Pool Symbol
              <OverlayTrigger
              placement="top"
              delay={{ show: 250, hide: 400 }}
              overlay={renderSymbolTooltip}>
              <FontAwesomeIcon icon={faQuestionCircle} className="info-tooltip-btn"/>
            </OverlayTrigger>
            </Form.Label>
          <Form.Control type="text" placeholder="symbol" value={poolSymbol} onChange={this.formSymbolChanged}/>
          <Form.Text className="text-muted" >
            Enter the pool symbol eg. XXXYYY for a pool with XXX and YYY reserves.
          </Form.Text>
        </Form.Group>
        <Form.Group controlId="formBasicPassword">
          <Form.Label>Pool Decimals
            <OverlayTrigger
              placement="top"
              delay={{ show: 250, hide: 400 }}
              overlay={renderDecimalTooltip}>
              <FontAwesomeIcon icon={faQuestionCircle} className="info-tooltip-btn"/>
            </OverlayTrigger>
          </Form.Label>
          <Form.Control type="text" placeholder="decimals" value={poolDecimals} onChange={this.formDecimalsChanged}/>
        </Form.Group>
        <Row>
        <Col lg={4}>
        <Button className="pool-wizard-submit-btn" variant="primary" type="submit" disabled={isFetching}>
          Next
        </Button>
        </Col>
        <Col lg={6}>

        </Col>
        </Row>
      </Form>
      </Container>
      </div>
      </div>)
  }
}