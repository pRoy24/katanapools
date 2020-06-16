import React, {Component} from 'react';
import {Container, Row, Col, FormControl, Button, Form} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AddressDisplay from '../../common/AddressDisplay';
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import {isNonEmptyArray, isEmptyArray, isEmptyObject, isNonEmptyObject} from '../../../utils/ObjectUtils';
import {toDecimals} from '../../../utils/eth';

const ConverterData = {
  "blockHash": "0x31dd6c2b92f68ffe5f6694e02da23c31864859db7ec4064b892d6b2ab8702f9b",
  "blockNumber": 8098656,
  "contractAddress": null,
  "cumulativeGasUsed": 5924336,
  "from": "0x1335e0750d74b21a837ccbd4d1a7e30699001848",
  "gasUsed": 5723619,
  "logsBloom": "0x00040040000000000020000044000000000000001000040000000000000000002008000000000000000000000000000000000000000000000004200000000000000001000000000000000000000000000006082000000002000000000000000000000200008100000080000000040080000000400000000000000000080000000000000000000000000000000000000000000000000020002000000001000000100200000000020000200000020000040000000000020000100000a000000000200000000100000000000011000000000a0000000080000800000080000000000400000800000000000400000000400002000000040000000000000000000010",
  "status": true,
  "to": "0x4d28ae774d1e938cf3c54905c766dd6d68182968",
  "transactionHash": "0x9ab69dcdd03f299d5eaea9c43eec2577226002e17f9971b24d602373a1450ab1",
  "transactionIndex": 2,
  "events": {
    "0": {
      "address": "0x84C098049386BAaB0a7a35A0866e12c783800049",
      "blockHash": "0x31dd6c2b92f68ffe5f6694e02da23c31864859db7ec4064b892d6b2ab8702f9b",
      "blockNumber": 8098656,
      "logIndex": 6,
      "removed": false,
      "transactionHash": "0x9ab69dcdd03f299d5eaea9c43eec2577226002e17f9971b24d602373a1450ab1",
      "transactionIndex": 2,
      "id": "log_da3ca2f2",
      "returnValues": {},
      "signature": null,
      "raw": {
        "data": "0x",
        "topics": [
          "0xb54eb8f70476910bea510b4ca1ece1fdb11eeb345b0d46221dd40ba86e649533",
          "0x00000000000000000000000018b1567c6aac1fcb04cf8855fd7ae7c4a47f23de",
          "0x0000000000000000000000004d28ae774d1e938cf3c54905c766dd6d68182968"
        ]
      }
    },
    "1": {
      "address": "0x18b1567c6aAc1FCb04Cf8855fD7Ae7C4A47f23dE",
      "blockHash": "0x31dd6c2b92f68ffe5f6694e02da23c31864859db7ec4064b892d6b2ab8702f9b",
      "blockNumber": 8098656,
      "logIndex": 10,
      "removed": false,
      "transactionHash": "0x9ab69dcdd03f299d5eaea9c43eec2577226002e17f9971b24d602373a1450ab1",
      "transactionIndex": 2,
      "id": "log_f81da956",
      "returnValues": {},
      "signature": null,
      "raw": {
        "data": "0x0000000000000000000000002216da026fb88ad7dfac7b72b8942832eb823cb30000000000000000000000000000000000000000000000000000000000000001",
        "topics": [
          "0xa170412ae067fdeca19fd2204ce7eb66f723d827f4af15433b6f33f7fdc642bb"
        ]
      }
    },
    "OwnerUpdate": [
      {
        "address": "0x18b1567c6aAc1FCb04Cf8855fD7Ae7C4A47f23dE",
        "blockHash": "0x31dd6c2b92f68ffe5f6694e02da23c31864859db7ec4064b892d6b2ab8702f9b",
        "blockNumber": 8098656,
        "logIndex": 5,
        "removed": false,
        "transactionHash": "0x9ab69dcdd03f299d5eaea9c43eec2577226002e17f9971b24d602373a1450ab1",
        "transactionIndex": 2,
        "id": "log_63332d80",
        "returnValues": {
          "0": "0xdC094Ee2002FE7E20988D7b1b2464DdEBC5a11Ac",
          "1": "0x84C098049386BAaB0a7a35A0866e12c783800049",
          "_prevOwner": "0xdC094Ee2002FE7E20988D7b1b2464DdEBC5a11Ac",
          "_newOwner": "0x84C098049386BAaB0a7a35A0866e12c783800049"
        },
        "event": "OwnerUpdate",
        "signature": "0x343765429aea5a34b3ff6a3785a98a5abb2597aca87bfbb58632c173d585373a",
        "raw": {
          "data": "0x",
          "topics": [
            "0x343765429aea5a34b3ff6a3785a98a5abb2597aca87bfbb58632c173d585373a",
            "0x000000000000000000000000dc094ee2002fe7e20988d7b1b2464ddebc5a11ac",
            "0x00000000000000000000000084c098049386baab0a7a35a0866e12c783800049"
          ]
        }
      },
      {
        "address": "0x2216DA026FB88AD7DfAc7B72b8942832EB823cB3",
        "blockHash": "0x31dd6c2b92f68ffe5f6694e02da23c31864859db7ec4064b892d6b2ab8702f9b",
        "blockNumber": 8098656,
        "logIndex": 7,
        "removed": false,
        "transactionHash": "0x9ab69dcdd03f299d5eaea9c43eec2577226002e17f9971b24d602373a1450ab1",
        "transactionIndex": 2,
        "id": "log_8879ff77",
        "returnValues": {
          "0": "0x84C098049386BAaB0a7a35A0866e12c783800049",
          "1": "0x4d28Ae774D1E938cF3C54905C766dD6D68182968",
          "_prevOwner": "0x84C098049386BAaB0a7a35A0866e12c783800049",
          "_newOwner": "0x4d28Ae774D1E938cF3C54905C766dD6D68182968"
        },
        "event": "OwnerUpdate",
        "signature": "0x343765429aea5a34b3ff6a3785a98a5abb2597aca87bfbb58632c173d585373a",
        "raw": {
          "data": "0x",
          "topics": [
            "0x343765429aea5a34b3ff6a3785a98a5abb2597aca87bfbb58632c173d585373a",
            "0x00000000000000000000000084c098049386baab0a7a35a0866e12c783800049",
            "0x0000000000000000000000004d28ae774d1e938cf3c54905c766dd6d68182968"
          ]
        }
      },
      {
        "address": "0x18b1567c6aAc1FCb04Cf8855fD7Ae7C4A47f23dE",
        "blockHash": "0x31dd6c2b92f68ffe5f6694e02da23c31864859db7ec4064b892d6b2ab8702f9b",
        "blockNumber": 8098656,
        "logIndex": 8,
        "removed": false,
        "transactionHash": "0x9ab69dcdd03f299d5eaea9c43eec2577226002e17f9971b24d602373a1450ab1",
        "transactionIndex": 2,
        "id": "log_331c2abe",
        "returnValues": {
          "0": "0x84C098049386BAaB0a7a35A0866e12c783800049",
          "1": "0x4d28Ae774D1E938cF3C54905C766dD6D68182968",
          "_prevOwner": "0x84C098049386BAaB0a7a35A0866e12c783800049",
          "_newOwner": "0x4d28Ae774D1E938cF3C54905C766dD6D68182968"
        },
        "event": "OwnerUpdate",
        "signature": "0x343765429aea5a34b3ff6a3785a98a5abb2597aca87bfbb58632c173d585373a",
        "raw": {
          "data": "0x",
          "topics": [
            "0x343765429aea5a34b3ff6a3785a98a5abb2597aca87bfbb58632c173d585373a",
            "0x00000000000000000000000084c098049386baab0a7a35a0866e12c783800049",
            "0x0000000000000000000000004d28ae774d1e938cf3c54905c766dd6d68182968"
          ]
        }
      },
      {
        "address": "0x2216DA026FB88AD7DfAc7B72b8942832EB823cB3",
        "blockHash": "0x31dd6c2b92f68ffe5f6694e02da23c31864859db7ec4064b892d6b2ab8702f9b",
        "blockNumber": 8098656,
        "logIndex": 9,
        "removed": false,
        "transactionHash": "0x9ab69dcdd03f299d5eaea9c43eec2577226002e17f9971b24d602373a1450ab1",
        "transactionIndex": 2,
        "id": "log_32b90b91",
        "returnValues": {
          "0": "0x4d28Ae774D1E938cF3C54905C766dD6D68182968",
          "1": "0x18b1567c6aAc1FCb04Cf8855fD7Ae7C4A47f23dE",
          "_prevOwner": "0x4d28Ae774D1E938cF3C54905C766dD6D68182968",
          "_newOwner": "0x18b1567c6aAc1FCb04Cf8855fD7Ae7C4A47f23dE"
        },
        "event": "OwnerUpdate",
        "signature": "0x343765429aea5a34b3ff6a3785a98a5abb2597aca87bfbb58632c173d585373a",
        "raw": {
          "data": "0x",
          "topics": [
            "0x343765429aea5a34b3ff6a3785a98a5abb2597aca87bfbb58632c173d585373a",
            "0x0000000000000000000000004d28ae774d1e938cf3c54905c766dd6d68182968",
            "0x00000000000000000000000018b1567c6aac1fcb04cf8855fd7ae7c4a47f23de"
          ]
        }
      }
    ],
    "ConverterAnchorAdded": {
      "address": "0x4d28Ae774D1E938cF3C54905C766dD6D68182968",
      "blockHash": "0x31dd6c2b92f68ffe5f6694e02da23c31864859db7ec4064b892d6b2ab8702f9b",
      "blockNumber": 8098656,
      "logIndex": 11,
      "removed": false,
      "transactionHash": "0x9ab69dcdd03f299d5eaea9c43eec2577226002e17f9971b24d602373a1450ab1",
      "transactionIndex": 2,
      "id": "log_f026d870",
      "returnValues": {
        "0": "0x2216DA026FB88AD7DfAc7B72b8942832EB823cB3",
        "_anchor": "0x2216DA026FB88AD7DfAc7B72b8942832EB823cB3"
      },
      "event": "ConverterAnchorAdded",
      "signature": "0xc0a6d303d67b7ed9fa0abae1c48878df32acc0e7ca4334c7dad2bceeee5956fd",
      "raw": {
        "data": "0x",
        "topics": [
          "0xc0a6d303d67b7ed9fa0abae1c48878df32acc0e7ca4334c7dad2bceeee5956fd",
          "0x0000000000000000000000002216da026fb88ad7dfac7b72b8942832eb823cb3"
        ]
      }
    },
    "SmartTokenAdded": {
      "address": "0x4d28Ae774D1E938cF3C54905C766dD6D68182968",
      "blockHash": "0x31dd6c2b92f68ffe5f6694e02da23c31864859db7ec4064b892d6b2ab8702f9b",
      "blockNumber": 8098656,
      "logIndex": 12,
      "removed": false,
      "transactionHash": "0x9ab69dcdd03f299d5eaea9c43eec2577226002e17f9971b24d602373a1450ab1",
      "transactionIndex": 2,
      "id": "log_b33cfd8e",
      "returnValues": {
        "0": "0x2216DA026FB88AD7DfAc7B72b8942832EB823cB3",
        "_smartToken": "0x2216DA026FB88AD7DfAc7B72b8942832EB823cB3"
      },
      "event": "SmartTokenAdded",
      "signature": "0x88881feecdf61136ac4bdb1f681f2f3746a82910263d21ffea94750d2a78c0ab",
      "raw": {
        "data": "0x",
        "topics": [
          "0x88881feecdf61136ac4bdb1f681f2f3746a82910263d21ffea94750d2a78c0ab",
          "0x0000000000000000000000002216da026fb88ad7dfac7b72b8942832eb823cb3"
        ]
      }
    },
    "LiquidityPoolAdded": {
      "address": "0x4d28Ae774D1E938cF3C54905C766dD6D68182968",
      "blockHash": "0x31dd6c2b92f68ffe5f6694e02da23c31864859db7ec4064b892d6b2ab8702f9b",
      "blockNumber": 8098656,
      "logIndex": 13,
      "removed": false,
      "transactionHash": "0x9ab69dcdd03f299d5eaea9c43eec2577226002e17f9971b24d602373a1450ab1",
      "transactionIndex": 2,
      "id": "log_27b050b4",
      "returnValues": {
        "0": "0x2216DA026FB88AD7DfAc7B72b8942832EB823cB3",
        "_liquidityPool": "0x2216DA026FB88AD7DfAc7B72b8942832EB823cB3"
      },
      "event": "LiquidityPoolAdded",
      "signature": "0xb893f883ef734b712208a877459424ee509832c57e0461fb1ac99ed4d42f2d89",
      "raw": {
        "data": "0x",
        "topics": [
          "0xb893f883ef734b712208a877459424ee509832c57e0461fb1ac99ed4d42f2d89",
          "0x0000000000000000000000002216da026fb88ad7dfac7b72b8942832eb823cb3"
        ]
      }
    },
    "ConvertibleTokenAdded": [
      {
        "address": "0x4d28Ae774D1E938cF3C54905C766dD6D68182968",
        "blockHash": "0x31dd6c2b92f68ffe5f6694e02da23c31864859db7ec4064b892d6b2ab8702f9b",
        "blockNumber": 8098656,
        "logIndex": 14,
        "removed": false,
        "transactionHash": "0x9ab69dcdd03f299d5eaea9c43eec2577226002e17f9971b24d602373a1450ab1",
        "transactionIndex": 2,
        "id": "log_d652d37b",
        "returnValues": {
          "0": "0xc74bE418ADf788a04dB7d23E3916f332B74A9617",
          "1": "0x2216DA026FB88AD7DfAc7B72b8942832EB823cB3",
          "_convertibleToken": "0xc74bE418ADf788a04dB7d23E3916f332B74A9617",
          "_smartToken": "0x2216DA026FB88AD7DfAc7B72b8942832EB823cB3"
        },
        "event": "ConvertibleTokenAdded",
        "signature": "0xf2e7cf6d6ed3f77039511409a43d4fa5108f09ab71d72b014380364c910233a5",
        "raw": {
          "data": "0x",
          "topics": [
            "0xf2e7cf6d6ed3f77039511409a43d4fa5108f09ab71d72b014380364c910233a5",
            "0x000000000000000000000000c74be418adf788a04db7d23e3916f332b74a9617",
            "0x0000000000000000000000002216da026fb88ad7dfac7b72b8942832eb823cb3"
          ]
        }
      },
      {
        "address": "0x4d28Ae774D1E938cF3C54905C766dD6D68182968",
        "blockHash": "0x31dd6c2b92f68ffe5f6694e02da23c31864859db7ec4064b892d6b2ab8702f9b",
        "blockNumber": 8098656,
        "logIndex": 15,
        "removed": false,
        "transactionHash": "0x9ab69dcdd03f299d5eaea9c43eec2577226002e17f9971b24d602373a1450ab1",
        "transactionIndex": 2,
        "id": "log_917c2352",
        "returnValues": {
          "0": "0x20fE562d797A42Dcb3399062AE9546cd06f63280",
          "1": "0x2216DA026FB88AD7DfAc7B72b8942832EB823cB3",
          "_convertibleToken": "0x20fE562d797A42Dcb3399062AE9546cd06f63280",
          "_smartToken": "0x2216DA026FB88AD7DfAc7B72b8942832EB823cB3"
        },
        "event": "ConvertibleTokenAdded",
        "signature": "0xf2e7cf6d6ed3f77039511409a43d4fa5108f09ab71d72b014380364c910233a5",
        "raw": {
          "data": "0x",
          "topics": [
            "0xf2e7cf6d6ed3f77039511409a43d4fa5108f09ab71d72b014380364c910233a5",
            "0x00000000000000000000000020fe562d797a42dcb3399062ae9546cd06f63280",
            "0x0000000000000000000000002216da026fb88ad7dfac7b72b8942832eb823cb3"
          ]
        }
      }
    ]
  }
}


