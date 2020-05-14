import React, {Component} from 'react';
import {Container, Row, Col, Form, Button, Alert, Tooltip, OverlayTrigger, Dropdown, DropdownButton, ButtonGroup} from 'react-bootstrap';
import AddressDisplay from '../../common/AddressDisplay';
import {toDecimals, fromDecimals} from '../../../utils/eth';
import {isEmptyString, isEmptyArray, isNonEmptyArray} from '../../../utils/ObjectUtils';
import {VictoryChart, VictoryLine, VictoryAxis} from 'victory';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {  faPlus, faChevronDown, faTimes, faQuestionCircle } from '@fortawesome/free-solid-svg-icons'
import {getTokenConversionPath, getTokenConversionAmount, getTokenWithdrawConversionAmount} from '../../../utils/ConverterUtils';

const BigNumber = require('bignumber.js');
const Decimal = require('decimal.js');
export default class SelectedPool extends Component {
  constructor(props) {
    super(props);
    this.state= {fundAmount: 0, liquidateAmount: 0, reserve1Needed: 0, reserve2Needed: 0,
      fundAllReservesActive: 'reserve-active', fundOneReserveActive: '',
      singleTokenFundReserveSelection: '', singleTokenFundReserveAmount: 0, singleTokenFundConversionPaths: [],
      
      singleTokenWithdrawReserveSelection: '', singleTokenWithdrawReserveAmount: 0, singleTokenWithdrawConversionPaths: [],
      withdrawOneReserveActive: '', withdrawAllReservesActive: 'reserve-active',
      singleTokenWithdrawReserveSelection: '', singleTokenWithdrawReserveAmount: '',  approvalDisplay: false    
      
    }
  }

  onFundInputChanged = (evt) => {
    let inputFund = evt.target.value;
    this.calculateFundingAmount(inputFund);
    this.setState({fundAmount: inputFund});
  }

  onLiquidateInputChanged = (evt) => {
    let inputFund = evt.target.value;
    this.calculateLiquidateAmount(inputFund);
    this.setState({liquidateAmount: inputFund});
  }

  calculateLiquidateAmount = (inputFund) => {
    const {pool: {currentSelectedPool}} = this.props;
    if (!isNaN(inputFund) && parseFloat(inputFund) > 0) {
      const totalSupply = new BigNumber(fromDecimals(currentSelectedPool.totalSupply, currentSelectedPool.decimals));
      const removeSupply = new BigNumber(inputFund);
      const pcDecreaseSupply = removeSupply.dividedBy(totalSupply);
      const currentReserves = currentSelectedPool.reserves;

      const reservesAdded = currentReserves.map(function(item){
        const currentReserveSupply = new BigNumber(item.reserveBalance);
        const currentReserveAdded = pcDecreaseSupply.multipliedBy(currentReserveSupply);
        const currentReserveAddedMin = toDecimals(currentReserveAdded.toFixed(6), item.decimals);
        const currentReserveAddedDisplay = currentReserveAdded.toPrecision(6, 0);
        return Object.assign({}, item, {addedMin: currentReserveAddedMin, addedDisplay: currentReserveAddedDisplay});
      });
      this.setState({reservesAdded: reservesAdded});
    }
  }

  calculateFundingAmount = (inputFund) => {
    const {pool: {currentSelectedPool}} = this.props;
    if (!isNaN(inputFund) && parseFloat(inputFund) > 0) {
      const totalSupply = new Decimal(fromDecimals(currentSelectedPool.totalSupply, currentSelectedPool.decimals));
      const addSupply = new Decimal(inputFund);
      const pcIncreaseSupply = addSupply.dividedBy(totalSupply);

      const currentReserves = currentSelectedPool.reserves;
      const reservesNeeded = currentReserves.map(function(item){
        const currentReserveSupply = new Decimal(item.reserveBalance);
        const currentReserveNeeded = pcIncreaseSupply.times(currentReserveSupply);
        const currentReserveNeededMin = toDecimals(currentReserveNeeded.toFixed(2, Decimal.ROUND_UP), item.decimals);

        const currentReserveNeededDisplay = currentReserveNeeded.toFixed(6, Decimal.ROUND_UP);
        return Object.assign({}, item, {neededMin: currentReserveNeededMin, neededDisplay: currentReserveNeededDisplay});
      });
      this.setState({reservesNeeded: reservesNeeded});
    }
  }


