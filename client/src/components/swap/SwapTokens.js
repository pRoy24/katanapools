import React, {Component} from 'react';
import { Row, Col, Button, Form} from 'react-bootstrap';
import './swapToken.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faArrowRight,  faChevronCircleDown } from '@fortawesome/free-solid-svg-icons'
import Autosuggest from 'react-autosuggest';
import {getConverterRegistryAddress, getConvertibleTokenList, getConvertibleTokenData,
  getNetworkPath, getNetworkPathContractAddress, getContractAddress, getConverterValue,
  
  
} from '../../utils/RegistryUtils';
import {getBancorConversionRate} from '../../utils/BancorUtils';
import {getConvertibleTokensInRegistry, getReturnValueData} from '../../utils/ConverterUtils';


export default class SwapToken extends Component {

  constructor(props, context) {
    super(props);
    this.web3 = window.web3;
        this.state = {'showTransaferSelect': false, 'showReceiveSelect': false, selectedTransferToken: {}, selectedReceiveToken: {},
          transferAmount: 1000, receiveAmount: 0, 'ConverterRegistryContractAddress': '', tokenData: [], toAmount: 0
        };
  }
  
    getConversionPath = (from, to, fromAmount) => {
    const web3 = this.web3;
    const self = this;
    
    if (from && to) {
      getBancorConversionRate(from.address, to.address, fromAmount).then(function(toAmountResponse){
        console.log(toAmountResponse);
        self.setState({toAmount: toAmountResponse});
      })
      }
    }


  
  componentWillMount() {
    const self = this;
    const web3 = this.web3;
    
    getConverterRegistryAddress().then(function(convertibleTokenAddress){
      getConvertibleTokenList( convertibleTokenAddress).then(function(convertibleTokenList){
        getConvertibleTokenData( convertibleTokenList).then(function(tokenDataResponse){
          self.setState({tokenData: tokenDataResponse, selectedTransferToken: tokenDataResponse[0], selectedReceiveToken: tokenDataResponse[1] });
        });
      });
    });
  }
  
    openTransferSelectDropdown = () => {
      this.setState({showTransaferSelect: !this.state.showTransaferSelect});
    }
    
    openReceiveSelectDropdown = () => {
      this.setState({showReceiveSelect: !this.state.showReceiveSelect});
    }
    
    transferSelectChanged = (val) => {
      this.setState({selectedTransferToken: val, showTransaferSelect: false});
    }
    
    receiveSelectChanged = (val) => {
      this.setState({selectedReceiveToken: val, showReceiveSelect: false});
    }
    
  componentDidUpdate(prevProps, prevState, snapshot){
    const {transferAmount} = this.state;

  }  
  
  componentWillReceiveProps(nextProps) {
    const {toAmount, tokenData} = nextProps;
    if (toAmount !== this.props.toAmount) {
      this.setState({receiveAmount:toAmount });
    }
    
    if (this.props.tokenData.length === 0 && tokenData.length > 0 && tokenData[0]) {
            const {tokenData} = this.props;
      const self = this;
      const {transferAmount} = this.state;

      this.setState({selectedTransferToken: tokenData[0], selectedReceiveToken: tokenData[1]});
      self.getConversionPath(self.state.selectedTransferToken, self.state.selectedReceiveToken, transferAmount)
    }
  }
  
  transferAmountChanged = (evt) => {
    const {transferAmount} = this.state;
    const newTransferAmount = evt.target.value;
    this.setState({transferAmount: newTransferAmount});
    this.getConversionPath(this.state.selectedTransferToken, this.state.selectedReceiveToken, newTransferAmount);
  }
    
