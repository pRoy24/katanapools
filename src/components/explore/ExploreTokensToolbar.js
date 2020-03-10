import React, {Component} from 'react';
import {Form} from 'react-bootstrap';

export default class ExploreTokensToolbar extends Component {
    render() {
        return (
            <div>
              <Form.Control type="text" placeholder="Search" />
            </div>
            )
    }
}