  submitBuyPoolToken = () => {

    const {fundAmount, reservesNeeded} = this.state;
    const {pool: {currentSelectedPool}} = this.props;
    const self = this;
    const args = {poolTokenProvided: toDecimals(fundAmount, currentSelectedPool.decimals),
    reservesNeeded: reservesNeeded, converterAddress: currentSelectedPool.converter};

    let isError = false;
    const web3 = window.web3;

    const currentWalletAddress = web3.currentProvider ? web3.currentProvider.selectedAddress : '';
    if (isEmptyString(currentWalletAddress)) {
      isError = true;
      self.props.setErrorMessage(`You need to connect a web3 provider to make this transction.`);
    }
    else if (reservesNeeded.length > 0) {
      reservesNeeded.forEach(function(reserveItem){
        const amountNeeded = new Decimal(reserveItem.neededDisplay);
        const amountAvailable = new Decimal(reserveItem.userBalance);
        if (amountNeeded.greaterThan(amountAvailable)) {
          isError = true;
          self.props.setErrorMessage(`User balance for ${reserveItem.symbol} is less than needed amount of ${reserveItem.neededDisplay}`);
        }
      })
    }
    if (!isError) {
      this.props.resetErrorMessage();
      this.props.submitPoolBuy(args);
    }
  }

  submitSellPoolToken = () => {
    const {pool: {currentSelectedPool}} = this.props;
    const self = this;
    const existingPoolTokenBalance = fromDecimals(currentSelectedPool.senderBalance, currentSelectedPool.decimals);
    const {liquidateAmount, reservesAdded} = this.state;
    const args = {poolTokenSold: toDecimals(liquidateAmount, currentSelectedPool.decimals),
    reservesAdded: reservesAdded, converterAddress: currentSelectedPool.converter,
      'poolAddress': currentSelectedPool.address
    };
    let isError = false;

    const web3 = window.web3;

    const currentWalletAddress = web3.currentProvider ? web3.currentProvider.selectedAddress : '';
    if (isEmptyString(currentWalletAddress)) {
      isError = true;
      self.props.setErrorMessage(`You need to connect a web3 provider to make this transction.`);
    }

    if(parseFloat(liquidateAmount) > parseFloat(existingPoolTokenBalance)) {
      isError = true;
      this.props.setErrorMessage(`User balance for ${currentSelectedPool.symbol} is less than needed amount of ${liquidateAmount}`);
    }

    if (!isError){
      this.props.resetErrorMessage();
      this.props.submitPoolSell(args);
    }
  }
  
