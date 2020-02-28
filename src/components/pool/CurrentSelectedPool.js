import React, {Component} from 'react';
import {Row, Col, Button} from 'react-bootstrap';
import {isEmptyObject} from '../../utils/ObjectUtils';

export default class CurrentSelectedPool extends Component {
  componentWillReceiveProps(nextProps) {
    const {selectedPool} = nextProps;
    if (this.props.selectedPool.symbol !== selectedPool.symbol) {
     
    }
  }
  

  render() {
    const {selectedPool} = this.props;
    let selectionCard = <span/>;
    
    if (isEmptyObject(selectedPool)) {
      selectionCard =  <div>Loading</div>;
    } else {
      selectionCard = (
        <Row>
        <Col lg={4}>
         {selectedPool.name} 
        </Col>
        <Col lg={4}>
          Symbol: {selectedPool.symbol}
        </Col>
        <Col lg={4}>
          <Button>Join pool</Button>
        </Col>
        </Row>
        )
    }
    return (
      <div className="current-selection-card">
        {selectionCard}
      </div>

      )
  }
}