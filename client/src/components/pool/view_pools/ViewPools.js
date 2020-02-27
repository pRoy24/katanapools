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
  
  setSelectedPool (selectedPool) {
    console.log(selectedPool);
  }
  render() {
    const {poolData} = this.props;
    const self = this;
    let poolDataList = <span/>;
    
    if (poolData.length === 0) {
      poolDataList =  <FontAwesomeIcon icon={faSpinner} size="lg" rotation={270} pulse/>
    } else {
      poolDataList = <ListGroup>
        <ListGroupItem>
              Symbol
        </ListGroupItem>
       {
         poolData.map(function(poolRow){
           return <ListGroupItem onClick={self.setSelectedPool.bind(self, poolRow)}>

              {poolRow.symbol}

           </ListGroupItem>
         })
       }
      </ListGroup>
    }
    return (
      <div className="app-toolbar-container ">
        
        <Row>
        <Col lg={2}>
        {poolDataList}
        </Col>
        <Col lg={10}>
          
        </Col>
        
        
        </Row>
      </div>
      )
  }
}