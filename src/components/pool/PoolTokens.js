import React, {Component} from 'react';
import {Container,} from 'react-bootstrap';

import CreateNewPoolContainer from './create_pool/CreateNewPoolContainer';
import './pool.scss';
import {
  Switch,
  Route,
} from "react-router-dom";
import ViewPoolsContainer from './view_pools/ViewPoolsContainer';

export default class PoolTokens extends Component {
  constructor(props) {
    super(props);
    this.state = {poolData: []};
  }

  componentWillMount() {
    this.props.getAllSmartTokens();
  }

  render() {
  const {smartTokensWithReserves} = this.props;

  return (
    <div>
      <Container>
          <Switch>
          <Route path="/pool/create">
            <CreateNewPoolContainer getSmartTokensWithSymbols={this.props.getAllSmartTokens}/>
          </Route>
          <Route exact path="/pool/view">
            <ViewPoolsContainer smartTokensWithReserves={smartTokensWithReserves}/>
          </Route>
          <Route path="/pool/view/:token">
            <ViewPoolsContainer smartTokensWithReserves={smartTokensWithReserves}/>
          </Route>
        </Switch>
       </Container>
    </div>
    )
  }
}