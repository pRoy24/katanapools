import React, {Component} from 'react';
import ViewPoolToolbar from './ViewPoolToolbar';
import { faSpinner, faTimes } from '@fortawesome/free-solid-svg-icons';
import {ListGroupItem, ListGroup, Row, Col, Alert} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SelectedPool from './SelectedPool';
import SelectedV2PoolContainer from './SelectedV2PoolContainer';
import {withRouter} from 'react-router-dom'
import {isNonEmptyObject, isEmptyArray, isNonEmptyArray, isEmptyObject} from '../../../utils/ObjectUtils';

class ViewPool extends Component {
  constructor(props) {
    super(props);
    this.state = {poolData: [], poolSymbol: ''};
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
    const {smartTokensWithReserves, location} = this.props;
    let poolSymbol = "ETHBNT";
    if (location && location.pathname) {
      const poolSymbolTokens = location.pathname.split("/pool/view/");
      if (poolSymbolTokens && poolSymbolTokens.length > 1) {
        poolSymbol = poolSymbolTokens[1].trim();
      }
    }

    this.setState({poolData: smartTokensWithReserves, poolSymbol: poolSymbol});
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

  getPoolDataByView = (smartTokenList) => {
    const {pool: {currentViewPoolType}} = this.props;
    console.log(smartTokenList);
    console.log('&&&&');
    if (currentViewPoolType === 'all') {
      return smartTokenList;
    }
  }
  getPoolDetailsPage = (selectedPool) => {
    const {history} = this.props;
    history.replace(`/pool/view/${selectedPool.symbol}`);
    this.props.getPoolDetails(selectedPool);
  }
  render() {
    const {poolData, poolSymbol} = this.state;
    const {pool: {currentViewPoolType}} = this.props;
    return (
      <div>
        <ViewPoolToolbar filterInputList={this.filterInputList} setPoolTypeSelected={this.props.setPoolTypeSelected}
        currentViewPoolType={currentViewPoolType}/>
        <ViewPoolWidget {...this.props} poolData={poolData} poolSymbol={poolSymbol} getPoolDetailsPage={this.getPoolDetailsPage}/>
      </div>
      )
  }
}


export default withRouter(ViewPool);

class ViewPoolWidget extends Component {
  constructor(props) {
    super(props);
    this.state = {selectedPoolIndex: -1, isError: false, errorMessage: ''};
  }

  componentWillMount() {
    const {poolData, poolSymbol} = this.props;

    if (isNonEmptyArray(poolData)) {
          let selectedPoolIndex = poolData.findIndex(function(item){
            return item.symbol.toLowerCase() === poolSymbol.toLowerCase();
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
    this.props.getPoolDetailsPage(selectedPool);
    this.setState({selectedPoolIndex: idx});

  }

  componentWillReceiveProps(nextProps) {
    const {poolData, poolSymbol, pool: {currentSelectedPool, poolApproval, poolRevocation}} = nextProps;

    if (isEmptyArray(this.props.poolData) && isNonEmptyArray(poolData)) {
          let selectedPoolIndex = poolData.findIndex(function(item){
            return item.symbol.toLowerCase() === poolSymbol.toLowerCase();
          });
          if (selectedPoolIndex !== -1) {
            this.setState({selectedPoolIndex: selectedPoolIndex});
            this.props.getPoolDetails(poolData[selectedPoolIndex]);
          }
    }

    const web3 = window.web3;
    if (web3 && web3.currentProvider) {
    if (isEmptyObject(this.props.pool.currentSelectedPool) && isNonEmptyObject(nextProps.pool.currentSelectedPool)) {
      this.props.fetchUserPoolDetails(currentSelectedPool);
    }

    if (poolApproval === 'success' && this.props.pool.poolApproval === 'init') {
      this.props.fetchUserPoolDetails(currentSelectedPool);      
    }
    if (poolRevocation === 'success' && this.props.pool.poolRevocation === 'init') {
       this.props.fetchUserPoolDetails(currentSelectedPool);        
    }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const {pool: {poolTransactionStatus}, poolData, pool} = this.props;
    const {selectedPoolIndex} = this.state;
    const currentPoolRow = poolData[selectedPoolIndex];
    if (prevProps.pool.poolTransactionStatus.type === 'pending' && poolTransactionStatus.type === 'success') {
      this.props.getPoolDetails(currentPoolRow);
    }
  }

  render() {
    const { pool: {currentSelectedPool, poolTransactionStatus, currentViewPoolType}, poolData} = this.props;
     let poolSelectionView = poolData;
     
     if (currentViewPoolType === 'all') {
       poolSelectionView = poolData;
     } else if (currentViewPoolType === 'v1') {
       poolSelectionView = poolData.filter((pool) => (pool.poolVersion === '1'));
     } else {
       poolSelectionView = poolData.filter((pool) => (pool.poolVersion === '2'));
     }
    const {selectedPoolIndex, isError, errorMessage} = this.state;
    const self = this;
    let poolDataList = <span/>;
    if (poolSelectionView.length === 0) {
      poolDataList =  <span/>;
    } else {
      poolDataList =
      <span>
        <ListGroupItem>
          Symbol
        </ListGroupItem>
       {
         poolSelectionView.map(function(poolRow, idx){
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
      selectedPool  =  <SelectedPool {...this.props} currentSelectedPool={currentSelectedPool} setErrorMessage={this.setErrorMessage} resetErrorMessage={this.resetErrorMessage}/>
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
    if (poolTransactionStatus.type === 'error') {
      transactionStatusMessage = <Alert  variant={"danger"}>
              <FontAwesomeIcon icon={faTimes}/> {poolTransactionStatus.message}
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