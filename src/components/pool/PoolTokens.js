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
    this.state = {poolData: []};
  }


  componentWillMount() {
    const {user: {providerConnected}} = this.props;
    if (providerConnected) {
      this.props.getSmartTokensWithSymbols();
    }
  }

  componentWillReceiveProps(nextProps) {
    const {user: {providerConnected}} = nextProps;
    if (providerConnected && !this.props.user.providerConnected) {
      this.props.getSmartTokensWithSymbols();
    }


  }

  render() {
  const {smartTokensWithReserves, user: {providerConnected}} = this.props;
  if (!providerConnected) {
    return <span/>;
  }
  return (
    <div>
      <Container>
          <Switch>
          <Route path="/pool/create">
            <CreateNewPoolContainer getSmartTokensWithSymbols={this.props.getSmartTokensWithSymbols}/>
          </Route>
          <Route path="/pool/view">
            <ViewPoolsContainer smartTokensWithReserves={smartTokensWithReserves}/>
          </Route>
        </Switch>
       </Container>
    </div>
    )
  }
}