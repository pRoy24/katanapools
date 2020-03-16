import React, {Component} from 'react';
import {Container, Row, Col, Button} from 'react-bootstrap';



import CreateNewPoolContainer from './create_pool/CreateNewPoolContainer';
import './pool.scss';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import ViewPoolsContainer from './view_pools/ViewPoolsContainer';
import {getConvertibleTokensBySmartTokens} from '../../utils/ConverterUtils';

var RegistryUtils = require('../../utils/RegistryUtils');
const BancorConverter = require('../../contracts/BancorConverter.json');

export default class PoolTokens extends Component {
  constructor(props) {
    super(props);
    this.state = {poolData: [], currentView: 'select'};
  }
  
  setCurrentView = (newView) => {
      this.setState({currentView: newView}); 
  }
  
  componentWillMount() {
    this.web3 = window.web3;
    const self = this;
    RegistryUtils.getConverterRegistryAddress().then(function(converterContractRegistryAddress){
      RegistryUtils.getSmartTokens(converterContractRegistryAddress).then(function(smartTokenList){
        
        
         getConvertibleTokensBySmartTokens().then(function(smartToConvertibleMap){
           
        let poolData = 
          smartTokenList.map(function(smartToken){
            
          return RegistryUtils.getConverterAddressList(converterContractRegistryAddress, [smartToken]).then(function(converters){
            return RegistryUtils.getERC20DData(smartToken).then(function(tokenData){
              
              let convertibleTokensForSmartToken = smartToConvertibleMap.find(function(mapCell){
                return mapCell.address === tokenData.address;
              })

              let reservesForToken = convertibleTokensForSmartToken.reserves.map(function(res){
                return {address: res}
              });
              
              const converterAddress = converters[0];

              let tokenDataWithReserves = Object.assign({}, tokenData, {reserves: reservesForToken});
              
              return Object.assign({}, tokenDataWithReserves, {'converter': converterAddress});

            })
          }).catch(function(err){
                return null;
            })
        });

        Promise.all(poolData).then(function(poolDataResponse){
          poolDataResponse = poolDataResponse.filter(Boolean);

          self.setState({poolData: poolDataResponse})
        });
      });
      })
      
 
    })
  }
  
  render() {

  const {poolData,} = this.state;

  return (
    <div>
      <Container>
          <Switch>
          <Route path="/pool/create">
            <CreateNewPoolContainer/>
          </Route>
          <Route path="/pool/view">
            <ViewPoolsContainer poolData={poolData}/>
          </Route>
        </Switch>  
       </Container>
    </div>
    )
  }
}