import React, {Component} from 'react';

export default class CreateV1Pool extends Component {
  render() {
    return (
      <div className="create-pool-form-container">
        <div className="create-form-container">
          <div className="h4">Creating Bancor V1 Pool</div>
          <div>
            You can create this pool with any number of reserves in any reserve ratio provided the sum of reserve ratios is less than
            or equal to 100.
          </div>
        </div>
      </div>
    )
  }
}