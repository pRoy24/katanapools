import React, {Component} from 'react';
import {isNonEmptyArray, isNonEmptyObject} from '../../../utils/ObjectUtils';
import {ListGroupItem, ListGroup, Row, Col, Button, Form} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faArrowRight,  faChevronCircleDown, faChevronDown, faChevronUp, faSpinner } from '@fortawesome/free-solid-svg-icons';
import AddressDisplay from '../../common/AddressDisplay';

export default class ViewPaths extends Component {
    render() {
        const {fromPathListWithRate, toPathListWithRate, fromToken, toToken} = this.props;

        
        let paths = <span/>;
        let fromPathListItems = <span/>;
        let toPathListItems = <span/>;
        if (isNonEmptyArray(fromPathListWithRate)) {
            const sortedPathList = fromPathListWithRate.sort((a, b)=>(b.price - a.price));
            fromPathListItems = <ConversionPathList fromToken={fromToken} toToken={toToken} pathList={sortedPathList}/>
        }

        if (isNonEmptyArray(toPathListWithRate)) {
            const sortedPathList = toPathListWithRate.sort((a, b)=>(b.price - a.price));            
            toPathListItems = <ConversionPathList fromToken={toToken} toToken={fromToken} pathList={sortedPathList}/>
        }
        
        let tokenPairDescription = <span/>;
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
                <Col lg={6}>
                    <div className="cell-data">
                        {fromToken.name}
                    </div>
                    <div className="cell-label">
                        Name
                    </div>
                </Col>
                <Col lg={6}>
                    <div className="cell-data">
                        {fromToken.symbol}
                    </div>
                    <div className="cell-label">
                        Symbol
                    </div>                
                </Col>
                <Col lg={6}>
                    <div className="cell-data">
                        <AddressDisplay address={fromToken.address}/>
                    </div>
                    <div className="cell-label">
                        Address
                    </div>                   
                </Col>
                <Col lg={12}>
                    <div className="cell-data">
                        {fromTokenDescription}
                    </div>
                </Col>
                </Row>

              </Col>
              <Col lg={6} className="token-info-block">
                <Row className="token-info-row">
                    <Col lg={6}>
                        <div className="cell-data">
                            {toToken.name}
                        </div>
                        <div className="cell-label">
                            Name
                        </div>
                    </Col>
                    <Col lg={6}>
                        <div className="cell-data">
                            {toToken.symbol}
                        </div>
                        <div className="cell-label">
                            Symbol
                        </div>                
                    </Col>
                    <Col lg={6}>
                    <div className="cell-data">
                        <AddressDisplay address={toToken.address}/>
                    </div>
                    <div className="cell-label">
                        Address
                    </div>                          
                    </Col>
                    <Col lg={6}>
                    
                    </Col>
                    <Col lg={12}>
                        <div className="cell-data">
                            {toTokenDescription}
                        </div>
                    </Col>
                </Row>
              </Col>
                </Row>
                )
        }
        return (
            <div className="view-paths-container">
            <div>
                {tokenPairDescription}
            </div>

            {fromPathListItems}

            {toPathListItems}

            </div>
            )
    }
}

class ConversionPathList extends Component {
    constructor(props) {
        super(props);
        this.state = {showMain: true};
    }
    toggleHidePath = () => {
        this.setState({showMain: false});
    }
    toggleShowPath = () => {
        this.setState({showMain: true});
    }
    render() {
        let {fromToken, toToken, pathList} = this.props;
        const {showMain} = this.state;
        if (showMain) {
         return  (<div>
            <div className="h6 conversion-path-header">
            <Row>
            <Col lg={6}>
            Conversion paths  from {fromToken.symbol} to {toToken.symbol}
            </Col>
            <Col lg={6}>
             Amount 
             <Form.Control type="number" placeholder="Amount" className="swap-amount-input"/>
             {fromToken.symbol}                
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
                <div className="path-conversion-price">1 {item.path[0].meta.symbol} = {item.price} {item.path[item.path.length - 1].meta.symbol}</div>
                </Col>
                <Col lg={2}>

                <Button className="path-swap-btn">Swap</Button>
                </Col>
                </Row>
                </ListGroupItem>)
            })}
            <div className="view-toggle-container" onClick={this.toggleHidePath}>{pathList.length - 2} more paths. View All <FontAwesomeIcon icon={faChevronDown}/>.</div>
            </div>)              
        }
        return (
            <div>
            <div className="h6 conversion-path-header">Conversion paths  from {fromToken.symbol} to {toToken.symbol}</div>
            {
            pathList.map(function(item, idx){
                return (<ListGroupItem key={`frompath-${idx}`}>
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
                <div className="path-conversion-price">1 {item.path[0].meta.symbol} = {item.price} {item.path[item.path.length - 1].meta.symbol}</div>
                </Col>
                <Col lg={2}>
                <Form.Control type="number" placeholder="Amount" className="swap-amount-input"/>
                <Button className="path-swap-btn">Swap</Button>
                </Col>
                </Row>
                </ListGroupItem>)
            })}
            <div className="view-toggle-container" onClick={this.toggleShowPath}>View less. <FontAwesomeIcon icon={faChevronUp}/>.</div>
            </div>            
            
            )
    }
}