export default class PoolReceipt extends Component {
  constructor(props) {
    super(props);
    this.state = {setConversionFeeVisible: false, setFundingDisplayVisible: false, conversionFee: 0,
      reserves:[]
    };
  }
  
  conversionFeeUpdated = (evt) => {
    this.setState({conversionFee: evt.target.value});
  }
  
  componentWillReceiveProps(nextProps) {
      const {pool: {createPool}} = nextProps;
      if (isNonEmptyObject(createPool) && isEmptyObject(this.props.pool.createPool) && createPool.reserves.length > 0) {
        
        const reserveList = createPool.reserves.map(function(rItem){
          return Object.assign({}, rItem, {amount: 0});
        });
        this.setState({reserves: reserveList});
      }
  }
  
  componentWillMount() {
    const {pool: {relayConverterStatus}} = this.props;
    console.log(relayConverterStatus);
    const self = this;
    const converterAddress = ConverterData.events["1"].address;
    const smartTokenAddress = ConverterData.events.SmartTokenAdded.returnValues._smartToken;

        const convertibleTokens = ConverterData.events.ConvertibleTokenAdded.map(function(item){
          return item.returnValues._convertibleToken;
        })
        
    setTimeout(function(){
       self.props.fetchPoolDetails({'pool': smartTokenAddress, 'converter': converterAddress, 'reserves': convertibleTokens})
       
    }, 4000);
  }
    