  calculateFundingAmountWithOneReserve = (inputFund) => {
    const {pool: {currentSelectedPool}} = this.props;  
    const self = this;
    const {singleTokenFundReserveSelection} = this.state;
    const currentReserves = currentSelectedPool.reserves;
    const singleReserveSelection = singleTokenFundReserveSelection.symbol;
    const totalSupply = new Decimal(fromDecimals(currentSelectedPool.totalSupply, currentSelectedPool.decimals));
    const addSupply = new Decimal(inputFund);
    const pcIncreaseSupply = addSupply.dividedBy(totalSupply);

    let selectedBaseReserve = currentSelectedPool.reserves.find(function(item){
      if (item.symbol === singleReserveSelection) {
        return item;
      }
    })
      let currentReserveSupply = new Decimal(selectedBaseReserve.reserveBalance);
      const currentReserveNeeded = pcIncreaseSupply.times(currentReserveSupply);
      const currentReserveNeededMin = toDecimals(currentReserveNeeded.toFixed(2, Decimal.ROUND_UP), selectedBaseReserve.decimals);

      const currentReserveNeededDisplay = currentReserveNeeded.toFixed(6, Decimal.ROUND_UP).toString();
      const baseReserveAmountMin = currentReserveNeededMin;
      const baseReserveNeeded = currentReserveNeededDisplay;

    let reservesNeeded = [];
    
    let reservesMap = currentReserves.map(function(reserveItem){
      if (reserveItem.symbol === singleReserveSelection) {
        let currentReserveSupply = new Decimal(reserveItem.reserveBalance);
        const currentReserveNeeded = pcIncreaseSupply.times(currentReserveSupply);
        const currentReserveNeededMin = toDecimals(currentReserveNeeded.toFixed(2, Decimal.ROUND_UP), reserveItem.decimals);
        const currentReserveNeededDisplay = currentReserveNeeded.toFixed(6, Decimal.ROUND_UP).toString();
        const payload = {path: null, totalAmount: currentReserveNeededMin, conversionAmount: currentReserveNeededMin,
        quantity: currentReserveNeededDisplay, token: reserveItem};
        
        reservesNeeded.push(Object.assign({}, reserveItem, {neededMin: currentReserveNeededMin, neededDisplay: currentReserveNeededDisplay}));
            
        return new Promise((resolve, reject) => (resolve(payload)));
      } else {
        return getTokenConversionPath(selectedBaseReserve, reserveItem).then(function(conversionPath){
           let usePoolForConversion = false;
           if (conversionPath.indexOf(currentSelectedPool.address) !== -1) {
             usePoolForConversion = true;
           }
            
           let currentReserveNeededMin = 0;
           let currentReserveNeededDisplay = 0;

           // If pool is being used for conversion then supply will be decreased after conversion
           if (usePoolForConversion) {
            let currentReserveSupply = new Decimal(reserveItem.reserveBalance);
            let pc1 = pcIncreaseSupply.add(1);
             const currentReserveNeeded = (pcIncreaseSupply.times(currentReserveSupply)).dividedBy(pc1);
             
             currentReserveNeededMin = toDecimals(currentReserveNeeded.toFixed(4, Decimal.ROUND_UP), reserveItem.decimals);
             currentReserveNeededDisplay = currentReserveNeeded.toFixed(6, Decimal.ROUND_UP).toString();

           } else {
             let currentReserveSupply = new Decimal(reserveItem.reserveBalance);
             const currentReserveNeeded = pcIncreaseSupply.times(currentReserveSupply);
              currentReserveNeededMin = toDecimals(currentReserveNeeded.toFixed(2, Decimal.ROUND_UP), reserveItem.decimals);
              currentReserveNeededDisplay = currentReserveNeeded.toFixed(6, Decimal.ROUND_UP).toString();
           }

           return getTokenConversionAmount(conversionPath, currentReserveNeededDisplay, baseReserveNeeded).then(function(response){
            const responseAmount = fromDecimals(response, 18);
            let responseAmountDecimals = new Decimal(responseAmount);
            let amountNeeded = new Decimal(currentReserveNeededDisplay);

            let quantity = amountNeeded.dividedBy(responseAmountDecimals).toFixed(6, Decimal.ROUND_UP).toString();

            reservesNeeded.push(Object.assign({}, reserveItem, {neededMin: currentReserveNeededMin, neededDisplay: currentReserveNeededDisplay}));

            return {path: conversionPath, totalAmount: response, conversionAmount: currentReserveNeededMin,
                    quantity: quantity, token: reserveItem}
           });
        });
      }
    });
    
    Promise.all(reservesMap).then(function(response){
      self.setState({singleTokenFundConversionPaths: response, reservesNeeded: reservesNeeded});
    });

  }
  
