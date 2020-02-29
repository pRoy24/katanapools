import React, {Component} from 'react';
import {Container, Row, Col, Form} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'

export default class ViewPoolToolbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchInput: ''
    }
  }
  searchInputChanged  = (evt) => {
    const searchVal = evt.target.value;
    this.props.filterInputList(searchVal);
    this.setState({searchInput: searchVal});
  }
  render() {
    const {searchInput} = this.state;
    return (
      <div>
      <Row className="toolbar-row">
        <Col lg={2}>
              <div className="h4 left-align-text">View pools</div>
        </Col>
        <Col lg={6}>
          <Form.Control type="text" placeholder="search by pool token name or symbol" onChange={this.searchInputChanged} value={searchInput}/>
          <FontAwesomeIcon icon={faSearch} className="search-icon"/>
        </Col>
      </Row>
      </div>
      
      )
  }
}