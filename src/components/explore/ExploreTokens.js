import React, {Component} from 'react';
import {Container, Row, Col, ListGroup, ListGroupItem, Alert, FormControl} from 'react-bootstrap';
import ExploreTokensToolbar from './ExploreTokensToolbar';
import './explore.scss';
import ViewPaths from './view_paths/ViewPaths';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import SwapTokensContainer from '../swap/SwapTokensContainer';
import { withRouter } from 'react-router-dom'

import {isEmptyArray, isNonEmptyArray} from '../../utils/ObjectUtils';


class ExploreTokens extends Component {

    renderExploreView = (viewType) => {
        const {history} = this.props;
        if (viewType === 'advanced') {
            history.push('/explore/advanced');
        }
        if (viewType === 'basic') {
            history.push('/explore/basic');
        }
    }
    render() {
        let statusIndicator = <span/>;
        const {swap: {swapTokenStatus}} = this.props;
        if (swapTokenStatus.type === 'error') {
            statusIndicator = (
                <Alert  variant={"danger"}>
                {swapTokenStatus.message}
              </Alert>
                )
        }
        return (
            <div>
            <ExploreTokensToolbar renderExploreView={this.renderExploreView}/>
            {statusIndicator}
            <Container className="explore-tokens-container">
            <Switch>
              <Route path="/explore/advanced">
                <ExploreTokensAdvanced {...this.props}/>
              </Route>
              <Route path="/explore/basic">
                <ExploreTokensBasic {...this.props}/>
              </Route>
              <Route exact path="/explore">
              <ExploreTokensAdvanced {...this.props}/>
              </Route>
              <Route exact path="/">
              <ExploreTokensAdvanced {...this.props}/>
              </Route>
            </Switch>
            </Container>
            </div>
            )
    }
}

export default withRouter(ExploreTokens);

class ExploreTokensAdvanced extends Component {

    constructor(props) {
        super(props);
        this.state = {selectedFromIdx: 0, selectedToIdx: 1, fromConvertibleTokens: [], toConvertibleTokens: [],
            fromToken: {}, toToken: {}
        };
    }
    componentWillMount() {
        const {user: {providerConnected}} = this.props;
        if (providerConnected) {
            this.props.getAllConvertibleTokens();
        }


        const {tokens: {convertibleTokens}}  = this.props;
        if (isNonEmptyArray(convertibleTokens)) {
            this.setState({fromConvertibleTokens: convertibleTokens, toConvertibleTokens: convertibleTokens});
            this.fetchTokenPathsWithRates(convertibleTokens[0], convertibleTokens[1], 'from', 1);
            this.fetchTokenPathsWithRates(convertibleTokens[1], convertibleTokens[0], 'to', 1);
            this.setState({fromToken: convertibleTokens[0], toToken: convertibleTokens[1]});
        }
    }

    fetchTokenPathsWithRates(fromToken, toToken, type, amount) {
        if (fromToken.symbol !== toToken.symbol) {
         this.props.fetchTokenPathsWithRates(fromToken, toToken, type, amount);
        } else {
            this.props.resetTokenPathsWithRates();
        }
    }

    componentWillReceiveProps(nextProps) {
        const {tokens: {convertibleTokens, fromPathLoading, toPathLoading}, user: {providerConnected}}  = nextProps;
        if (providerConnected && !this.props.user.providerConnected) {
            this.props.getAllConvertibleTokens();
        }
        if (isEmptyArray(this.props.tokens.convertibleTokens) && isNonEmptyArray(convertibleTokens)) {
            this.setState({fromConvertibleTokens: convertibleTokens, toConvertibleTokens: convertibleTokens});
            this.fetchTokenPathsWithRates(convertibleTokens[0], convertibleTokens[1], 'from', 1);
            this.fetchTokenPathsWithRates(convertibleTokens[1], convertibleTokens[0], 'to', 1);
            this.setState({fromToken: convertibleTokens[0], toToken: convertibleTokens[1]});
        }
    }

