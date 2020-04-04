import React, {Component} from 'react';
import ViewPoolToolbar from './ViewPoolToolbar';
import { faArrowLeft, faArrowRight,  faChevronCircleDown, faSpinner } from '@fortawesome/free-solid-svg-icons';
import {ListGroupItem, ListGroup, Row, Col, Button, Alert} from 'react-bootstrap';
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
    this.state = {selectedPoolIndex: -1, isError: false, errorMessage: ''};
  }

  componentWillMount() {
    const {poolData} = this.props;

    if (isNonEmptyArray(poolData)) {


          let selectedPoolIndex = poolData.findIndex(function(item){
            return item.symbol === 'ETHBNT';
          });
          if (selectedPoolIndex !== -1) {
            this.setState({selectedPoolIndex: selectedPoolIndex});
            this.props.getPoolDetails(poolData[selectedPoolIndex]);
          }
    }
  }

  setErrorMessage = (errorMessage) => {
    this.setState({isError: true, errorMessage: errorMessage});
  }

  resetErrorMessage = () => {
    this.setState({isError: false, errorMessage: ''});
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

  componentDidUpdate(prevProps, prevState) {
    const {pool: {poolTransactionStatus}, poolData} = this.props;
    const {selectedPoolIndex} = this.state;
    const currentPoolRow = poolData[selectedPoolIndex];
    if (prevProps.pool.poolTransactionStatus.type === 'pending' && poolTransactionStatus.type === 'success') {
      this.props.refetchPoolDetails(currentPoolRow);
    }
  }

  render() {
    const { pool: {currentSelectedPool, poolTransactionStatus}, poolData, } = this.props;

    const {selectedPoolIndex, isError, errorMessage} = this.state;
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
      selectedPool =  <SelectedPool {...this.props} setErrorMessage={this.setErrorMessage} resetErrorMessage={this.resetErrorMessage}/>
    }
    let transactionStatusMessage = <span/>;
    if (isError) {
      transactionStatusMessage = <Alert  variant={"danger"}>
              {errorMessage}
            </Alert>
    }
    if (poolTransactionStatus.type === 'pending') {
      transactionStatusMessage = <Alert  variant={"info"}>
              <FontAwesomeIcon icon={faSpinner} size="lg" rotation={270} pulse/> {poolTransactionStatus.message}
            </Alert>
    }
    return (
      <div>
              {transactionStatusMessage}
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
      </div>
      )
  }
}