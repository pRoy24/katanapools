import React, {Component} from 'react';
import ViewPoolToolbar from './ViewPoolToolbar';
import { faArrowLeft, faArrowRight,  faChevronCircleDown, faSpinner } from '@fortawesome/free-solid-svg-icons';
import {ListGroupItem, ListGroup, Row, Col, Button} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SelectedPool from './SelectedPool';
import {isNonEmptyObject, isEmptyArray, isNonEmptyArray} from '../../../utils/ObjectUtils';

export default class ViewPool extends Component {
  constructor(props) {
    super(props);
    this.state = {smartTokensWithReserves: []};
  }
  filterInputList = (searchVal) => {

    const searchString = searchVal && searchVal.length > 0 ?searchVal.toLowerCase() : '';
    const {smartTokensWithReserves} = this.state;
    let filteredPoolData = [];
    if (searchString && smartTokensWithReserves.length > 0){
     filteredPoolData = smartTokensWithReserves.filter(function(item){
      return item.symbol.toLowerCase().includes(searchString) || item.name.toLowerCase().includes(searchString)
    });
    } else {
       filteredPoolData = this.props.smartTokensWithReserves;
    }
    this.setState({smartTokensWithReserves: filteredPoolData});
  }
  componentWillReceiveProps(nextProps) {
    const {smartTokensWithReserves} = nextProps;

    if (nextProps.smartTokensWithReserves && nextProps.smartTokensWithReserves.length !== this.props.smartTokensWithReserves.length) {
    //  this.setState({smartTokensWithReserve: smartTokensWithReserves});
    }
  }
  render() {
    return (
      <div>
        <ViewPoolToolbar filterInputList={this.filterInputList}/>
        <ViewPoolWidget {...this.props}/>
      </div>
      )
  }
}

class ViewPoolWidget extends Component {
  constructor(props) {
    super(props);
    this.state = {selectedPoolIndex: -1};
  }

  setSelectedPool (selectedPool, idx) {
    this.props.getPoolDetails(selectedPool);
    this.setState({selectedPoolIndex: idx});
  }
  
  componentWillReceiveProps(nextProps) {
    const {smartTokensWithReserves} = nextProps;
    
    if (isEmptyArray(this.props.smartTokensWithReserves) && isNonEmptyArray(smartTokensWithReserves)) {
      
          let selectedPoolIndex = smartTokensWithReserves.findIndex(function(item){
            return item.symbol === 'ETHBNT';
          });
          if (selectedPoolIndex === -1) {
            selectedPoolIndex = 0;
          }
          this.setState({selectedPoolIndex: selectedPoolIndex});
          this.props.getPoolDetails(smartTokensWithReserves[selectedPoolIndex]);
    }
  }
  
  render() {
    const { pool: {currentSelectedPool}, smartTokensWithReserves} = this.props;

    const {selectedPoolIndex} = this.state;
    const self = this;
    let poolDataList = <span/>;
    if (smartTokensWithReserves.length === 0) {
      poolDataList =  <span/>;
    } else {
      poolDataList = 
      <span>
        <ListGroupItem>
              Symbol
        </ListGroupItem>
       {
         smartTokensWithReserves.map(function(poolRow, idx){
         let cellActive = '';
         if (idx === selectedPoolIndex) {
           cellActive = 'cell-active';
         }
           return <ListGroupItem onClick={self.setSelectedPool.bind(self, poolRow, idx)} key={'pool-select-'+idx} className={`select-pool-toolbar ${cellActive}`}>
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
        <Row >
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