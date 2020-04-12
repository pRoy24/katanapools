import React, {Component} from 'react';
import {Form, Button, Container, Row, Col, Alert, InputGroup, ButtonGroup,
        ListGroup, ListGroupItem, Tooltip, OverlayTrigger} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

export default class Step3 extends Component {
  constructor(props) {
    super(props);
    this.state = {detailsVisible: false};
  }
  
  toggleDetailsBox = () => {
    this.setState({detailsVisible: !this.state.detailsVisible});
  }
  render() {
    const {detailsVisible} = this.state;
    const {isCreationStepPending} = this.props;
    
    let transactionDetails = <span/>;
    if (detailsVisible) {
     transactionDetails = (
      <div>
        <div>1 Transaction to transfer pool ownership to converter</div>
        <div>1 Transaction for converter to accept pool ownership</div>
        <div>1 Transaction to register your pool converter with converter registry.</div>
      </div>
      )
    }
    return (
      <Container className="activation-page-container">
        <Row>
          <Col lg={12}>
            <div className="h5 activation-heading">Your pool is now ready to be activated !!</div>
            <div>
            <div className="activation-text">In order to activate the liquidity pool-</div>
            <div className="activation-text">You need to transfer pool ownership to the converter</div>
            <div className="activation-text">The converter contract needs to accept ownership of the pool</div>
            <div className="activation-text">The converter contract needs to be added to the converter registry</div>

            </div>
          </Col>
        </Row>
        <Row>
        <Col lg={4} className="left-align-text">
          <Button onClick={this.props.activatePool} className="pool-activation-btn" disabled={isCreationStepPending}>Activate your pool</Button>
        </Col>
        <Col lg={8}>
          <div className="sub-text step-3-sub">
            <div className="subtext-label">On clicking next you will be required to perform 3 transactions.</div>
            <div onClick={this.toggleDetailsBox} className="details-bar">Details <FontAwesomeIcon icon={faChevronDown}/></div>
            <div>
              {transactionDetails}
            </div>
          </div>
        </Col>
        </Row>
      </Container>
      )
  }
}