import React, {Component} from 'react';
import {Switch, Route} from 'react-router-dom';
import ReserveRatio from './ReserveRatio';
import './help.scss';

export default class HelpComponent extends Component {
  render() {
    return (
      <div>
          <Switch>
          <Route path="/help/reserveratio">
            <ReserveRatio/>
          </Route>
        </Switch>
      </div>
      )
  }
}