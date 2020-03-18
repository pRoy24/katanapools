import React, {Component} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboard } from '@fortawesome/free-solid-svg-icons';
import './common.scss';
import {CopyToClipboard} from 'react-copy-to-clipboard';

export default class AddressDisplay extends Component {
  render() {
  const {address} = this.props;
  let addressDisplay = address.substr(0, 5) + "...." + address.substr(address.length - 6, address.length - 1);
    return (
      <div className="address-display-container">
        {addressDisplay} 
        <span className="copy-clipboard-icon">
          <CopyToClipboard text={address} onCopy={() => this.setState({copied: true})}>
            <FontAwesomeIcon icon={faClipboard}/>
          </CopyToClipboard>
        </span>
      </div>
      )
  }
}