import React, {Component} from 'react';
import {Row, Col, Form} from 'react-bootstrap';
export default class SwapTokenToolbar extends Component {
  
  constructor() {
    super();
    this.state = {smartTokenCheck: false, convertibleTokenCheck: true}
  } 
  
  converibleTokenToggle = (evt) => {
    this.setState({convertibleTokenCheck: !this.state.convertibleTokenCheck})
  }
  
  smarttokenToggle = (evt) => {
    this.setState({smartTokenCheck: !this.state.smartTokenCheck})
  }
  
  componentDidUpdate(prevProps, prevState, snapshot) {
    const {smartTokenCheck, convertibleTokenCheck} = this.state;
    if (smartTokenCheck !== prevState.smartTokenCheck || convertibleTokenCheck !== prevState.convertibleTokenCheck) {
      this.props.refetchTokenList(smartTokenCheck, convertibleTokenCheck); 
    }
  }
  render() {
    const {smartTokenCheck, convertibleTokenCheck} = this.state;
    return (
      <div>
      <Row className="toolbar-row">
        <Col lg={8} >
          <div className="h4 left-align-text">Swap Tokens</div>
        </Col>
        <Col lg={2} className="toolbar-options-check">
          <Form.Check type="checkbox" label="Convertible Tokens" onChange={this.converibleTokenToggle} checked={convertibleTokenCheck}/>
        </Col>
        <Col lg={2} className="toolbar-options-check">
          <Form.Check type="checkbox" label="Smart Tokens" onChange={this.smarttokenToggle} checked={smartTokenCheck}/>
        </Col>
      </Row>
      </div>
      )
  }
}