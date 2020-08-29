import React, {Component} from 'react';
import Stepper, { Step, StepperContext } from "react-material-stepper";
import Step1Container from './step1/Step1Container';
import Step2Container from './step2/Step2Container';
import {isEmptyObject, isNonEmptyObject, isEmptyString} from '../../../../utils/ObjectUtils';

export default class CreateV2Pool extends Component {
  constructor(props) {
    super(props);
        this.appStepper = React.createRef();
  }
  componentWillReceiveProps(nextProps) {
    const {pool: {smartTokenContract, relayConverterStatus, poolFundedStatus, activationStatus}} = nextProps;
      console.log(nextProps);
      
    if (isNonEmptyObject(relayConverterStatus) && relayConverterStatus.type === 'success' && this.props.pool.relayConverterStatus.type === 'pending') {
      this.setState({currentStep: 'step2'})
      this.appStepper.current.resolve();
    }

    if (isNonEmptyObject(activationStatus) && activationStatus.type === 'success' && this.props.pool.activationStatus.type === 'pending') {
    this.setState({showReceiptPage: true});
    }
  }
  

  render() {
    const STEP1 = "step-one";
    const STEP2 = "step-two";
    const STEP3 = "step-three";
    const initialStep = STEP2;
    
    return (
      <div className="create-pool-form-container">

          <Stepper contextRef={this.appStepper} initialStep={STEP2}>
            <Step stepId={STEP1} data="Step 1 initial state" title="Pool and Converter details" description="Configure convertible token">
              <Step1Container deployContract={this.deployConverterContract} getTokenDetail={this.props.getTokenDetailFromAddress}
              setTokenListRow={this.props.setTokenListRow} setFormError={this.setFormError} resetFormError={this.resetFormError}
              resumePoolCreation={this.resumePoolCreation} deployNewPool={this.props.deployNewPool}/>
            </Step>
            <Step stepId={STEP2} title="Activate pool" description="Activate pool">
              <Step2Container fundRelayWithSupply={this.fundRelayWithSupply} getAddressList={this.getAddressList} acceptPoolOwnership={this.acceptPoolOwnership}
              activateV2Pool={this.props.activateV2Pool}/>
            </Step>
            <Step stepId={STEP3} title="Transfer ownership" description="Transfer pool ownership">
              <Step2Container fundRelayWithSupply={this.fundRelayWithSupply} getAddressList={this.getAddressList} acceptPoolOwnership={this.acceptPoolOwnership}/>
            </Step>            
          </Stepper>

      </div>  
      )
  }
}