    toggleExpandSetConversionFee = () => {
      this.setState({setConversionFeeVisible: !this.state.setConversionFeeVisible});
    }
    
    toggleExpandSetFunding = () => {
      this.setState({setFundingDisplayVisible: !this.state.setFundingDisplayVisible});
    }
    
    updateConversionFee =() => {
          const {pool: {relayConverterStatus, activationStatus, createPool}} = this.props;
      const {conversionFee} = this.state;
      const converterAddress = ConverterData.events["1"].address;
      this.props.setConversionFee(converterAddress, conversionFee);    
    }
    
    updateTokenAmount = (amount, idx) => {
      let {reserves} = this.state;
      reserves[idx].amount = amount;
      this.setState({reserves: reserves});
    }
    
    updatePoolFunding = () => {
      const {reserves} = this.state;
          const {pool: {relayConverterStatus, activationStatus, createPool}} = this.props;
      const converterAddress = ConverterData.events["1"].address;
      const reserveMap = reserves.map(function(item){
        return item.data.address;
      });
      const amountMap = reserves.map(function(item){
        console.log(item)
        return toDecimals(item.amount, item.data.decimals);
      });
      console.log(reserveMap);
      console.log(amountMap);
      this.props.approveAndFundPool(reserveMap, amountMap, converterAddress);
    }
    
