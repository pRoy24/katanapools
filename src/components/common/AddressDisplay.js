import React, {Component} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboard } from '@fortawesome/free-solid-svg-icons';
import './common.scss';

export default class AddressDisplay extends Component {
  render() {
  const {address} = this.props;
  let addressDisplay = address.substr(0, 5) + "...." + address.substr(address.length - 6, address.length - 1);
    return (
      <div className="address-display-container">
        {addressDisplay} 
        <span className="copy-clipboard-icon"><FontAwesomeIcon icon={faClipboard}/></span>
      </div>
      )
  }
}