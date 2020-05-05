import React, {Component} from 'react';
import {isNonEmptyArray, isNonEmptyObject, isEmptyObject, isEmptyString} from '../../../utils/ObjectUtils';
import {ListGroupItem, ListGroup, Row, Col, Button, Form, InputGroup} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faArrowRight,  faChevronCircleDown, faChevronDown,
faChevronUp, faSpinner } from '@fortawesome/free-solid-svg-icons';
import AddressDisplay from '../../common/AddressDisplay';


export default class ViewPaths extends Component {
    render() {
        const {fromPathListWithRate, toPathListWithRate, fromToken, toToken, fromPathLoading, toPathLoading, setProviderNotification} = this.props;

        let paths = <span/>;
        let fromPathListItems = <span/>;
        let toPathListItems = <span/>;
        if (isNonEmptyArray(fromPathListWithRate)) {
            const sortedPathList = fromPathListWithRate.sort((a, b)=>(b.price - a.price));
            fromPathListItems = <ConversionPathList fromToken={fromToken} toToken={toToken}
            pathList={sortedPathList} type={"from"} transferAmountChanged={this.props.transferAmountChanged}
            submitSwap={this.props.submitSwap} setProviderNotification={setProviderNotification}/>
        }

        if (isNonEmptyArray(toPathListWithRate)) {
            const sortedPathList = toPathListWithRate.sort((a, b)=>(b.price - a.price));
            toPathListItems = <ConversionPathList fromToken={toToken} toToken={fromToken} pathList={sortedPathList}
            type={"to"} transferAmountChanged={this.props.transferAmountChanged} submitSwap={this.props.submitSwap}
            setProviderNotification={setProviderNotification}/>
        }

        let tokenPairDescription = <span/>;

        if (isEmptyObject(fromToken) && isEmptyObject(toToken)) {
          tokenPairDescription = (
              <div className="swap-token-loading-container">
              <div className="spinner-icon">
                      <FontAwesomeIcon icon={faSpinner} size="lg" rotation={270} pulse/>
              </div>
              </div>
          )
        }
        if (isNonEmptyObject(fromToken) && isNonEmptyObject(toToken)) {
            let fromTokenDescription = <span/>;
            let toTokenDescription = <span/>;

            if (fromToken.meta && fromToken.meta.description) {
                fromTokenDescription = <div>{fromToken.meta.description}</div>
            }
            if (toToken.meta && toToken.meta.description) {
                toTokenDescription = <div>{toToken.meta.description}</div>
            }
            tokenPairDescription = (
                <Row className="token-info-row">
                <Col lg={6} className="token-info-block">
                <Row className="token-info-row">
                <Col lg={6} className="token-info-col">
                    <div className="cell-data">
                        {fromToken.name}
                    </div>
                    <div className="cell-label">
                        Name
                    </div>
                </Col>
                <Col lg={6} className="token-info-col">
                    <div className="cell-data">
                        {fromToken.symbol}
                    </div>
                    <div className="cell-label">
                        Symbol
                    </div>
                </Col>
                <Col lg={6} className="token-info-col">
                    <div className="cell-data">
                        <AddressDisplay address={fromToken.address}/>
                    </div>
                    <div className="cell-label">
                        Address
                    </div>
                </Col>
                <Col lg={12} className="token-info-col">
                    <div className="cell-data">
                        {fromTokenDescription}
                    </div>
                </Col>
                </Row>

              </Col>
              <Col lg={6} className="token-info-block">
                <Row className="token-info-row">
                    <Col lg={6} className="token-info-col">
                        <div className="cell-data">
                            {toToken.name}
                        </div>
                        <div className="cell-label">
                            Name
                        </div>
                    </Col>
                    <Col lg={6} className="token-info-col">
                        <div className="cell-data">
                            {toToken.symbol}
                        </div>
                        <div className="cell-label">
                            Symbol
                        </div>
                    </Col>
                    <Col lg={6} className="token-info-col">
                    <div className="cell-data">
                        <AddressDisplay address={toToken.address}/>
                    </div>
                    <div className="cell-label">
                        Address
                    </div>
                    </Col>
                    <Col lg={6} className="token-info-col">

                    </Col>
                    <Col lg={12} className="token-info-col">
                        <div className="cell-data">
                            {toTokenDescription}
                        </div>
                    </Col>
                </Row>
              </Col>
                </Row>
                )
        }
        let fromPathLoadingDiv = <span/>;
        let toPathLoadingDiv = <span/>;
        if (fromPathLoading) {
            fromPathLoadingDiv = <div className="path-loading-container">
                          <div className="spinner-icon">
                      <FontAwesomeIcon icon={faSpinner} size="lg" rotation={270} pulse/>
              </div>
              <div>Fetching paths from {fromToken.symbol} -> {toToken.symbol}</div>
            </div>
        }
        if (toPathLoading) {
            toPathLoadingDiv = <div className="path-loading-container">
                          <div className="spinner-icon">
                      <FontAwesomeIcon icon={faSpinner} size="lg" rotation={270} pulse/>
              </div>
                            <div>Fetching paths from {toToken.symbol} -> {fromToken.symbol}</div>
              </div>
        }

        return (
            <div className="view-paths-container">
            <div>
                {tokenPairDescription}
            </div>
            <div className="from-path-container">
                {fromPathLoadingDiv}
                {fromPathListItems}
            </div>
            <div className="to-path-container">
                {toPathLoadingDiv}
                {toPathListItems}
            </div>
            </div>
            )
    }
}

