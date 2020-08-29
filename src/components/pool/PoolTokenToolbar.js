import React, {Component} from 'react';
import {Row, Col, Button} from 'react-bootstrap';
import Autosuggest from 'react-autosuggest';

export default class PoolTokenToolbar extends Component {
  render() {
    return (
      <Row className="toolbar-row">
        <Col lg={4}>
          <SelectContract/>
        </Col>
        <Col lg={4}>
          <SelectBase/>
        </Col>
        <Col lg={2}>
          <Button>My pools</Button>
        </Col>
        <Col lg={2}>
          <Button onClick={()=>this.props.setCurrentView('create')}>Create new pool</Button>
        </Col>        
      </Row>
      )
  }
}

class SelectContract extends Component {
  render() {
    return (
      <div>
      
      </div>
      )
  }
}

class SelectBase extends Component {
  render() {
    return (
      <div>
        <select></select>
      </div>
      )
  }
}

