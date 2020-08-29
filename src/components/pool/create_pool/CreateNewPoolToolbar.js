import React, {Component} from 'react';
import {Row, ButtonGroup, Button, Col} from 'react-bootstrap';

export default class CreateNewPoolToolbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      'isV1Active': '',
      'isV2Active': 'active-btn'
    }
  }
  v1PoolSelected = () => {
    this.setState({isV1Active: 'active-btn', isV2Active: '', isAdvancedActive: ''});
    this.props.setCurrentPoolView("v1");    
  }
  
  v2PoolSelected = () => {
    this.setState({isV2Active: 'active-btn', isV1Active: '', isAdvancedActive: ''});
    this.props.setCurrentPoolView("v2");
  }
  render() {
    const {poolCreationHeader} = this.props;
    const {isV2Active, isV1Active} = this.state;
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
              <Button className={`explore-toolbar-btn ${isV2Active}`} onClick={this.v2PoolSelected}>
               V2 Pool
              </Button>             
              <Button className={`explore-toolbar-btn ${isV1Active}`} onClick={this.v1PoolSelected}>
                V1 Pool
              </Button>
             </ButtonGroup>
          </Col>
        </Row>
      </div>
      )
  }
}