  calculateLiquidateAmountWithOneReserve = (liquidateFund) => {
    const {pool: {currentSelectedPool}} = this.props;

    const totalSupply = new BigNumber(fromDecimals(currentSelectedPool.totalSupply, currentSelectedPool.decimals));
    const removeSupply = new BigNumber(liquidateFund);
    const pcDecreaseSupply = removeSupply.dividedBy(totalSupply);
    const currentReserves = currentSelectedPool.reserves;

    const reservesAdded = currentReserves.map(function(item){
      const currentReserveSupply = new BigNumber(item.reserveBalance);
      const currentReserveAdded = pcDecreaseSupply.multipliedBy(currentReserveSupply);
      const currentReserveAddedMin = toDecimals(currentReserveAdded.toFixed(6), item.decimals);
      const currentReserveAddedDisplay = currentReserveAdded.toPrecision(6, 0);
      return Object.assign({}, item, {addedMin: currentReserveAddedMin, addedDisplay: currentReserveAddedDisplay});
    });
    const {singleTokenWithdrawReserveSelection} = this.state;
    let reservesMap = reservesAdded.map(function(item, idx){
      if (item.symbol === singleTokenWithdrawReserveSelection.symbol) {
        let payload = {path: null, totalAmount: item.addedMin, conversionAmount: item.addedMin, quantity: item.addedDisplay, token: item};
        return new Promise((resolve, reject) => resolve(payload));
      } else {
         return getTokenConversionPath(item, singleTokenWithdrawReserveSelection).then(function(conversionPath){
            return getTokenWithdrawConversionAmount(conversionPath, item.addedMin).then(function(response){
              let quantity = fromDecimals(response.toString(), item.decimals);
            return {path: conversionPath, totalAmount: response, conversionAmount: item.addedMin, quantity: quantity, token: item}
            });
         });
      }
    });
    const self = this;
    Promise.all(reservesMap).then(function(mapData){
      self.setState({singleTokenWithdrawConversionPaths: mapData})
    })

    this.setState({reservesAdded: reservesAdded});
  }
  
  submitBuyPoolTokenWithSingleReserve = () => {

    const {singleReserveAmount, reservesNeeded, singleTokenFundConversionPaths} = this.state;
    const {pool: {currentSelectedPool}} = this.props;
    const fundingArgs = {poolTokenProvided: toDecimals(singleReserveAmount, currentSelectedPool.decimals),
    reservesNeeded: reservesNeeded, converterAddress: currentSelectedPool.converter};

    const payload = {paths: singleTokenFundConversionPaths, funding: fundingArgs};
    this.props.submitPoolBuyWithSingleReserve(payload);
  }

  submitSellPoolTokenWithSingleReserve = () => {
    const {pool: {currentSelectedPool}} = this.props;
    const {singleTokenWithdrawConversionPaths} = this.state;
    const existingPoolTokenBalance = fromDecimals(currentSelectedPool.senderBalance, currentSelectedPool.decimals);
    const {singleTokenWithdrawReserveAmount, reservesAdded} = this.state;
    const args = {poolTokenSold: toDecimals(singleTokenWithdrawReserveAmount, currentSelectedPool.decimals),
    reservesAdded: reservesAdded, converterAddress: currentSelectedPool.converter,
      'poolAddress': currentSelectedPool.address
    };
    const payload = {paths: singleTokenWithdrawConversionPaths, funding: args}
    this.props.submitPoolSellWithSingleReserve(payload);

  }
  
  fundReserveToggle = (type) => {
    const {pool: {currentSelectedPool}} = this.props;
    if (type === 'all') {
      this.setState({fundOneReserveActive: '', singleTokenFundReserveAmount: 0});
      this.setState({fundAllReservesActive: 'reserve-active', reservesNeeded: [], singleTokenFundConversionPaths: []});
      
    } else {
      this.setState({fundAllReservesActive: ''});
      this.setState({fundOneReserveActive: 'reserve-active'});
      this.setState({singleTokenFundReserveSelection: currentSelectedPool.reserves[0], fundAmount: 0});
    }
  }

  fundSingleBaseChanged = (evtKey, evt) => {
    const {pool: {currentSelectedPool}} = this.props;
    const currentSelection = currentSelectedPool.reserves.find((a)=>(a.symbol === evtKey));
    this.setState({singleTokenFundReserveSelection: currentSelection});
  }

  withdrawSingleBaseChanged = (eventKey, evt) => {
    const {pool: {currentSelectedPool}} = this.props;
    const currentSelection = currentSelectedPool.reserves.find((a)=>(a.symbol === eventKey));
    this.setState({singleTokenWithdrawReserveSelection: currentSelection});
  }
  
  withdrawReserveToggle = (type) => {
    const {pool: {currentSelectedPool}} = this.props;
    if (type === 'all') {
      this.setState({withdrawOneReserveActive: '', withdrawAllReservesActive: 'reserve-active', singleTokenWithdrawConversionPaths: []});
    } else {
      this.setState({withdrawOneReserveActive: 'reserve-active', withdrawAllReservesActive: ''});
      this.setState({singleTokenWithdrawReserveSelection: currentSelectedPool.reserves[0], liquidateAmount: 0});
    }
  }  
  
