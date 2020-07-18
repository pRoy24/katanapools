import React, {Component} from 'react';
import {Row, ButtonGroup, Button, Col} from 'react-bootstrap';

export default class CreateNewPoolToolbar extends Component {
  v1PoolSelected = () => {
    this.setState({isBasicActive: 'active-btn', isAdvancedActive: ''});
    this.props.setCurrentPoolView("v1");    
  }
  
  v2PoolSelected = () => {
    this.setState({isBasicActive: 'active-btn', isAdvancedActive: ''});
    this.props.setCurrentPoolView("v2");
  }
  render() {
    const {poolCreationHeader} = this.props;
    return (
      <div>
        <Row className="toolbar-row">
          <Col lg={8} xs={8}>
            <div className="h5 page-header left-align-text">
              {poolCreationHeader}
            </div>
          </Col>
          <Col lg={4} xs={4}>
             <ButtonGroup className={`explore-tokens-toolbar-btngroup`}>
              <Button className={"explore-toolbar-btn"} onClick={this.v1PoolSelected}>
                V1 Pool
              </Button>
              <Button className={"explore-toolbar-btn"} onClick={this.v2PoolSelected}>
               V2 Pool
              </Button>
             </ButtonGroup>
          </Col>
        </Row>
      </div>
      )
  }
}