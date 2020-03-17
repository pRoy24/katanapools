import React, {Component} from 'react';
import {Container, Row, Col, ListGroup, ListGroupItem} from 'react-bootstrap';
import ExploreTokensToolbar from './ExploreTokensToolbar';
import './explore.scss';
import ViewPaths from './view_paths/ViewPaths';

import {isEmptyArray, isNonEmptyArray} from '../../utils/ObjectUtils';


export default class ExploreTokens extends Component {
    constructor(props) {
        super(props);
        this.state = {selectedFromIdx: 0, selectedToIdx: 1};
    }
    componentWillMount() {
        const {tokens: {convertibleTokens}}  = this.props;
        if (isNonEmptyArray(convertibleTokens)) {
            this.fetchTokenPathsWithRates(convertibleTokens[0], convertibleTokens[1], 'from', 1);
            this.fetchTokenPathsWithRates(convertibleTokens[1], convertibleTokens[0], 'to', 1);
        }
    }
    
    componentWillReceiveProps(nextProps) {
        const {tokens: {convertibleTokens}}  = nextProps;

        if (isEmptyArray(this.props.tokens.convertibleTokens) && isNonEmptyArray(convertibleTokens)) {
            this.fetchTokenPathsWithRates(convertibleTokens[0], convertibleTokens[1], 'from', 1);
            this.fetchTokenPathsWithRates(convertibleTokens[1], convertibleTokens[0], 'to', 1);
        }
    }
    
    fetchTokenPathsWithRates(fromToken, toToken, type, amount) {
         this.props.fetchTokenPathsWithRates(fromToken, toToken, type, amount);
    }
    
    fromTokenChanged (idx) {
        const {tokens: {convertibleTokens}} = this.props;  
        const {selectedToIdx} = this.state;
        this.setState({selectedFromIdx: idx});
        this.fetchTokenPathsWithRates(convertibleTokens[idx], convertibleTokens[selectedToIdx], 'from', 1);
        this.fetchTokenPathsWithRates(convertibleTokens[selectedToIdx], convertibleTokens[idx], 'to', 1);
            
    }
    
    toTokenChanged(idx) {
        const {tokens: {convertibleTokens}} = this.props;  
        const {selectedFromIdx} = this.state;
        this.setState({selectedToIdx: idx});
        this.fetchTokenPathsWithRates(convertibleTokens[selectedFromIdx], convertibleTokens[idx], 'from', 1);
        this.fetchTokenPathsWithRates(convertibleTokens[idx], convertibleTokens[selectedFromIdx], 'to', 1);       
    }
    
    transferAmountChanged = (amount, type) => {
        const {tokens: {convertibleTokens}} = this.props; 
        const {selectedFromIdx, selectedToIdx} = this.state;
        amount = parseFloat(amount);
        if (type === 'from') {
            this.fetchTokenPathsWithRates(convertibleTokens[selectedFromIdx], convertibleTokens[selectedToIdx], 'from', amount);
        } else if (type === 'to') {
             this.fetchTokenPathsWithRates( convertibleTokens[selectedToIdx], convertibleTokens[selectedFromIdx], 'to', amount);           
        }
    }
    render() {
        const {tokens: {convertibleTokens, fromPathListWithRate, toPathListWithRate}} = this.props;
        const {selectedFromIdx, selectedToIdx} = this.state;
        const self = this;
        let fromTokenSelector = convertibleTokens.map(function(item, idx){
            let itemActive = "";
            if (idx === selectedFromIdx) {
                itemActive = "cell-active";
            }
            let itemName =  item.name.length > 10 ? item.name.substr(0, 10) + "..." :  item.name;
            return (<ListGroupItem key={`from-${idx}`} className={`token-display-cell ${itemActive}`} onClick={self.fromTokenChanged.bind(self, idx)}>
            <div>
            <img src={item.imageURI} className="symbol-image"/>
            <div className="item-symbol">{item.symbol}</div>
            </div>
            <div className="">
               {itemName}
            </div>
            </ListGroupItem>)
        });
        
        let toTokenSelector = convertibleTokens.map(function(item, idx){
            let itemActive = "";
            if (idx === selectedToIdx) {
                itemActive = "cell-active";
            }            
            let itemName =  item.name.length > 10 ? item.name.substr(0, 10) + "..." :  item.name;
            return (<ListGroupItem key={`to-${idx}`} className={`token-display-cell ${itemActive}`} onClick={self.toTokenChanged.bind(self, idx)}>
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
             <Row>
             <Col lg={2} style={{'paddingRight': 0}}>
               <ListGroup className="token-selector-list">
               {fromTokenSelector}
               </ListGroup>
             </Col>
             <Col lg={8} className="explore-paths-container">
               <ViewPaths 
               fromToken={convertibleTokens[selectedFromIdx]} toToken={convertibleTokens[selectedToIdx]}
               fromPathListWithRate={fromPathListWithRate}
               toPathListWithRate={toPathListWithRate} transferAmountChanged={this.transferAmountChanged}
               submitSwap={this.props.submitSwap}/>
             </Col>
             <Col lg={2} style={{'paddingLeft': 0}}>
                 <ListGroup className="token-selector-list">
               {toTokenSelector}
                    </ListGroup>
             </Col>
            </Row>
            </Container>
            </div>
            )
    }
}