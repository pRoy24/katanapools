import React, {Component} from 'react';
import {isNonEmptyArray} from '../../../utils/ObjectUtils';
import {ListGroupItem, ListGroup} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faArrowRight,  faChevronCircleDown, faSpinner } from '@fortawesome/free-solid-svg-icons'

export default class ViewPaths extends Component {
    render() {
        const {pathListWithRate} = this.props;
        let paths = <span/>;
        let pathListItems = <span/>;
        if (isNonEmptyArray(pathListWithRate)) {
            pathListItems = pathListWithRate.map(function(item, idx){
                console.log(item)
                let pointerArrow = <span/>;
                if (idx < pathListWithRate.length - 1) {
                      pointerArrow = 
                      <div className="arrow-right-container">
                        <FontAwesomeIcon icon={faArrowRight} />
                      </div>
                } 
                return (<ListGroupItem>
                {item.path.map(function(cell, idx){

                    return <div className="meta-item-cell-container" key={cell.meta.symbol + "idx"}>
                      <div className="meta-item-cell">
                        <div className="token-label-cell">{cell.meta.symbol}</div> 
                        <div className="token-name-cell">{cell.meta.name}</div>
                      </div>
                      {pointerArrow}
                    </div>
                })}
                <div>{item.price}</div>
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