import React, {Component} from 'react';
import {Form, Row, Col} from 'react-bootstrap';

export default class ExploreTokensToolbar extends Component {
    render() {
        return (
            <div>
                <Row className="toolbar-row">
        <Col lg={2}>
              <div className="h5 page-header left-align-text">Explore Tokens</div>
        </Col>                    
                </Row>
            </div>
            )
    }
}