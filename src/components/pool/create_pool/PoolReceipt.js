import React, {Component} from 'react';

export default class PoolReceipt extends Component {
    componentWillMount() {

        const {pool: {relayConverterStatus, activationStatus}} = this.props;
        const self = this;
        console.log(relayConverterStatus);
        console.log(activationStatus);
        console.log("****");
        console.log("GGG");
   const converterAddress = relayConverterStatus.message.events["1"].address

        console.log("Inside receipt "+converterAddress);
        setTimeout(function(){
           self.props.fetchPoolAndConverterDetails(converterAddress);   
        }, 4000);

        
    }
    render() {
        return (
            <div>
              <div>
                Congratulations. Your pool is not deployed.
              </div>
              <div>
               <div>
                 Pool Details
               </div>
               <div>
                 Set pool Conversion Fees
               </div>
               <div>
                 Fund pool tokens
               </div>
               <div>
                 View your pool.
               </div>
              </div>
            </div>
            )
    }
}