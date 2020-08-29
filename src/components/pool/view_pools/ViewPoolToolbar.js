import React, {Component} from 'react';
import {Container, Row, Col, Form, ButtonGroup, Button} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'

export default class ViewPoolToolbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchInput: '', isAllActive: 'active-btn', isV1Active: '', isV2Active: ''
    }
  }
  searchInputChanged  = (evt) => {
    const searchVal = evt.target.value;
    this.props.filterInputList(searchVal);
    this.setState({searchInput: searchVal});
  }
  render() {
    const {searchInput,isAllActive, isV1Active, isV2Active, } = this.state;
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
  <Button className={`explore-toolbar-btn ${isAllActive}`}>All Pools</Button>
  <Button className={`explore-toolbar-btn ${isV1Active}`}>V1 Pools</Button>
  <Button className={`explore-toolbar-btn ${isV2Active}`}>V2 Pools</Button>
</ButtonGroup>
        </Col>
      </Row>
      </div>
      
      )
  }
}