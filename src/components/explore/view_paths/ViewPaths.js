import React, {Component} from 'react';
import {isNonEmptyArray} from '../../../utils/ObjectUtils';
import {ListGroupItem, ListGroup, Row, Col, Button} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faArrowRight,  faChevronCircleDown, faSpinner } from '@fortawesome/free-solid-svg-icons'

export default class ViewPaths extends Component {
    render() {
        const {pathListWithRate} = this.props;
        let paths = <span/>;
        let pathListItems = <span/>;

        if (isNonEmptyArray(pathListWithRate)) {
            pathListItems = pathListWithRate.map(function(item, idx){
                return (<ListGroupItem>
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
                <div>1 {item.path[0].meta.symbol} = {item.price} {item.path[item.path.length - 1].meta.symbol}</div>
                </Col>
                <Col lg={2}>
                <Button>Swap</Button>
                </Col>
                </Row>
                </ListGroupItem>)
            })
        }
        return (
            <div>
             {pathListItems}
            </div>
            )
    }
}