    fromTokenChanged (idx) {
        const {tokens: {convertibleTokens}} = this.props;
        const {fromConvertibleTokens, toConvertibleTokens} = this.state;
        const {selectedToIdx} = this.state;
        this.setState({selectedFromIdx: idx, fromToken: fromConvertibleTokens[idx]});
        this.fetchTokenPathsWithRates(fromConvertibleTokens[idx], toConvertibleTokens[selectedToIdx], 'from', 1);
        this.fetchTokenPathsWithRates(toConvertibleTokens[selectedToIdx], fromConvertibleTokens[idx], 'to', 1);

    }

    toTokenChanged(idx) {
        const {fromConvertibleTokens, toConvertibleTokens} = this.state;
        const {selectedFromIdx} = this.state;
        this.setState({selectedToIdx: idx, toToken: toConvertibleTokens[idx]});
        this.fetchTokenPathsWithRates(fromConvertibleTokens[selectedFromIdx], toConvertibleTokens[idx], 'from', 1);
        this.fetchTokenPathsWithRates(toConvertibleTokens[idx], fromConvertibleTokens[selectedFromIdx], 'to', 1);
    }

    transferAmountChanged = (amount, type) => {
        const {tokens: {convertibleTokens}} = this.props;
        const {selectedFromIdx, selectedToIdx, fromConvertibleTokens, toConvertibleTokens} = this.state;
        amount = parseFloat(amount);
        
        if (!isNaN(amount)) {
            if (type === 'from') {
                this.fetchTokenPathsWithRates(fromConvertibleTokens[selectedFromIdx], toConvertibleTokens[selectedToIdx], 'from', amount);
            } else if (type === 'to') {
                this.fetchTokenPathsWithRates( toConvertibleTokens[selectedToIdx], fromConvertibleTokens[selectedFromIdx], 'to', amount);
            }
        }
    }

    searchFromTokenChanged = (evt) => {
        const {tokens: {convertibleTokens}} = this.props;
        const searchTerm = evt.target.value;

        let fromConvertibleTokens = convertibleTokens.filter(function(item){
            return item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.symbol.toLowerCase().includes(searchTerm.toLowerCase())
        })
        this.setState({searchFromToken: evt.target.value, fromConvertibleTokens: fromConvertibleTokens});

    }

    searchToTokenChanged = (evt) => {
        const {tokens: {convertibleTokens}} = this.props;
        const searchTerm = evt.target.value;
         this.setState({searchToToken: evt.target.value});
        let toConvertibleTokens = convertibleTokens.filter(function(item){
            return item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.symbol.toLowerCase().includes(searchTerm.toLowerCase())
        })
        this.setState({searchToToken: searchTerm, toConvertibleTokens: toConvertibleTokens});
    }

    render() {

        const {tokens: {convertibleTokens, fromPathListWithRate, toPathListWithRate, fromPathLoading, toPathLoading}, user: {providerConnected}} = this.props;

        const {selectedFromIdx, selectedToIdx, searchFromToken, searchToToken, fromConvertibleTokens,
        toConvertibleTokens, fromToken, toToken} = this.state;

        const self = this;
        let fromTokenSelector = <span/>;
        let toTokenSelector = <span/>;
        if (convertibleTokens && convertibleTokens.length > 0) {
        fromTokenSelector = <div>
        <FormControl type="text" placeHolder="Search" value={searchFromToken} onChange={this.searchFromTokenChanged}/>
        {fromConvertibleTokens.map(function(item, idx){
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
        })}</div>;

         toTokenSelector = <div>
        <FormControl type="text" placeHolder="Search" value={searchToToken} onChange={this.searchToTokenChanged}/>
        {toConvertibleTokens.map(function(item, idx){
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
        })}
        </div>
        }
        if (!providerConnected) {
            return <span/>;
        }
        return (
             <Row>
             <Col lg={2} style={{'paddingRight': 0}}>
               <ListGroup className="token-selector-list">
               {fromTokenSelector}
               </ListGroup>
             </Col>
             <Col lg={8} className="explore-paths-container">
               <ViewPaths
               fromToken={fromToken} toToken={toToken} fromPathLoading={fromPathLoading} toPathLoading={toPathLoading}
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
            )
    }
}

class ExploreTokensBasic extends Component {
    render() {
        return (
            <SwapTokensContainer  getAllConvertibleTokens={this.props.getAllConvertibleTokens}
        getAllSmartTokens={this.props.getAllSmartTokens}/>
            )
    }
}