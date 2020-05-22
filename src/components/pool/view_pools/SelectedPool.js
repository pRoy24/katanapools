import React, {Component} from 'react';
import {Row, Col, Form, Button, Tooltip, OverlayTrigger, Dropdown, DropdownButton, ButtonGroup} from 'react-bootstrap';
import AddressDisplay from '../../common/AddressDisplay';
import {toDecimals, fromDecimals} from '../../../utils/eth';
import {isEmptyString, isEmptyArray, isNonEmptyArray} from '../../../utils/ObjectUtils';
import {VictoryChart, VictoryLine, VictoryAxis} from 'victory';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faQuestionCircle, faSpinner } from '@fortawesome/free-solid-svg-icons'
import {getTokenConversionPath, getTokenFundConversionAmount, getTokenWithdrawConversionAmount, getFundAmount, getLiquidateAmount} from '../../../utils/ConverterUtils';

const Decimal = require('decimal.js');
export default class SelectedPool extends Component {
  constructor(props) {
    super(props);
    this.state= {fundAmount: 0, liquidateAmount: 0, reserve1Needed: 0, reserve2Needed: 0,
      fundAllReservesActive: 'reserve-active', fundOneReserveActive: '',
      singleTokenFundReserveSelection: '', singleTokenFundReserveAmount: 0, singleTokenFundConversionPaths: [],
      singleTokenWithdrawReserveSelection: '', singleTokenWithdrawReserveAmount: 0, singleTokenWithdrawConversionPaths: [],
      withdrawOneReserveActive: '', withdrawAllReservesActive: 'reserve-active', approvalDisplay: false,
      calculatingFunding: true, fundingCalculateInit: true, calculatingWithdraw: true, withdrawCalculateInit: true,
      calculatingAllInputFunding: true, calculatingAllInputWithdraw: true,
    }
  }

  onFundInputChanged = (evt) => {
    let inputFund = evt.target.value;
    this.setState({fundAmount: inputFund});
  }

  calculateAllInputFund = (evt) => {
   const {fundAmount} =this.state;  
   this.calculateFundingAmount(fundAmount);     
  }
  
  onLiquidateInputChanged = (evt) => {
    let inputFund = evt.target.value;
    this.setState({liquidateAmount: inputFund});
  }
  
  calculateAllInputWithdraw = (evt) => {
    const {liquidateAmount} = this.state;
    this.calculateLiquidateAmount(liquidateAmount);
        
  }

  calculateLiquidateAmount = (inputFund) => {
    const {pool: {currentSelectedPool}} = this.props;
    this.setState({calculatingAllInputWithdraw: true});
    if (!isNaN(inputFund) && parseFloat(inputFund) > 0) {
      const totalSupply = currentSelectedPool.totalSupply;
      const currentReserves = currentSelectedPool.reserves;
      const inputAmount = toDecimals(inputFund, currentSelectedPool.decimals);

      let totalRatio = 0;
      currentSelectedPool.reserves.forEach(function(reserve){
        totalRatio += !isNaN(reserve.reserveRatio) ? parseInt(reserve.reserveRatio) : 0;
      })
      if (totalRatio === 0) {
        totalRatio = 1000000 ;
      }
    
      const reservesAdded = currentReserves.map(function(item){
        const currentReserveSupply = item.reserveBalance;
        return getLiquidateAmount(totalSupply, currentReserveSupply, totalRatio, inputAmount).then(function(response){
          const liquidateBalance = (new Decimal(fromDecimals(response, item.decimals))).toFixed(4);
            return Object.assign({}, item, {addedMin: response, addedDisplay: liquidateBalance});
        });
      });
      const self = this;
      Promise.all(reservesAdded).then(function(reserveResponse){
        self.setState({reservesAdded: reserveResponse, calculatingAllInputWithdraw: false});
      })
    }
  }

