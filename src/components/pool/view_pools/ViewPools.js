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
    this.state = {poolData: []};
  }
  filterInputList = (searchVal) => {
    const searchString = searchVal && searchVal.length > 0 ?searchVal.toLowerCase() : '';
    const {poolData} = this.state;
    let filteredPoolData = [];
    if (searchString && searchString.length > 0 && poolData.length > 0){
     filteredPoolData = poolData.filter(function(item){
      return item.symbol.toLowerCase().includes(searchString) || item.name.toLowerCase().includes(searchString)
    });
    } else {
       filteredPoolData = this.props.smartTokensWithReserves;
    }
    this.setState({poolData: filteredPoolData});
  }
  componentWillMount() {
    const {smartTokensWithReserves} = this.props;
    this.setState({poolData: smartTokensWithReserves});
  }
  componentWillUnmount() {
    this.setState({poolData: [], })
  }
  componentWillReceiveProps(nextProps) {
    const {smartTokensWithReserves} = nextProps;

    if (nextProps.smartTokensWithReserves.length > 0 && nextProps.smartTokensWithReserves.length !== this.props.smartTokensWithReserves.length) {
      this.setState({poolData: smartTokensWithReserves});
    }
  }
  render() {
    const {poolData} = this.state;
    return (
      <div>
        <ViewPoolToolbar filterInputList={this.filterInputList}/>
        <ViewPoolWidget {...this.props} poolData={poolData}/>
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
    const {poolData} = nextProps;
    
    if (isEmptyArray(this.props.poolData) && isNonEmptyArray(poolData)) {
      
          let selectedPoolIndex = poolData.findIndex(function(item){
            return item.symbol === 'ETHBNT';
          });
          if (selectedPoolIndex !== -1) {
            this.setState({selectedPoolIndex: selectedPoolIndex});
            this.props.getPoolDetails(poolData[selectedPoolIndex]);
          }
    }
  }
  
  render() {
    const { pool: {currentSelectedPool}, poolData} = this.props;

    const {selectedPoolIndex} = this.state;
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
        <Row style={{'marginBottom': '40px'}}>
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