  render() {

    const {showTransaferSelect, selectedTransferToken, selectedReceiveToken, showReceiveSelect,
      transferAmount, receiveAmount, tokenData, toAmount
    } = this.state;

    let transferFromTokenSelect = <span/>;
    let receiveToTokenSelect = <span/>;
    
    if (showTransaferSelect) {
        transferFromTokenSelect = 
        (<div className="token-select-dropdown">
          <TokenSuggestionList tokenData={tokenData} tokenSelectChanged={this.transferSelectChanged}/>
        </div>
        )
    }
    if (showReceiveSelect) {
      receiveToTokenSelect = (
        <div className="token-select-dropdown">
          <TokenSuggestionList tokenData={tokenData} tokenSelectChanged={this.receiveSelectChanged}/>
        </div>        
        )
    }


    if (tokenData.length === 0 ||  selectedTransferToken === undefined ||  selectedReceiveToken === undefined) {
      return <div>Loading</div>;
    }
    
    return (
      <div className="swap-token-container">
        <div className="card">
          <div className="text">
          <Row>
          <Col lg={5}>
              <div className="h4 token-transfer-label">Transfer </div>
            <div className="token-label-amount-container">
               <Row>
               <Col lg={4} className="token-label-select-col">
               <div className="token-label-container" onClick={this.openTransferSelectDropdown}>
                 <img src={selectedTransferToken.imageURI} className="token-preview-image"/>
                 <div className="token-preview-text">{selectedTransferToken.symbol}</div>
                 <FontAwesomeIcon icon={faChevronCircleDown} className="dropdown-circle"/>
               </div>
               {transferFromTokenSelect}
               </Col>
               <Col lg={8} className="token-amount-col">
                <Form.Control size="sm" type="number" placeholder="Amount" onChange={this.transferAmountChanged} value={transferAmount}/>
               </Col>
               </Row>
              </div>
            </Col>
          <Col lg={2}>
          <div className="token-transfer-arrow-container">
          <div>
          <FontAwesomeIcon icon={faArrowLeft} className="arrow-container"/>
          </div>
          <div className="bottom-arrow-container arrow-container">
          <FontAwesomeIcon icon={faArrowRight}/>
         </div>
          </div>
          </Col>
          <Col lg={5}>
            <div className="h4 token-transfer-label">Receive</div>
            <div className="token-label-amount-container">
               <Row>
                   <Col lg={4} className="token-label-select-col">
                   <div className="token-label-container" onClick={this.openReceiveSelectDropdown}>
                     <img src={selectedReceiveToken.imageURI} className="token-preview-image"/>
                     <div className="token-preview-text">{selectedReceiveToken.symbol}</div>
                     <FontAwesomeIcon icon={faChevronCircleDown} className="dropdown-circle"/>
                   </div>
                   {receiveToTokenSelect}
                   </Col>
                   <Col lg={8} className="token-amount-col">
                    <Form.Control size="sm" type="text" placeholder="Amount" value={toAmount}/>
                   </Col>
               </Row>
              </div>
           </Col>
           </Row>
          </div>
        </div>
  </div>
      
      )
  }
}


class TokenSuggestionList extends Component {
  constructor() {
    super();
    const self = this;
    this.state = {
      value: '',
      suggestions: []
    };
  }
  componentDidMount() {
    const self = this;
  }
  onChange = (event, { newValue }) => {
    this.setState({
      value: newValue
    });
  };

  getSuggestions = (value) => {
    const {tokenData} = this.props;

    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
  
    return inputLength === 0 ? [] : tokenData.filter(token =>
      token.name.toLowerCase().slice(0, inputLength) === inputValue || token.symbol.toLowerCase().slice(0, inputLength) === inputValue 
    );    
  }

  onSuggestionsFetchRequested = ({ value }) => {
    const self = this;
    this.setState({
      suggestions: self.getSuggestions(value)
    });
  };


  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  renderSuggestion = (suggestion) => {
     return (
      <div className="token-label-container">
         <img src={suggestion.imageURI} className="token-preview-image"/>
         <div className="token-preview-text">{suggestion.symbol}</div>
       </div>
       )
  }
  
  getSuggestionValue = (suggestion) => {
    this.props.tokenSelectChanged(suggestion);
    return suggestion.symbol;  
  }
  
  render() {
    const { value, suggestions } = this.state;

    // Autosuggest will pass through all these props to the input.
    const inputProps = {
      placeholder: 'Search for a token',
      value,
      onChange: this.onChange
    };
    return (
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        getSuggestionValue={this.getSuggestionValue}
        renderSuggestion={this.renderSuggestion}
        inputProps={inputProps}
      />
    );
  }
}