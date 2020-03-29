import React, {Component} from 'react';
import {Form, Row, Col, ButtonGroup, Button} from 'react-bootstrap';

export default class ExploreTokensToolbar extends Component {
    constructor(props) {
        super(props);
        this.state = {isBasicActive: '', isAdvancedActive: 'active-btn'};
    }

    advancedViewSelected = () => {
        this.setState({isBasicActive: '', isAdvancedActive: 'active-btn'});
        this.props.renderExploreView("advanced");
    }

    basicViewSelected = () => {
        this.setState({isBasicActive: 'active-btn', isAdvancedActive: ''});
        this.props.renderExploreView("basic");
    }

    render() {
        const {isAdvancedActive, isBasicActive} = this.state;
        return (
            <div>
                <Row className="toolbar-row">
        <Col lg={4}>
              <div className="h5 page-header left-align-text">Explore and Swap Tokens</div>
        </Col>
        <Col lg={8}>
         <ButtonGroup className={`explore-tokens-toolbar-btngroup`}>
          <Button className={`explore-toolbar-btn ${isAdvancedActive}`} onClick={this.advancedViewSelected}>
          Advanced
          </Button>
          <Button className={`explore-toolbar-btn ${isBasicActive}`} onClick={this.basicViewSelected}>
          Basic</Button>
         </ButtonGroup>
        </Col>
                </Row>
            </div>
            )
    }
}