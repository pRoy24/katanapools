import React, {Component} from 'react';
import {Container, Row, Col, ListGroup, ListGroupItem} from 'react-bootstrap';
import ExploreTokensToolbar from './ExploreTokensToolbar';
import './explore.scss';
import ViewPaths from './view_paths/ViewPaths';

import {isEmptyArray, isNonEmptyArray} from '../../utils/ObjectUtils';


export default class ExploreTokens extends Component {
    componentWillMount() {
        const {tokens: {convertibleTokens}}  = this.props;
      if (isNonEmptyArray(convertibleTokens)) {
          
            this.fetchTokenPathsWithRates(convertibleTokens[0], convertibleTokens[1]);
      }
      
    }
    
    componentWillReceiveProps(nextProps) {
        const {tokens: {convertibleTokens}}  = nextProps;
        if (isEmptyArray(this.props.tokens.convertibleTokens) && isNonEmptyArray(convertibleTokens)) {
            this.fetchTokenPathsWithRates(convertibleTokens[0], convertibleTokens[1]);
        }
    }
    
    fetchTokenPathsWithRates(fromToken, toToken) {
        const {tokens: {convertibleTokensBySmartTokens}} = this.props;
        this.props.fetchTokenPathsWithRates(fromToken, toToken, convertibleTokensBySmartTokens);
    }
    
    render() {
        const {tokens: {convertibleTokens, pathListWithRate}} = this.props;

        let fromTokenSelector = convertibleTokens.map(function(item, idx){
            let itemName =  item.name.length > 10 ? item.name.substr(0, 10) + "..." :  item.name;
            return (<ListGroupItem key={`from-${idx}`}>
            <div>
            <img src={item.imageURI} className="symbol-image"/>
            <div className="item-symbol">{item.symbol}</div>
            </div>
            <div>
               {itemName}
            </div>
            </ListGroupItem>)
        });
        
        let toTokenSelector = convertibleTokens.map(function(item, idx){
            let itemName =  item.name.length > 10 ? item.name.substr(0, 10) + "..." :  item.name;
            return (<ListGroupItem key={`to-${idx}`}>
            <div>
            <img src={item.imageURI} className="symbol-image"/>
            <div className="item-symbol">{item.symbol}</div>
            </div>
            <div>
               {itemName}
            </div>
            </ListGroupItem>)
        });
        return (
            <div>
            <ExploreTokensToolbar/>
            <Container className="explore-tokens-container">
           
            <div className="h4">Explore tokens and conversions paths</div>
            <div>
              View Paths
            </div>
             <Row>
             <Col lg={2}>
               <ListGroup>
               
               {fromTokenSelector}
               </ListGroup>
             </Col>
             <Col lg={8}>
               <ViewPaths pathListWithRate={pathListWithRate}/>
             </Col>
             <Col lg={2}>
                 <ListGroup>
               {toTokenSelector}
                    </ListGroup>
             </Col>
            </Row>
            </Container>
            </div>
            )
    }
}