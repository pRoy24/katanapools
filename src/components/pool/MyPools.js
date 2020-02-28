import React, {Component} from 'react';

export default class MyPools extends Component {
  componentWillMount() {
    console.log('my pools');
  }
  render() { 
    return (
      <div>
      <div className="h4">My pools</div>
      </div>
      )
  }
}