class ConversionPathList extends Component {
    constructor(props) {
        super(props);
        this.state = {showMain: true, transferAmount: 1};
    }
    componentWillReceiveProps(nextProps) {
        const {fromToken, toToken} = nextProps;
        if (this.props.fromToken.symbol !== fromToken.symbol || this.props.toToken.symbol !== toToken.symbol) {
            this.setState({showMain: true, transferAmount: 1});
        }
    }
    toggleHidePath = () => {
        this.setState({showMain: false});
    }
    toggleShowPath = () => {
        this.setState({showMain: true});
    }

    tranferAmountChanged = (evt) => {
        const {type} = this.props;
        const amount = evt.target.value;
        this.setState({transferAmount: amount});
        this.props.transferAmountChanged(amount, type);
    }

    submitSwap(idx) {
        const web3 = window.web3;
        const currentWalletAddress = web3.currentProvider ? web3.currentProvider.selectedAddress : '';
        if (isEmptyString(currentWalletAddress)) {
          this.props.setProviderNotification();
        } else {

        const {pathList, fromToken} = this.props;
        const {transferAmount} = this.state;
        const currentPath = pathList[idx];
        const pathTokens = currentPath.path.map((i) => (i.address));
        this.props.submitSwap(pathTokens, transferAmount, fromToken);
        }
    }
    render() {
        let {fromToken, toToken, pathList} = this.props;
        const {showMain, transferAmount} = this.state;
        const self = this;
        if (pathList.length === 0) {
            return <span/>;
        }
        
        console.log(pathList);
        console.log("GGG");
        
        if (showMain) {
         let viewAllPaths = <span/>;
         
         
         
         if (pathList.length > 2) {
             viewAllPaths = <div className="view-toggle-container" onClick={this.toggleHidePath}>{pathList.length - 2} more paths. View All <FontAwesomeIcon icon={faChevronDown}/></div>;
         }

         return  (<div>
            <div className="h6 conversion-path-header">
            <Row>
            <Col lg={8} xs={6}>
            Conversion paths  from {fromToken.symbol} to {toToken.symbol}
            </Col>
            <Col lg={4} xs={6} className="path-label-container">
               <InputGroup className="mb-3">
                <Form.Control type="text" placeholder="Amount" className="swap-amount-input"
                value={transferAmount} onChange={this.tranferAmountChanged}/>
                <InputGroup.Append>
                  <InputGroup.Text id="basic-addon2">{fromToken.symbol}</InputGroup.Text>
                </InputGroup.Append>
              </InputGroup>
            </Col>
            </Row>
            </div>
            {
            pathList.slice(0, 2).map(function(item, idx){
                let isBestPath = "";
                if (idx === 0) {
                    isBestPath = "best-path";
                }
                return (<ListGroupItem key={`frompath-${idx}`} className={`path-row ${isBestPath}`}>
                <Row>
                <Col lg={10} className="token-path-display">
                {item.path.map(function(cell, idx){
                let pointerArrow = <span/>;
                if (idx < item.path.length - 1) {
                      pointerArrow =
                      <div className="arrow-right-container">
                        <FontAwesomeIcon icon={faArrowRight} />
                      </div>
                }
                return <div className="meta-item-cell-container" key={cell.meta.symbol + "idx"}>
                      <div className="meta-item-cell">
                        <div className="token-label-cell">{cell.meta.symbol}</div>
                        <div className="token-name-cell">{cell.meta.name}</div>
                      </div>
                      {pointerArrow}
                    </div>
                })}
                <div className="path-conversion-price">{transferAmount} {item.path[0].meta.symbol} = {item.price} {item.path[item.path.length - 1].meta.symbol}</div>
                </Col>
                <Col lg={2}>

                <Button className="path-swap-btn" onClick={self.submitSwap.bind(self, idx)}>Swap</Button>
                </Col>
                </Row>
                </ListGroupItem>)
            })}
            {viewAllPaths}
            </div>)
        }
        return (
            <div>
            <div className="h6 conversion-path-header">
            <Row>
            <Col lg={8} xs={6}>
            Conversion paths  from {fromToken.symbol} to {toToken.symbol}
            </Col>
            <Col lg={4} xs={6} className="path-label-container">
               <InputGroup className="mb-3">
                <Form.Control type="text" placeholder="Amount" className="swap-amount-input"
                value={transferAmount} onChange={this.tranferAmountChanged}/>
                <InputGroup.Append>
                  <InputGroup.Text id="basic-addon2">{fromToken.symbol}</InputGroup.Text>
                </InputGroup.Append>
              </InputGroup>
            </Col>
            </Row>
            </div>
            {
            pathList.map(function(item, idx){
                let isBestPath = "";
                if (idx === 0) {
                    isBestPath = "best-path";
                }
                return (<ListGroupItem key={`frompath-${idx}`} className={`path-row ${isBestPath}`}>
                <Row>
                <Col lg={10} className="token-path-display">
                {item.path.map(function(cell, idx){
                let pointerArrow = <span/>;
                if (idx < item.path.length - 1) {
                      pointerArrow =
                      <div className="arrow-right-container">
                        <FontAwesomeIcon icon={faArrowRight} />
                      </div>
                }
                return <div className="meta-item-cell-container" key={cell.meta.symbol + {idx}+"idx"}>
                      <div className="meta-item-cell">
                        <div className="token-label-cell">{cell.meta.symbol}</div>
                        <div className="token-name-cell">{cell.meta.name}</div>
                      </div>
                      {pointerArrow}
                    </div>
                })}
                <div className="path-conversion-price">{transferAmount} {item.path[0].meta.symbol} = {item.price} {item.path[item.path.length - 1].meta.symbol}</div>
                </Col>
                <Col lg={2}>
                <Button className="path-swap-btn" onClick={self.submitSwap.bind(self, idx)}>Swap</Button>
                </Col>
                </Row>
                </ListGroupItem>)
            })}
            <div className="view-toggle-container" onClick={this.toggleShowPath}>View less. <FontAwesomeIcon icon={faChevronUp}/>.</div>
            </div>

            )
    }
}