  showApprovalDialog = (type = "pool") => {
    const {pool: {currentSelectedPool}} = this.props;
    this.props.setTokenAllowances(1000000000, currentSelectedPool, type);
  }
  
  showRevokeDialog = () => {
    const {pool: {currentSelectedPool}} = this.props;
    this.props.revokeTokenAllowances(currentSelectedPool);
  }
  
  componentWillReceiveProps(nextProps) {
    const {pool: {currentSelectedPool, poolApproval}} = nextProps;
    if (isNonEmptyArray(currentSelectedPool.reserves) && isEmptyArray(this.props.pool.currentSelectedPool.reserves)) {
      this.setState({singleTokenFundReserveSelection: currentSelectedPool.reserves[0],
      singleTokenWithdrawReserveSelection: currentSelectedPool.reserves[0]});
    }
    if (poolApproval === 'success' && this.props.poolApproval === 'init') {
      
    }
  }
  
  toggleApprovalDisplay = () => {
    this.setState({approvalDisplay: !this.state.approvalDisplay})
  }
  
  onSingleReserveFundInputChanged = (evt) => {
    const singleInputFund = evt.target.value;
    if (!isNaN(parseFloat(singleInputFund))) {
      this.calculateFundingAmountWithOneReserve(singleInputFund);
      this.setState({singleReserveAmount: singleInputFund});
    } 
  }
  
  onSingleReserveLiquidateFundChanged = (evt) => {
    const singleLiquidateFund = evt.target.value;
    this.calculateLiquidateAmountWithOneReserve(singleLiquidateFund);
    this.setState({singleTokenWithdrawReserveAmount: singleLiquidateFund});
  }  
  