  calculateFundingAmount = (inputFund) => {
    const {pool: {currentSelectedPool}} = this.props;
    const self = this;
    this.setState({calculatingAllInputFunding: true});
    if (!isNaN(inputFund) && parseFloat(inputFund) > 0) {

      let totalRatio = 0;
      currentSelectedPool.reserves.forEach(function(reserve){
        totalRatio += !isNaN(reserve.reserveRatio) ? parseInt(reserve.reserveRatio) : 0;
      })
      if (totalRatio === 0) {
        totalRatio = 1000000 ;
      }
    
      const currentReserves = currentSelectedPool.reserves;
      
      const reservesNeededPromise = currentReserves.map(function(item){

        const totalSupply = currentSelectedPool.totalSupply;
        const reserveBalance = item.reserveBalance;
        const amount = toDecimals(inputFund, currentSelectedPool.decimals);

        return getFundAmount(totalSupply, reserveBalance, totalRatio, amount).then(function(neededMin){
          
         const neededDisplay = new Decimal(fromDecimals(neededMin, item.decimals)).toFixed(4, Decimal.ROUND_UP);
          const approvalNeededDisplay = parseFloat(neededDisplay) + 0.05 * neededDisplay;
          const approvalNeededMin = toDecimals(approvalNeededDisplay, item.decimals);
          let reserveObject = Object.assign({}, item, {neededMin: approvalNeededMin, neededDisplay: neededDisplay});
          return reserveObject;
        });
      });
      
      Promise.all(reservesNeededPromise).then(function(neededResponse){
         self.setState({reservesNeeded: neededResponse, calculatingAllInputFunding: false});
      })
     
    }
  }

