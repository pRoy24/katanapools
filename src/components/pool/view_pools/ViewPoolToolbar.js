import React, {Component} from 'react';
import {Container, Row, Col, Form, ButtonGroup, Button} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'

export default class ViewPoolToolbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchInput: '', isAllActive: 'active-toolbar-btn', isV1Active: '', isV2Active: ''
    }
  }
  searchInputChanged  = (evt) => {
    const searchVal = evt.target.value;
    this.props.filterInputList(searchVal);
    this.setState({searchInput: searchVal});
  }
  
  componentWillReceiveProps(nextProps) {
    const {currentViewPoolType} = nextProps;
    if (this.props.currentViewPoolType !== currentViewPoolType) {
      let isAllActive = '';
      let isV1Active = '';
      let isV2Active = '';
      if (currentViewPoolType === 'all') {
        isAllActive = 'active-toolbar-btn';
      }
      if (currentViewPoolType === 'v1') {
        isV1Active = 'active-toolbar-btn';
      }
      if (currentViewPoolType === 'v2') {
        isV2Active = 'active-toolbar-btn';
      }
      this.setState({
        'isAllActive': isAllActive,
        'isV1Active': isV1Active,
        'isV2Active': isV2Active
      })
    }
  }
  
  setPoolTypeSelected = (type) => {
    this.props.setPoolTypeSelected(type);
  }
  render() {
    const {searchInput, isAllActive, isV1Active, isV2Active, } = this.state;
    const {currentViewPoolType} = this.props;

    return (
      <div>
      <Row className="toolbar-row">
        <Col lg={2}>
              <div className="h5 page-header left-align-text">View pools</div>
        </Col>
        <Col lg={6}>
          <Form.Control type="text" placeholder="search by pool token name or symbol" onChange={this.searchInputChanged} value={searchInput}/>
          <FontAwesomeIcon icon={faSearch} className="search-icon"/>
        </Col>
        <Col lg={4}>
          <ButtonGroup aria-label="Basic example">
              <Button className={`explore-toolbar-btn ${isAllActive}`} onClick={()=>this.setPoolTypeSelected('all')}>All Pools</Button>
              <Button className={`explore-toolbar-btn ${isV1Active}`} onClick={()=>this.setPoolTypeSelected('v1')}>V1 Pools</Button>
              <Button className={`explore-toolbar-btn ${isV2Active}`} onClick={()=>this.setPoolTypeSelected('v2')}>V2 Pools</Button>
            </ButtonGroup>
        </Col>
      </Row>
      </div>
      
      )
  }
}