  render() {
    const {pool: {currentSelectedPool, currentSelectedPoolError, poolHistory}, pool} = this.props;
    const {reservesNeeded, reservesAdded, fundAllReservesActive, fundOneReserveActive, singleTokenFundConversionPaths,
      withdrawAllReservesActive, withdrawOneReserveActive, singleTokenWithdrawReserveSelection, singleTokenFundReserveSelection,
      singleTokenWithdrawConversionPaths
    } = this.state;
    const self = this;

    let reserveRatio = '';

    reserveRatio = currentSelectedPool.reserves && currentSelectedPool.reserves.length > 0 ?currentSelectedPool.reserves.map(function(item){
      if (item) {
      return parseInt(item.reserveRatio) / 10000;
      } else {
        return null;
      }
    }).filter(Boolean).join("/") : '';


    if (currentSelectedPoolError) {
      return (<div>
      <div>Could not fetch pool details.</div>
      <div>Currently only pool contracts which expose reserveTokenCount() and reserveTokens() methods are supported.</div>
      </div>)
    }
    const { fundAmount, liquidateAmount, isError, errorMessage } = this.state;

    let minTotalSupply = currentSelectedPool.totalSupply ? 
                          parseFloat(fromDecimals(currentSelectedPool.totalSupply, currentSelectedPool.decimals)).toFixed(4) : "";
    let reserveTokenList = currentSelectedPool.reserves && currentSelectedPool.reserves.length > 0 ? currentSelectedPool.reserves.map(function(item, idx){
      return <div key={`token-${idx}`}>
        <div className="holdings-label">{item.name}</div>
        <div className="holdings-data">&nbsp;{parseFloat(item.reserveBalance).toFixed(4)}</div>
      </div>
    }) : <span/>;

    let userHoldingsList = currentSelectedPool.reserves && currentSelectedPool.reserves.length > 0 ? currentSelectedPool.reserves.map(function(item, idx){
      let userBalanceItem = parseFloat(item.userBalance);
      let userBalanceDisplay = "-";
      if (!isNaN(userBalanceItem)) {
        userBalanceDisplay = userBalanceItem.toFixed(4);
      }
      return (<div key={`token-${idx}`}>
        <div className="holdings-label">{item.name}</div>
        <div className="holdings-data">&nbsp;{userBalanceDisplay}</div>
      </div>)
    }) : <span/>;

    let poolHoldings = "";
    if (currentSelectedPool.senderBalance) {
      poolHoldings = fromDecimals(currentSelectedPool.senderBalance, currentSelectedPool.decimals) + " " + currentSelectedPool.symbol;
    }
    let liquidateInfo = <span/>;
    if (liquidateAmount && liquidateAmount > 0) {
      liquidateInfo = (
        <div>
          <div>You will receive</div>
            {reservesAdded.map(function(item, idx){
              return <div key={`reserve-added-${idx}`}>{item.addedDisplay} {item.symbol}</div>
            })}
        </div>
        )
    }
    let fundInfo = <span/>;

    if (fundAmount && fundAmount > 0) {
      fundInfo = (
        <div>
            <div>You will needs to stake</div>
            {reservesNeeded.map(function(item, idx){
              return <div key={`reserve-needed-${idx}`}>{item.neededDisplay} {item.symbol}</div>
            })}
        </div>
        )
    }
    let conversionFee = "";
    if (currentSelectedPool && currentSelectedPool.conversionFee) {
       conversionFee = currentSelectedPool.conversionFee + "%";
    }

    let poolLiquidateAction = <span/>;
    let poolFundAction = <span/>;
    let tokenAllowances = <span/>;
    
    let tokenAllowanceRowVisible = "row-hidden";
    if (this.state.approvalDisplay) {
      tokenAllowanceRowVisible = "row-visible"; 
    }
    
    if (currentSelectedPool.reserves && currentSelectedPool.reserves.length > 0){
      
      if (withdrawAllReservesActive === 'reserve-active') {
      poolLiquidateAction = (
        <div>
            <Form.Control type="number" placeholder="Enter amount to liquidate" onChange={this.onLiquidateInputChanged}/>
            <div className="action-info-col">
            {liquidateInfo}
            <Button onClick={this.submitSellPoolToken} className="pool-action-btn">Sell</Button>
            </div>
        </div>
        )
      } else if (withdrawOneReserveActive === 'reserve-active') {
          let reserveOptions = currentSelectedPool.reserves.map(function(item, key){
            return <Dropdown.Item eventKey={item.symbol} key={`${item.symbol}-${key}`}>{item.symbol}</Dropdown.Item>
          });
          let withdrawActiveAmount = <span/>;
          if (singleTokenWithdrawConversionPaths && singleTokenWithdrawConversionPaths.length > 0) {
            let totalReserveAmount  = 0;
            singleTokenWithdrawConversionPaths.forEach(function(item){
              totalReserveAmount += parseFloat(item.quantity);
            });
            withdrawActiveAmount = <div>You will receive {totalReserveAmount} {singleTokenWithdrawReserveSelection.symbol}</div>
          }
        poolLiquidateAction = (
            <div>
            <div className="select-reserve-container">
              <div>
              <label>
                Reserve token in which to withdraw
              </label>
              <DropdownButton id="dropdown-basic-button" title={singleTokenWithdrawReserveSelection.symbol} onSelect={this.withdrawSingleBaseChanged}>
                {reserveOptions}
              </DropdownButton>
              </div>
              <div>
                 <label>Amount of pool tokens to withdraw</label>
                <Form.Control type="number" placeholder="Pool tokens to withdraw" onChange={this.onSingleReserveLiquidateFundChanged}/>
              </div>
            </div>
                <div className="action-info-col">
                {withdrawActiveAmount}
                <Button onClick={this.submitSellPoolTokenWithSingleReserve} className="pool-action-btn">Withdraw</Button>
                </div>
            </div>
            )
      }
      
      if (fundAllReservesActive === 'reserve-active') {
          poolFundAction = (
            <div>
                <Form.Control type="number" placeholder="Enter amount to fund" onChange={this.onFundInputChanged}/>
                <div className="action-info-col">
                {fundInfo}
                <Button onClick={this.submitBuyPoolToken} className="pool-action-btn">Purchase</Button>
                </div>
            </div>
            )
        } else if (fundOneReserveActive === 'reserve-active') {
          let reserveOptions = currentSelectedPool.reserves.map(function(item, key){
            return <Dropdown.Item eventKey={item.symbol} key={`${item.symbol}-${key}`} >{item.symbol}</Dropdown.Item>
          });
          let fundActiveAmount = <span/>;
          if (singleTokenFundConversionPaths) {
            let totalReserveAmount  = 0;
            singleTokenFundConversionPaths.forEach(function(item){
              totalReserveAmount += parseFloat(item.quantity);
            });
            fundActiveAmount = <div>You will need to stake {totalReserveAmount} {singleTokenFundReserveSelection.symbol}</div>
          }

          poolFundAction = (
            <div>
            <div className="select-reserve-container">
            <div>
              <label>
                Reserve token with which to fund.
              </label>
              <DropdownButton id="dropdown-basic-button" title={singleTokenFundReserveSelection.symbol} onSelect={this.fundSingleBaseChanged}>
                {reserveOptions}
              </DropdownButton>
            </div>
            <div>
              <label>Amount of pool tokens to fund</label>
              <Form.Control type="number" placeholder="Enter amount of pool tokens to fund" onChange={this.onSingleReserveFundInputChanged}/>
            </div>
            </div>
                <div className="action-info-col">
                {fundActiveAmount}
                <Button onClick={this.submitBuyPoolTokenWithSingleReserve} className="pool-action-btn">Purchase</Button>
                </div>
            </div>
            )
        }
        
    let tokenAllowanceReserves = currentSelectedPool.reserves.map(function(item, idx){
      return <div key={`allowance-${idx}`} className="selected-pool-balance">
      {item.symbol} {item.userAllowance ? parseFloat(item.userAllowance).toFixed(5) : '-'}
      </div>
    });
    
    let tokenSwapAllowanceReserves = currentSelectedPool.reserves.map(function(item, idx){
      return <div key={`allowance-${idx}`} className="selected-pool-balance">
      {item.symbol} {item.swapAllowance ? parseFloat(item.swapAllowance).toFixed(5) : '-'}
      </div>
    });
    
    tokenAllowances = 
    <div className={`${tokenAllowanceRowVisible}`}>
    <div className="approval-type-label">
     Approvals for pool converter contract.
    </div>
    <Row className={`token-allowances-display-row`}>
    <Col lg={8}>
      {tokenAllowanceReserves}
      </Col>
      <Col lg={4}>
      <Button onClick={()=>this.showApprovalDialog("pool")}>Approve reserves </Button>
      <Button onClick={this.showRevokeDialog} className="revoke-approval-btn">Revoke approval </Button>
      </Col>
    </Row>
    <div className="approval-type-label">
     Approvals for Bancor Network contract.
    </div>
    <Row className="single-token-description">
     <Col lg={12}>
       If you using single token funding, it is also recommended that you approve BancorNetwork contract for swaps.
     </Col>
     </Row>
    <Row>
      <Col lg={8}>
      {tokenSwapAllowanceReserves}
      </Col>
      <Col lg={4}>
      <Button onClick={()=>this.showApprovalDialog("swap")}>Approve reserves </Button>
      <Button onClick={this.showRevokeDialog} className="revoke-approval-btn">Revoke approval </Button>
      </Col>
    </Row>
    </div>
    }
    
    function allowanceToolTip(props) {
       return <Tooltip {...props}>
        <div>Token allowances refer to amount you have approved the converter contract to spend.</div>
        <div>Set allowances for BancorConverter for faster pool funding and liquidation and save on Gas costs</div>
        </Tooltip>;
    }


    return (
      <div>
        <Row className="select-pool-row-1">
          <Col lg={1} className="pool-logo-container">
            <img src={currentSelectedPool.imageURI} className="selected-pool-image"/>
          </Col>
          <Col lg={2}>
            <div className="cell-label">{currentSelectedPool.symbol}</div>
            <div className="cell-data">{currentSelectedPool.name}</div>
          </Col>
          <Col lg={2}>
           <div className="cell-label">Address</div>
           <div className="cell-data"><AddressDisplay address={currentSelectedPool.address}/></div>
          </Col>
          <Col lg={2}>
            <div className="cell-label">Pool Supply</div>
            <div className="cell-data">{minTotalSupply}</div>
          </Col>
          <Col lg={3}>
            <div>
              <div className="cell-label">Reserves</div>
              <div className="cell-data">{reserveTokenList}</div>
            </div>
          </Col>
          <Col lg={2}>
            <div className="cell-label">Reserve Ratio</div>
            <div className="cell-data">{reserveRatio}</div>
          </Col>
        </Row>
        <Row className="selected-pool-meta-row">
          <Col lg={3}>
            <div className="cell-label">Conversion fee generated</div>
            <div className="cell-data">{conversionFee}</div>
          </Col>
          <Col lg={3}>
            <div className="cell-label">Your pool token holdings</div>
            <div className="cell-data">{poolHoldings}</div>
          </Col>
          <Col lg={4}>
            <div className="cell-label">Your reserve token holdings</div>
            <div className="cell-data">{userHoldingsList}</div>
          </Col>
        </Row>
        
       <div className="pool-action-container pool-allowance-container">

        <Row>
         <Col lg={12}>
          <div className="pool-approval-container">
           <div className="allowance-label">
           Your pool allowances 
           <OverlayTrigger
              placement="right"
              delay={{ show: 250, hide: 400 }}
              overlay={allowanceToolTip}>
              <FontAwesomeIcon icon={faQuestionCircle} className="info-tooltip-btn"/>
            </OverlayTrigger>
           </div>
           
           <FontAwesomeIcon icon={faChevronDown} className="show-approval-toggle" onClick={this.toggleApprovalDisplay}/>
           
           {tokenAllowances}
         
           </div>
         </Col>
        </Row>
        
        <Row className="selected-pool-buy-sell-row">
          <Col lg={6}>
            <div className="allowance-label">Fund Pool Holdings</div>
            <ButtonGroup className="reserve-toggle-btn-group">
              <Button className={`reserve-toggle-btn ${fundAllReservesActive}`} onClick={self.fundReserveToggle.bind(self, 'all')}>
                Fund with all reserve tokens
              </Button>
              <Button className={`reserve-toggle-btn ${fundOneReserveActive}`} onClick={self.fundReserveToggle.bind(self, 'one')}>
                Fund with one reserve token
              </Button>
            </ButtonGroup>
            {poolFundAction}
          </Col>
          <Col lg={6}>
            <div className="allowance-label">Liquitate Pool Holdings</div>
            <ButtonGroup className="reserve-toggle-btn-group">
              <Button className={`reserve-toggle-btn ${withdrawAllReservesActive}`} onClick={self.withdrawReserveToggle.bind(self, 'all')}>
                Liquidate to all reserve tokens
              </Button>
              <Button className={`reserve-toggle-btn ${withdrawOneReserveActive}`} onClick={self.withdrawReserveToggle.bind(self, 'one')}>
                Liquidate to one reserve token
              </Button>
            </ButtonGroup>
            {poolLiquidateAction}
          </Col>
        </Row>
        
        </div>  
      </div>
      )
  }
}