    render() {
        const {pool: {createPool, relayConverterStatus}} = this.props;
        const {setConversionFeeVisible, setFundingDisplayVisible, conversionFee, reserves} = this.state;
        const converterAddress = ConverterData.events["1"].address;
        const smartTokenAddress = ConverterData.events.SmartTokenAdded.returnValues._smartToken; 

        let reserveDetails = <span/>;
        if (createPool && reserves.length > 0) {
          reserveDetails = createPool.reserves.map(function(item, idx){
            return <Col lg={4} xs={4}>
             <div className="cell-label">{item.data.symbol}</div>
             <div className="cell-data"><AddressDisplay address={item.data.address}/></div>
            </Col>
          })
        }
        
        let conversionFeeDisplay = <span/>;
        if (setConversionFeeVisible) {
          conversionFeeDisplay = (
            <Row className="set-pool-container">
              <Col lg={10} xs={10}> 
             <Form.Control type="text" placeHolder="Set pool conversion fees, maximum 3%"
             value={conversionFee} onChange={this.conversionFeeUpdated}/>
             </Col>
             <Col lg={2} xs={2}>
             <Button onClick={this.updateConversionFee}>Update</Button>
             </Col>
            </Row>
            )
        }
        
        let fundingDisplay = <span/>;
        const self = this;
        if (setFundingDisplayVisible && reserves.length > 0) {
          fundingDisplay = (
            <Row className="set-pool-container">
              {createPool.reserves.map(function(item, idx) {
                return <Col lg={12} xs={12}>
                <TokenAmountRow item={item.data} idx={idx} updateTokenAmount={self.updateTokenAmount}/>
                </Col>
              })}
             <Col lg={2} xs={2}>
             <Button onClick={this.updatePoolFunding}>Update</Button>
             </Col>
            </Row>            
            )
        }
        return (
        <div className="create-pool-form-container app-toolbar-container">
        <Container>
              <div className="header">
                Congratulations !! Your pool has been deployed successfully.
              </div>
              <div>
              <Row className="sub-header">
                <Col lg={12} xs={12}>
                  Pool Details
                </Col>
              </Row>
              <Row>
                <Col lg={6}>
                  <div className="cell-label">
                  Pool Token Address
                  </div>
                  <div className="cell-data">
                  {smartTokenAddress}
                  </div>
                </Col>
                <Col lg={6}>
                  <div className="cell-label">
                  Pool Converter Address
                  </div>
                  <div className="cell-data">
                  {converterAddress}
                  </div>
                </Col>
              </Row>
              <Row>
                <Col lg={4} xs={4}>
                  <div className="cell-label">
                  Name
                  </div>
                  <div className="cell-data">
                  {createPool.name}
                  </div>
                </Col>
                <Col lg={4} xs={4}>
                <div className="cell-label">
                  Symbol
                    </div>
                 <div className="cell-data">  
                  {createPool.symbol}
                  </div>
                </Col>
                <Col lg={4} xs={4}>
                <div className="cell-label">
                  Supply
                      </div>
                      <div className="cell-data">      
                  {createPool.supply}
                   </div>
                </Col>
              </Row>
              <Row className="sub-header">
                <Col lg={12} xs={12}>
                  Pool Reserves
                </Col>
              </Row>              
              <Row>
                  {reserveDetails}
              </Row>
              
              <Row>
                <Col lg={12} className="sub-header">
                  Next steps
                </Col>
                <Col lg={12} className="app-next-step-col">
                  <div onClick={this.toggleExpandSetConversionFee}>
                    Set Pool conversion fees <FontAwesomeIcon icon={faChevronDown} />
                  </div>
                  {conversionFeeDisplay}
                </Col>
                <Col lg={12} className="app-next-step-col">
                  <div onClick={this.toggleExpandSetFunding}>
                  Add initial pool liquidity <FontAwesomeIcon icon={faChevronDown}/>
                  </div>
                  {fundingDisplay}
                </Col>
                <Col lg={12} className="app-next-step-col">
                  <div onClick={this.gotoPoolPage}>
                  View your pool <FontAwesomeIcon icon={faChevronRight}/>
                  </div>
                </Col>
              </Row>
              </div>
              </Container>
            </div>
            )
    }
}

class TokenAmountRow extends Component {
  constructor(props) {
    super(props);
    this.state = {tokenAmount: ''};
  }
  
  tokenAmountChanged = (evt) => {
    const {idx} = this.props;
    const amount = evt.target.value;
    this.props.updateTokenAmount(amount, idx);
  }
  render() {
    const {tokenAmount} = this.props;
    const {item} = this.props;
    let tokenUSDValue = 0;
    return (
      <div>
        <Form.Group controlId="formFundingCenter" className="pool-funding-form-row">
          <Form.Label>Amount of {item.symbol} to transfer. 1 {item.symbol} = {item.price} USD.</Form.Label>
          <Form.Control type="text" placeholder="enter amount of token to transfer" value={tokenAmount}
          onChange={this.tokenAmountChanged} />
          <Form.Text className="text-muted">
            Total USD value = {tokenUSDValue}. Your wallet balance {item.senderBalance}
          </Form.Text>
        </Form.Group>
      </div>
      )
  }
}