  calculateFundingAmountWithOneReserve = (inputFund) => {
    if (!isNaN(parseFloat(inputFund))) {
    this.setState({calculatingFunding: true, fundingCalculateInit: false});
    const {pool: {currentSelectedPool}} = this.props;  
    const self = this;
    const {singleTokenFundReserveSelection} = this.state;
    const currentReserves = currentSelectedPool.reserves;
    const singleReserveSelection = singleTokenFundReserveSelection.symbol;

    const totalSupply = currentSelectedPool.totalSupply;

    let totalRatio = 0;
    currentSelectedPool.reserves.forEach(function(reserve){
      totalRatio += !isNaN(reserve.reserveRatio) ? parseInt(reserve.reserveRatio) : 0;
    })
    if (totalRatio === 0) {
        totalRatio = 1000000 ;
    }
    
    let selectedBaseReserve = currentSelectedPool.reserves.find(function(item){
      if (item.symbol === singleReserveSelection) {
        return item;
      }
    });

    let baseReserveBalance = selectedBaseReserve.reserveBalance;
    
    const amount = toDecimals(inputFund, currentSelectedPool.decimals);

   getFundAmount(totalSupply, baseReserveBalance, totalRatio, amount).then(function(baseNeededMin){
      const baseNeededDisplay = new Decimal(fromDecimals(baseNeededMin, selectedBaseReserve.decimals)).toFixed(4, Decimal.ROUND_UP);
      const baseApprovalNeededDisplay = parseFloat(baseNeededDisplay) + 0.05 * baseNeededDisplay;
      const baseApprovalNeededMin = toDecimals(baseApprovalNeededDisplay, selectedBaseReserve.decimals);

      let reservesNeeded = [];
      
    let reservesMap = currentReserves.map(function(reserveItem){
      if (reserveItem.symbol === singleReserveSelection) {
        const payload = {path: null, totalAmount: baseApprovalNeededMin, conversionAmount: baseNeededMin,
        quantity: baseApprovalNeededDisplay, token: reserveItem};
        reservesNeeded.push(Object.assign({}, reserveItem, {neededMin: baseApprovalNeededMin, neededDisplay: baseApprovalNeededDisplay}));
        return new Promise((resolve, reject) => (resolve(payload)));
      } else {
        return getTokenConversionPath(selectedBaseReserve, reserveItem).then(function(conversionPath){
           let usePoolForConversion = false;
           if (conversionPath.indexOf(currentSelectedPool.address) !== -1) {
             usePoolForConversion = true;
           }
            
           let currentReserveNeededMin = 0;
           let currentReserveNeededDisplay = 0;

           let reserveBalance = reserveItem.reserveBalance;

           // If pool is being used for conversion then supply will be decreased after conversion

          return getFundAmount(totalSupply, reserveBalance, totalRatio, amount).then(function(reserveNeededMin){

            currentReserveNeededDisplay = new Decimal(fromDecimals(reserveNeededMin, selectedBaseReserve.decimals)).toFixed(4, Decimal.ROUND_UP);
            
            const currentApprovalNeededDisplay = parseFloat(currentReserveNeededDisplay) + 0.05 * currentReserveNeededDisplay;
            const currentApprovalNeededMin = toDecimals(currentApprovalNeededDisplay, reserveItem.decimals);

            return getTokenFundConversionAmount(conversionPath, currentReserveNeededDisplay, baseApprovalNeededDisplay, reserveItem.decimals).then(function(response){
              const responseAmount = fromDecimals(response.base, selectedBaseReserve.decimals);
              reservesNeeded.push(Object.assign({}, reserveItem, {neededMin: currentApprovalNeededMin, neededDisplay: currentReserveNeededDisplay}));
              return {path: conversionPath, totalAmount: response.base, conversionAmount: currentReserveNeededMin, quantity: responseAmount, 
              token: reserveItem, usePoolForConversion: usePoolForConversion}
            });
          });
        });
      }
    });
    
    Promise.all(reservesMap).then(function(response){
    
      let newBaseReserveBalance = parseFloat(fromDecimals(baseReserveBalance, selectedBaseReserve.decimals));
      
      response.forEach(function(item){
        if (item.path !== null && item.usePoolForConversion === true) {
          newBaseReserveBalance += item.totalAmount;
        }
      });

    const updatedReserveBalance = toDecimals(newBaseReserveBalance, selectedBaseReserve.decimals);

   getFundAmount(totalSupply, updatedReserveBalance, totalRatio, amount).then(function(newBaseNeededMin){
     
     let baseItemResponse = response.find((a)=>(a.path === null));
     baseItemResponse.totalAmount = newBaseNeededMin;
     baseItemResponse.quantity = fromDecimals(newBaseNeededMin, baseItemResponse.token.decimals);
     let neeedBase = reservesNeeded.find((a)=>(a.symbol === selectedBaseReserve.symbol));
     neeedBase.neededMin = newBaseNeededMin;
     self.setState({singleTokenFundConversionPaths: response, reservesNeeded: reservesNeeded, calculatingFunding: false});
   });
    });
    
    })
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
  
  calculateLiquidateAmountWithOneReserve = (liquidateFund) => {
    const {pool: {currentSelectedPool}} = this.props;
    this.setState({calculatingWithdraw: true, withdrawCalculateInit: false});

    const currentReserves = currentSelectedPool.reserves;

    const totalSupply = currentSelectedPool.totalSupply;
    const self = this;
      
    let totalRatio = 0;
    currentSelectedPool.reserves.forEach(function(reserve){
      totalRatio += !isNaN(reserve.reserveRatio) ? parseInt(reserve.reserveRatio) : 0;
    });
    if (totalRatio === 0) {
        totalRatio = 1000000 ;
    }
    const inputAmount = toDecimals(liquidateFund, currentSelectedPool.decimals);

    const reservesAddedPromise = currentReserves.map(function(item){
      const currentReserveSupply = item.reserveBalance;
      return getLiquidateAmount(totalSupply, currentReserveSupply, totalRatio, inputAmount).then(function(response){

        const liquidateBalance = (new Decimal(fromDecimals(response, item.decimals))).toFixed(4);
          return Object.assign({}, item, {addedMin: response, addedDisplay: liquidateBalance});
      });
    });

    const {singleTokenWithdrawReserveSelection} = this.state;
    
    Promise.all(reservesAddedPromise).then(function(reservesAdded){

      let reservesMap = reservesAdded.map(function(item, idx){
        if (item.symbol === singleTokenWithdrawReserveSelection.symbol) {
          let payload = {path: null, totalAmount: item.addedMin, conversionAmount: item.addedMin, quantity: item.addedDisplay, token: item};
          return new Promise((resolve, reject) => resolve(payload));
        } else {
          
           return getTokenConversionPath(item, singleTokenWithdrawReserveSelection).then(function(conversionPath){
              return getTokenWithdrawConversionAmount(conversionPath, item.addedMin).then(function(response){
                let quantity = fromDecimals(response.toString(), currentSelectedPool.decimals);
              return {path: conversionPath, totalAmount: response, conversionAmount: item.addedMin, quantity: quantity, token: item}
              });
           });
        }
      });
  

      Promise.all(reservesMap).then(function(mapData){
        self.setState({singleTokenWithdrawConversionPaths: mapData, calculatingWithdraw: false});
      })
  
      self.setState({reservesAdded: reservesAdded});
    
    });

  }
  
  submitBuyPoolTokenWithSingleReserve = () => {
    const {singleReserveAmount, reservesNeeded, singleTokenFundConversionPaths} = this.state;
    const {pool: {currentSelectedPool}} = this.props;
    const fundingArgs = {poolTokenProvided: toDecimals(singleReserveAmount, currentSelectedPool.decimals),
    reservesNeeded: reservesNeeded, converterAddress: currentSelectedPool.converter};

    const payload = {swap: singleTokenFundConversionPaths, fund: fundingArgs};


    let totalReserveAmount  = new Decimal(0);
    let baseReserveItem = {};
    singleTokenFundConversionPaths.forEach(function(item){
      if (item.path === null) {
        baseReserveItem = item;
      }
      totalReserveAmount = totalReserveAmount.add(new Decimal(item.quantity));
    });
    
    const userBalance = baseReserveItem.token.userBalance;

    if (totalReserveAmount.lessThanOrEqualTo(userBalance)) {
       this.props.submitPoolBuyWithSingleReserve(payload);
    } else {      
      this.props.setErrorMessage(`Amount needed is more than user balance`);
    }
  }

  submitSellPoolTokenWithSingleReserve = () => {
    const {pool: {currentSelectedPool}} = this.props;
    const {singleTokenWithdrawConversionPaths} = this.state;
    const {singleTokenWithdrawReserveAmount, reservesAdded} = this.state;
    const args = {poolTokenSold: toDecimals(singleTokenWithdrawReserveAmount, currentSelectedPool.decimals),
    reservesAdded: reservesAdded, converterAddress: currentSelectedPool.converter,
      'poolAddress': currentSelectedPool.address
    };
    const payload = {paths: singleTokenWithdrawConversionPaths, funding: args}
    const existingPoolTokenBalance = fromDecimals(currentSelectedPool.senderBalance, currentSelectedPool.decimals);
    
    let isError = false;
    if(parseFloat(singleTokenWithdrawReserveAmount) > parseFloat(existingPoolTokenBalance)) {
      isError = true;
      this.props.setErrorMessage(`User balance for ${currentSelectedPool.symbol} is less than needed amount of ${singleTokenWithdrawReserveAmount}`);
    }    
    if (!isError) {
      this.props.submitPoolSellWithSingleReserve(payload);
    }
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
    const {singleInputFund, inputFund, singleReserveAmount} = this.state;
    const currentSelection = currentSelectedPool.reserves.find((a)=>(a.symbol === evtKey));
    const self = this;
    this.setState({singleTokenFundReserveSelection: currentSelection}, function(){
      self.calculateFundingAmountWithOneReserve(singleReserveAmount);
    });
  }

  withdrawSingleBaseChanged = (eventKey, evt) => {
    const {pool: {currentSelectedPool}} = this.props;
    const {singleTokenWithdrawReserveAmount} = this.state;
    const self = this;
    const currentSelection = currentSelectedPool.reserves.find((a)=>(a.symbol === eventKey));
    this.setState({singleTokenWithdrawReserveSelection: currentSelection}, function(){
      self.calculateLiquidateAmountWithOneReserve(singleTokenWithdrawReserveAmount);      
    });
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
  
  showRevokeDialog = (type = "pool") => {
    const {pool: {currentSelectedPool}} = this.props;
    this.props.revokeTokenAllowances(currentSelectedPool, type);
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
    this.setState({singleReserveAmount: singleInputFund});
  }
  
  calculateSingleInputFund = () => {
    const {singleReserveAmount} = this.state;
    if (!isNaN(parseFloat(singleReserveAmount))) {
      this.calculateFundingAmountWithOneReserve(singleReserveAmount);
    }
  }
  
  calculateSingleInputWithdraw = () => {
    const {singleTokenWithdrawReserveAmount} = this.state;
    this.calculateLiquidateAmountWithOneReserve(singleTokenWithdrawReserveAmount);
  }
  
  onSingleReserveLiquidateFundChanged = (evt) => {
    const singleLiquidateFund = evt.target.value;
   // this.calculateLiquidateAmountWithOneReserve(singleLiquidateFund);
    this.setState({singleTokenWithdrawReserveAmount: singleLiquidateFund});
  }  
  
  render() {
    const {pool: {currentSelectedPool, currentSelectedPoolError}} = this.props;
    const {reservesNeeded, reservesAdded, fundAllReservesActive, fundOneReserveActive, singleTokenFundConversionPaths,
      withdrawAllReservesActive, withdrawOneReserveActive, singleTokenWithdrawReserveSelection, singleTokenFundReserveSelection,
      singleTokenWithdrawConversionPaths, calculatingFunding, calculatingWithdraw, submitFundingEnabled, fundingCalculateInit, withdrawCalculateInit,
      calculatingAllInputFunding, calculatingAllInputWithdraw
    } = this.state;
    
    const self = this;
    
    let isPurchaseBtnDisabled = false;
    let isPurchaseSubmitBtnDisabled = false;
    
    let allInputPurchasedDisabled = false;
    let allInputWithdrawDisabled = false;
    
    let isFundingLoading = <span/>;
    let isWithdrawLoading = <span/>;
    if (calculatingFunding && !fundingCalculateInit) {
      isFundingLoading = <FontAwesomeIcon icon={faSpinner} size="lg" rotation={270} pulse/>;
    }
    
    if (calculatingWithdraw && !withdrawCalculateInit) {
      isWithdrawLoading = <FontAwesomeIcon icon={faSpinner} size="lg" rotation={270} pulse/>;
    }
    
    if (calculatingAllInputFunding) {
      allInputPurchasedDisabled = true;
    }
    if (calculatingAllInputWithdraw) {
      allInputWithdrawDisabled = true;
    }
    
    let isWithdrawBtnDisabled = false;
    
    if (calculatingFunding) {
     // isPurchaseBtnDisabled = true;
    }
    
    if (calculatingFunding && !submitFundingEnabled) {
      isPurchaseSubmitBtnDisabled = true;
    }
    if (calculatingWithdraw) {
      isWithdrawBtnDisabled = true;
    }
    
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
    const { fundAmount, liquidateAmount } = this.state;

    let minTotalSupply = currentSelectedPool.totalSupply ? 
                          parseFloat(fromDecimals(currentSelectedPool.totalSupply, currentSelectedPool.decimals)).toFixed(4) : "";
    let reserveTokenList = currentSelectedPool.reserves && currentSelectedPool.reserves.length > 0 ? currentSelectedPool.reserves.map(function(item, idx){
      return <div key={`token-${idx}`}>
        <div className="holdings-label">{item.name}</div>
        <div className="holdings-data">&nbsp;{parseFloat(fromDecimals(item.reserveBalance, item.decimals)).toFixed(4)}</div>
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
    if (currentSelectedPool.senderBalance ) {
      poolHoldings = parseFloat(fromDecimals(currentSelectedPool.senderBalance, currentSelectedPool.decimals)).toFixed(4) + " " + currentSelectedPool.symbol;
    }
    let liquidateInfo = <span/>;
    if (liquidateAmount && liquidateAmount > 0 && reservesAdded && reservesAdded.length > 0) {
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

    if (fundAmount && fundAmount > 0 && reservesNeeded && reservesNeeded.length > 0) {
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
          <div className="select-reserve-container">
            <Form.Control type="number" placeholder="Enter amount to liquidate" onChange={this.onLiquidateInputChanged}/>
            <Button className="calculate-btn" disabled={isPurchaseBtnDisabled} onClick={this.calculateAllInputWithdraw}>Calculate</Button>            
          </div>
          <div className="action-info-col">
          {liquidateInfo}
          <Button onClick={this.submitSellPoolToken} disabled={allInputWithdrawDisabled} className="pool-action-btn">Sell</Button>
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
            totalReserveAmount = totalReserveAmount.toFixed(4);
            withdrawActiveAmount = <div>{isWithdrawLoading} You will receive {totalReserveAmount} {singleTokenWithdrawReserveSelection.symbol}</div>
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
                 <div>
                  <Form.Control type="number" placeholder="Pool tokens to withdraw" onChange={this.onSingleReserveLiquidateFundChanged}/>
                  <Button className="calculate-btn" onClick={this.calculateSingleInputWithdraw}>Calculate</Button>
                </div>
              </div>
            </div>
                <div className="action-info-col">
                {withdrawActiveAmount}
                <Button onClick={this.submitSellPoolTokenWithSingleReserve} disabled={isWithdrawBtnDisabled} className="pool-action-btn">Withdraw</Button>
                </div>
            </div>
            )
      }
      
      if (fundAllReservesActive === 'reserve-active') {
          poolFundAction = (
            <div className="select-reserve-container">
                <div>
                  <Form.Control type="number" placeholder="Enter amount to fund" onChange={this.onFundInputChanged}/>
                  <Button className="calculate-btn" disabled={isPurchaseBtnDisabled} onClick={this.calculateAllInputFund}>Calculate</Button>
                </div>
                <div className="action-info-col">
                {fundInfo}
                <Button onClick={this.submitBuyPoolToken} disabled={allInputPurchasedDisabled} className="pool-action-btn">Purchase</Button>
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
            totalReserveAmount = totalReserveAmount.toFixed(4);
            fundActiveAmount = <div>{isFundingLoading} You will need to stake {totalReserveAmount} {singleTokenFundReserveSelection.symbol}</div>
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
              <div>
                <Form.Control type="number" placeholder="Enter amount of pool tokens to fund" onChange={this.onSingleReserveFundInputChanged} className="single-reserve-amount-text"/>
                <Button className="calculate-btn" disabled={isPurchaseBtnDisabled} onClick={this.calculateSingleInputFund}>Calculate</Button>
              </div>
            </div>
            </div>
                <div className="action-info-col">
                {fundActiveAmount}
                <Button onClick={this.submitBuyPoolTokenWithSingleReserve} className="pool-action-btn" disabled={isPurchaseSubmitBtnDisabled}>Purchase</Button>
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
      <Button onClick={()=>this.showRevokeDialog("pool")} className="revoke-approval-btn">Revoke approval </Button>
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
      <Button onClick={()=>this.showRevokeDialog("swap")} className="revoke-approval-btn">Revoke approval </Button>
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
            <img src={currentSelectedPool.imageURI} className="selected-pool-image" alt="pool-token-img"/>
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

    if (graphData.length === 0) {
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