class VolumeGraph extends Component {
  componentWillMount() {
    const {selectedPool} = this.props;
    this.props.fetchConversionVolume(selectedPool);
  }

  componentWillReceiveProps(nextProps) {
    const {selectedPool, selectedPool: {symbol}} = nextProps;
    if (symbol !== this.props.selectedPool.symbol || (selectedPool.reserves && selectedPool.reserves.length > 0 && !this.props.selectedPool.reserves)) {
      this.props.fetchConversionVolume(selectedPool);
    }
  }
  componentWillUnmount() {
    this.props.resetPoolHistory();
  }
  render() {
    const web3 = window.web3;
    const currentNetwork = web3.currentProvider.networkVersion;
    const {poolHistory, selectedPool: {symbol}} = this.props;

    let graphData = poolHistory.map(function(item){

      return {x: moment(item.timeStamp).format('MM-DD'), y: parseInt(item.data)}
    });

    if (graphData.length == 0) {
      return <div className="graph-message-text">Volume graph data not available</div>
    }


    if (currentNetwork !== '1') {
      return <div className="graph-message-text">Volume graph is available only on mainnet</div>
    }
    return (
      <div>
      <VictoryChart

>
  <VictoryLine
    style={{
      data: { stroke: "#c43a31" },
      parent: { border: "1px solid #ccc"}
    }}
    data={graphData}
      />
      <VictoryAxis dependentAxis/>
      <VictoryAxis fixLabelOverlap={true}/>

    </VictoryChart>
    <div className="h7 text-center">Daily conversion vol from reserve to {symbol} (ETH)</div>
    </div>

      )
  }
}