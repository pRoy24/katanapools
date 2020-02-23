import React, {Component} from 'react';
import {Container, Row, Col, Button} from 'react-bootstrap';
import {getContractAddress, getLiquidityPools, getERC20DData, getConverterData, getSmartTokens, getConverterReserveTokenCount,
  getConverterAddressList, getConvertibleTokenSmartTokens
} from '../../utils/RegistryUtils';
import CurrentSelectedPool from './CurrentSelectedPool';
import PoolTokenToolbar from './PoolTokenToolbar';
import CreateNewPool from './CreateNewPool';
import './pool.scss';

export default class PoolTokens extends Component {
  constructor(props) {
    super(props);
    this.state = {poolData: [], currentSelectedPool: {}, currentView: 'select'};
  }
  
  setCurrentView = (newView) => {
      this.setState({currentView: newView}); 
  }
  
  componentWillMount() {
    this.web3 = window.web3;
            const self = this;
    getContractAddress('BancorConverterRegistry').then(function(converterContractRegistryAddress){
      getSmartTokens(converterContractRegistryAddress).then(function(smartTokenList){
        

        let poolData = 
          smartTokenList.map(function(smartToken){
            
          return getConverterAddressList(converterContractRegistryAddress, [smartToken]).then(function(converters){
            return getERC20DData(smartToken).then(function(tokenData){
                return Object.assign({}, tokenData, {'convertibles': converters});
            })
          }).catch(function(err){
                return null;
            })
        });

        Promise.all(poolData).then(function(poolDataResponse){
          poolDataResponse = poolDataResponse.filter(Boolean);
          
          self.setState({poolData: poolDataResponse, currentSelectedPool: poolDataResponse[0]})
        });
      });
      
      
 
    })
  }
  
  render() {

  const {poolData, currentSelectedPool, currentView} = this.state;

  let cardView = <span/>;
  if (currentView === 'select') {
    cardView = <CurrentSelectedPool selectedPool={currentSelectedPool}/>;
  } else if (currentView === 'create') {
    cardView = <CreateNewPool/>;
  }
  
  return (
    <div>
      <Container>
        <div>
          <PoolTokenToolbar poolData={poolData} setCurrentView={this.setCurrentView}/>
        </div>
       <div>
        {cardView}
       </div>
       </Container>
    </div>
    )
  }
}