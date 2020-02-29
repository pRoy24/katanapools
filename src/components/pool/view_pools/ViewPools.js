import React, {Component} from 'react';
import ViewPoolToolbar from './ViewPoolToolbar';
import { faArrowLeft, faArrowRight,  faChevronCircleDown, faSpinner } from '@fortawesome/free-solid-svg-icons';
import {ListGroupItem, ListGroup, Row, Col, Button} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SelectedPool from './SelectedPool';
import {isNonEmptyObject, isEmptyArray, isNonEmptyArray} from '../../../utils/ObjectUtils';

export default class ViewPool extends Component {
  render() {
    return (
      <div>
        <ViewPoolToolbar/>
        <ViewPoolWidget {...this.props}/>
      </div>
      )
  }
}

class ViewPoolWidget extends Component {
  componentWillMount() {
    const {poolData} = this.props;
  }
  
  setSelectedPool (selectedPool) {
    this.props.getPoolDetails(selectedPool);
  }
  
  componentWillReceiveProps(nextProps) {
    const {poolData} = nextProps;
    
    if (isEmptyArray(this.props.poolData) && isNonEmptyArray(poolData)) {
      
          let selectedPoolIndex = poolData.findIndex(function(item){
            return item.symbol === 'BNT-USD';
          });
          if (selectedPoolIndex === -1) {
            selectedPoolIndex = 0;
          }
          this.props.getPoolDetails(poolData[selectedPoolIndex]);
    }
  }
  
  render() {
    const {poolData, pool: {currentSelectedPool}} = this.props;
    const self = this;
    let poolDataList = <span/>;
    
    if (poolData.length === 0) {
      poolDataList =  <span/>;
    } else {
      poolDataList = 
      <span>
        <ListGroupItem>
              Symbol
        </ListGroupItem>
       {
         poolData.map(function(poolRow, idx){
           return <ListGroupItem onClick={self.setSelectedPool.bind(self, poolRow)} key={'pool-select-'+idx}>
              {poolRow.symbol}
           </ListGroupItem>
         })
       }</span>
   
    }
    let selectedPool =  (<div className="loading-spinner">
                          <FontAwesomeIcon icon={faSpinner} size="lg" rotation={270} pulse/>
                        </div>
                        )
    if (isNonEmptyObject(currentSelectedPool)) {
      selectedPool =  <SelectedPool {...this.props}/>
    }
    return (
      <div className="app-toolbar-container">
        <Row>
        <Col lg={2}>
        <ListGroup className="select-pool-group">
          {poolDataList}
        </ListGroup>
        </Col>
        <Col lg={10}>
          {selectedPool}
        </Col>
        </Row>
      </div>
      )
  }
}