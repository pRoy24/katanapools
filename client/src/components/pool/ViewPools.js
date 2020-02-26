import React, {Component} from 'react';
import ViewPoolToolbar from './ViewPoolToolbar';
import { faArrowLeft, faArrowRight,  faChevronCircleDown, faSpinner } from '@fortawesome/free-solid-svg-icons';
import {ListGroupItem, ListGroup, Row, Col, Button} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default class ViewPool extends Component {
  render() {
    return (
      <div>
        <ViewPoolToolbar/>
        <ViewPoolList {...this.props}/>
      </div>
      )
  }
}

class ViewPoolList extends Component {
  render() {
    const {poolData} = this.props;

    let poolDataList = <span/>;
    
    if (poolData.length === 0) {
      poolDataList =  <FontAwesomeIcon icon={faSpinner} size="lg" rotation={270} pulse/>
    } else {
      poolDataList = <ListGroup>
        <ListGroupItem>
          <Row>
            <Col lg={2}>
              Symbol
            </Col>
            <Col lg={2}>
              Name
            </Col>
            <Col lg={1}>
              24hr volume
            </Col>
            <Col lg={1}>
              Latest price
            </Col>
            <Col lg={2}>
             Holdings
            </Col>
            <Col lg={1}>
              Add liquidity
            </Col>
            <Col lg={1}>
              Remove liquidity
            </Col>
          </Row>
        </ListGroupItem>
       {
         poolData.map(function(poolRow){
           return <ListGroupItem>
           <Row>
            <Col lg={2}>
              {poolRow.symbol}
            </Col>
            <Col lg={2}>
             {poolRow.name}
            </Col> 
            <Col lg={1}>
              
            </Col>
            <Col lg={1}>
             
            </Col>
            <Col lg={2}>
            
            </Col>
            <Col lg={2}>
            
            </Col>
            <Col lg={2}>
             <Button>Add liquidity</Button>
            </Col>
           </Row>
           </ListGroupItem>
         })
       }
      </ListGroup>
    }
    return (
      <div className="app-toolbar-container ">
        {poolDataList}
      </div>
      )
  }
}