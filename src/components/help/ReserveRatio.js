import React, {Component} from 'react';
import reserve_ratio_img from './resources/reserve_ratio.jpeg';
import {Container, Row, Col} from 'react-bootstrap';

export default class ReserveRatio extends Component {
  render() {
    return (
      <div>
      <Container className="help-topic-container">
      <Row>
      <Col lg={12}>
      <div className="h4">
      What is reserve ratio?
      </div>
        <div>Reserve ratio defines the ratio between the total value of the reserves & the market cap of the pool token.</div>

        <div>Most pools (on both bancor and uniswap) have 2 reserves and a 1:1 or 100% ratio between the total value of the reserves and the pool token market cap.
        They hold 2 reserves at a fixed 50/50 ratio to calculate prices.</div>

        <div>Example: The ETHBNT pool holds ETH and BNT in its reserves. The pool adjusts prices of ETH and BNT so the value of the reserves is 50/50 in the pool,
        and always 1:1 with the ETHBNT market cap.</div>

        <div>But you can also launch pools that have less than 100% reserve ratio, a 40/40 pool for example - which is 80% reserve ratio.
        In this pool, the value of the reserves is kept at 80% of its market cap.</div>

        <div>This means that the price of the pool token rises as more liquidity is added to the pool.
        The lower the reserve ratio, the faster the pool token price rises as liquidity is added (the steeper the curve).</div>

        <div>Theoretically you can create a pool with 0-100% reserve ratio. Here is how the curves would look:</div>
        <div className="explain-image-container">
        <img src={reserve_ratio_img}/>
        </div>

        <div>
          A fractional reserve ratio would cause the pool price to move faster than a full reserve, in either direction.
          So if the intention is to attract investment from liquidity providers, there should be an agreed method to capture some value on exit.
          This would need to balance the need for liquidity providers to keep value on exit despite the fee.
          This setup acts as a means of delaying exits, reducing the profitability of a quick trade in and out, and encourages longer term holding, to collect value over time.
        </div>

        <div className="sub-text">Credits for this explanation goes to Nate Hindman @natehindman and Jason Lasky @hubway .</div>
  </Col>
  </Row>
      </Container>
      </div>
      )
  }
}