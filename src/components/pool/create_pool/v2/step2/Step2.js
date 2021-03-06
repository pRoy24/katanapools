import React, {Component} from 'react';
import {Row, Col, Container, Form, Button} from 'react-bootstrap';

export default class Step2 extends Component {
  constructor(props) {
    super(props);
    this.state = {primaryTokenOracle: '', secondaryTokenOracle: ''};
  }
  primaryTokenOracleChanged = (evt) => {
    this.setState({primaryTokenOracle: evt.target.value});
  }
  
  secondaryTokenOracleChanged = (evt) => {
    this.setState({secondaryTokenOracle: evt.target.value});
  }
  
  activatePool = () => {
    const {primaryTokenOracle, secondaryTokenOracle} = this.state;
    
    const relay =  {
    "blockHash": "0x02216801fe315bdb8fd387fa5ad9031e57af64c90c825b8d34d78c50ddca6a8f",
    "blockNumber": 8361244,
    "contractAddress": null,
    "cumulativeGasUsed": 6888502,
    "from": "0x1335e0750d74b21a837ccbd4d1a7e30699001848",
    "gasUsed": 6888502,
    "logsBloom": "0x0000000000000000000000000000000000000048200004000000800000000000000000000000080000000000000c00000000000000000000000020000000000280000300000104000000020001800000000208010000000200800000001000000000000000000000008000000400000000000040000040000000000000000000000000000000000000000000400000000000000000402000000000000000000010000000000002000020000012000000000001010008000000000000000000000000000081400000010000010000000000000240008c000000000000000000000000000800000000000400000000000200000200000000000000000000000000",
    "status": true,
    "to": "0xf330be3ca34f79328c2448b02d8059f4a7b5b3f8",
    "transactionHash": "0x5c17d23d842fa7c87aca3a357facad615d5a644d9d623e1b08b175aa52ca7085",
    "transactionIndex": 0,
    "events": {
      "0": {
        "address": "0xFc31A0CD40f0DAb7286259c4f100AD15be543CAf",
        "blockHash": "0x02216801fe315bdb8fd387fa5ad9031e57af64c90c825b8d34d78c50ddca6a8f",
        "blockNumber": 8361244,
        "logIndex": 2,
        "removed": false,
        "transactionHash": "0x5c17d23d842fa7c87aca3a357facad615d5a644d9d623e1b08b175aa52ca7085",
        "transactionIndex": 0,
        "id": "log_9b942b3c",
        "returnValues": {},
        "signature": null,
        "raw": {
          "data": "0x",
          "topics": [
            "0xb54eb8f70476910bea510b4ca1ece1fdb11eeb345b0d46221dd40ba86e649533",
            "0x00000000000000000000000008ac72b5cefefaf1c9cc963bc29cccdf50947303",
            "0x000000000000000000000000f330be3ca34f79328c2448b02d8059f4a7b5b3f8"
          ]
        }
      },
      "OwnerUpdate": [
        {
          "address": "0x860b57d8E96E0C27992A35302489d11401733Ca8",
          "blockHash": "0x02216801fe315bdb8fd387fa5ad9031e57af64c90c825b8d34d78c50ddca6a8f",
          "blockNumber": 8361244,
          "logIndex": 0,
          "removed": false,
          "transactionHash": "0x5c17d23d842fa7c87aca3a357facad615d5a644d9d623e1b08b175aa52ca7085",
          "transactionIndex": 0,
          "id": "log_2a14fe3b",
          "returnValues": {
            "0": "0x05AB118Bb39555fA1CdDe6b204Db3323866Bf6c0",
            "1": "0xFc31A0CD40f0DAb7286259c4f100AD15be543CAf",
            "_prevOwner": "0x05AB118Bb39555fA1CdDe6b204Db3323866Bf6c0",
            "_newOwner": "0xFc31A0CD40f0DAb7286259c4f100AD15be543CAf"
          },
          "event": "OwnerUpdate",
          "signature": "0x343765429aea5a34b3ff6a3785a98a5abb2597aca87bfbb58632c173d585373a",
          "raw": {
            "data": "0x",
            "topics": [
              "0x343765429aea5a34b3ff6a3785a98a5abb2597aca87bfbb58632c173d585373a",
              "0x00000000000000000000000005ab118bb39555fa1cdde6b204db3323866bf6c0",
              "0x000000000000000000000000fc31a0cd40f0dab7286259c4f100ad15be543caf"
            ]
          }
        },
        {
          "address": "0x08ac72b5cEFeFAF1c9CC963bc29cccDf50947303",
          "blockHash": "0x02216801fe315bdb8fd387fa5ad9031e57af64c90c825b8d34d78c50ddca6a8f",
          "blockNumber": 8361244,
          "logIndex": 1,
          "removed": false,
          "transactionHash": "0x5c17d23d842fa7c87aca3a357facad615d5a644d9d623e1b08b175aa52ca7085",
          "transactionIndex": 0,
          "id": "log_774ea82e",
          "returnValues": {
            "0": "0x55fD5a559b21FF4504Cee520f1D80A817Fb01026",
            "1": "0xFc31A0CD40f0DAb7286259c4f100AD15be543CAf",
            "_prevOwner": "0x55fD5a559b21FF4504Cee520f1D80A817Fb01026",
            "_newOwner": "0xFc31A0CD40f0DAb7286259c4f100AD15be543CAf"
          },
          "event": "OwnerUpdate",
          "signature": "0x343765429aea5a34b3ff6a3785a98a5abb2597aca87bfbb58632c173d585373a",
          "raw": {
            "data": "0x",
            "topics": [
              "0x343765429aea5a34b3ff6a3785a98a5abb2597aca87bfbb58632c173d585373a",
              "0x00000000000000000000000055fd5a559b21ff4504cee520f1d80a817fb01026",
              "0x000000000000000000000000fc31a0cd40f0dab7286259c4f100ad15be543caf"
            ]
          }
        },
        {
          "address": "0x860b57d8E96E0C27992A35302489d11401733Ca8",
          "blockHash": "0x02216801fe315bdb8fd387fa5ad9031e57af64c90c825b8d34d78c50ddca6a8f",
          "blockNumber": 8361244,
          "logIndex": 3,
          "removed": false,
          "transactionHash": "0x5c17d23d842fa7c87aca3a357facad615d5a644d9d623e1b08b175aa52ca7085",
          "transactionIndex": 0,
          "id": "log_548a1a26",
          "returnValues": {
            "0": "0xFc31A0CD40f0DAb7286259c4f100AD15be543CAf",
            "1": "0xf330be3cA34f79328c2448b02d8059F4a7B5B3f8",
            "_prevOwner": "0xFc31A0CD40f0DAb7286259c4f100AD15be543CAf",
            "_newOwner": "0xf330be3cA34f79328c2448b02d8059F4a7B5B3f8"
          },
          "event": "OwnerUpdate",
          "signature": "0x343765429aea5a34b3ff6a3785a98a5abb2597aca87bfbb58632c173d585373a",
          "raw": {
            "data": "0x",
            "topics": [
              "0x343765429aea5a34b3ff6a3785a98a5abb2597aca87bfbb58632c173d585373a",
              "0x000000000000000000000000fc31a0cd40f0dab7286259c4f100ad15be543caf",
              "0x000000000000000000000000f330be3ca34f79328c2448b02d8059f4a7b5b3f8"
            ]
          }
        },
        {
          "address": "0x08ac72b5cEFeFAF1c9CC963bc29cccDf50947303",
          "blockHash": "0x02216801fe315bdb8fd387fa5ad9031e57af64c90c825b8d34d78c50ddca6a8f",
          "blockNumber": 8361244,
          "logIndex": 4,
          "removed": false,
          "transactionHash": "0x5c17d23d842fa7c87aca3a357facad615d5a644d9d623e1b08b175aa52ca7085",
          "transactionIndex": 0,
          "id": "log_e8705027",
          "returnValues": {
            "0": "0xFc31A0CD40f0DAb7286259c4f100AD15be543CAf",
            "1": "0xf330be3cA34f79328c2448b02d8059F4a7B5B3f8",
            "_prevOwner": "0xFc31A0CD40f0DAb7286259c4f100AD15be543CAf",
            "_newOwner": "0xf330be3cA34f79328c2448b02d8059F4a7B5B3f8"
          },
          "event": "OwnerUpdate",
          "signature": "0x343765429aea5a34b3ff6a3785a98a5abb2597aca87bfbb58632c173d585373a",
          "raw": {
            "data": "0x",
            "topics": [
              "0x343765429aea5a34b3ff6a3785a98a5abb2597aca87bfbb58632c173d585373a",
              "0x000000000000000000000000fc31a0cd40f0dab7286259c4f100ad15be543caf",
              "0x000000000000000000000000f330be3ca34f79328c2448b02d8059f4a7b5b3f8"
            ]
          }
        },
        {
          "address": "0x860b57d8E96E0C27992A35302489d11401733Ca8",
          "blockHash": "0x02216801fe315bdb8fd387fa5ad9031e57af64c90c825b8d34d78c50ddca6a8f",
          "blockNumber": 8361244,
          "logIndex": 5,
          "removed": false,
          "transactionHash": "0x5c17d23d842fa7c87aca3a357facad615d5a644d9d623e1b08b175aa52ca7085",
          "transactionIndex": 0,
          "id": "log_3f509008",
          "returnValues": {
            "0": "0xf330be3cA34f79328c2448b02d8059F4a7B5B3f8",
            "1": "0x08ac72b5cEFeFAF1c9CC963bc29cccDf50947303",
            "_prevOwner": "0xf330be3cA34f79328c2448b02d8059F4a7B5B3f8",
            "_newOwner": "0x08ac72b5cEFeFAF1c9CC963bc29cccDf50947303"
          },
          "event": "OwnerUpdate",
          "signature": "0x343765429aea5a34b3ff6a3785a98a5abb2597aca87bfbb58632c173d585373a",
          "raw": {
            "data": "0x",
            "topics": [
              "0x343765429aea5a34b3ff6a3785a98a5abb2597aca87bfbb58632c173d585373a",
              "0x000000000000000000000000f330be3ca34f79328c2448b02d8059f4a7b5b3f8",
              "0x00000000000000000000000008ac72b5cefefaf1c9cc963bc29cccdf50947303"
            ]
          }
        }
      ],
      "ConverterAnchorAdded": {
        "address": "0xf330be3cA34f79328c2448b02d8059F4a7B5B3f8",
        "blockHash": "0x02216801fe315bdb8fd387fa5ad9031e57af64c90c825b8d34d78c50ddca6a8f",
        "blockNumber": 8361244,
        "logIndex": 6,
        "removed": false,
        "transactionHash": "0x5c17d23d842fa7c87aca3a357facad615d5a644d9d623e1b08b175aa52ca7085",
        "transactionIndex": 0,
        "id": "log_1f010458",
        "returnValues": {
          "0": "0x860b57d8E96E0C27992A35302489d11401733Ca8",
          "_anchor": "0x860b57d8E96E0C27992A35302489d11401733Ca8"
        },
        "event": "ConverterAnchorAdded",
        "signature": "0xc0a6d303d67b7ed9fa0abae1c48878df32acc0e7ca4334c7dad2bceeee5956fd",
        "raw": {
          "data": "0x",
          "topics": [
            "0xc0a6d303d67b7ed9fa0abae1c48878df32acc0e7ca4334c7dad2bceeee5956fd",
            "0x000000000000000000000000860b57d8e96e0c27992a35302489d11401733ca8"
          ]
        }
      },
      "SmartTokenAdded": {
        "address": "0xf330be3cA34f79328c2448b02d8059F4a7B5B3f8",
        "blockHash": "0x02216801fe315bdb8fd387fa5ad9031e57af64c90c825b8d34d78c50ddca6a8f",
        "blockNumber": 8361244,
        "logIndex": 7,
        "removed": false,
        "transactionHash": "0x5c17d23d842fa7c87aca3a357facad615d5a644d9d623e1b08b175aa52ca7085",
        "transactionIndex": 0,
        "id": "log_ec3e7245",
        "returnValues": {
          "0": "0x860b57d8E96E0C27992A35302489d11401733Ca8",
          "_smartToken": "0x860b57d8E96E0C27992A35302489d11401733Ca8"
        },
        "event": "SmartTokenAdded",
        "signature": "0x88881feecdf61136ac4bdb1f681f2f3746a82910263d21ffea94750d2a78c0ab",
        "raw": {
          "data": "0x",
          "topics": [
            "0x88881feecdf61136ac4bdb1f681f2f3746a82910263d21ffea94750d2a78c0ab",
            "0x000000000000000000000000860b57d8e96e0c27992a35302489d11401733ca8"
          ]
        }
      },
      "LiquidityPoolAdded": {
        "address": "0xf330be3cA34f79328c2448b02d8059F4a7B5B3f8",
        "blockHash": "0x02216801fe315bdb8fd387fa5ad9031e57af64c90c825b8d34d78c50ddca6a8f",
        "blockNumber": 8361244,
        "logIndex": 8,
        "removed": false,
        "transactionHash": "0x5c17d23d842fa7c87aca3a357facad615d5a644d9d623e1b08b175aa52ca7085",
        "transactionIndex": 0,
        "id": "log_445ae4fd",
        "returnValues": {
          "0": "0x860b57d8E96E0C27992A35302489d11401733Ca8",
          "_liquidityPool": "0x860b57d8E96E0C27992A35302489d11401733Ca8"
        },
        "event": "LiquidityPoolAdded",
        "signature": "0xb893f883ef734b712208a877459424ee509832c57e0461fb1ac99ed4d42f2d89",
        "raw": {
          "data": "0x",
          "topics": [
            "0xb893f883ef734b712208a877459424ee509832c57e0461fb1ac99ed4d42f2d89",
            "0x000000000000000000000000860b57d8e96e0c27992a35302489d11401733ca8"
          ]
        }
      },
      "ConvertibleTokenAdded": [
        {
          "address": "0xf330be3cA34f79328c2448b02d8059F4a7B5B3f8",
          "blockHash": "0x02216801fe315bdb8fd387fa5ad9031e57af64c90c825b8d34d78c50ddca6a8f",
          "blockNumber": 8361244,
          "logIndex": 9,
          "removed": false,
          "transactionHash": "0x5c17d23d842fa7c87aca3a357facad615d5a644d9d623e1b08b175aa52ca7085",
          "transactionIndex": 0,
          "id": "log_7e412154",
          "returnValues": {
            "0": "0xA9e296A17599CB43FA88ECBc5B36FEC34421150a",
            "1": "0x860b57d8E96E0C27992A35302489d11401733Ca8",
            "_convertibleToken": "0xA9e296A17599CB43FA88ECBc5B36FEC34421150a",
            "_smartToken": "0x860b57d8E96E0C27992A35302489d11401733Ca8"
          },
          "event": "ConvertibleTokenAdded",
          "signature": "0xf2e7cf6d6ed3f77039511409a43d4fa5108f09ab71d72b014380364c910233a5",
          "raw": {
            "data": "0x",
            "topics": [
              "0xf2e7cf6d6ed3f77039511409a43d4fa5108f09ab71d72b014380364c910233a5",
              "0x000000000000000000000000a9e296a17599cb43fa88ecbc5b36fec34421150a",
              "0x000000000000000000000000860b57d8e96e0c27992a35302489d11401733ca8"
            ]
          }
        },
        {
          "address": "0xf330be3cA34f79328c2448b02d8059F4a7B5B3f8",
          "blockHash": "0x02216801fe315bdb8fd387fa5ad9031e57af64c90c825b8d34d78c50ddca6a8f",
          "blockNumber": 8361244,
          "logIndex": 10,
          "removed": false,
          "transactionHash": "0x5c17d23d842fa7c87aca3a357facad615d5a644d9d623e1b08b175aa52ca7085",
          "transactionIndex": 0,
          "id": "log_fa6895fb",
          "returnValues": {
            "0": "0x49Bb12F629cD9323F70230194548409Db68ca3B6",
            "1": "0x860b57d8E96E0C27992A35302489d11401733Ca8",
            "_convertibleToken": "0x49Bb12F629cD9323F70230194548409Db68ca3B6",
            "_smartToken": "0x860b57d8E96E0C27992A35302489d11401733Ca8"
          },
          "event": "ConvertibleTokenAdded",
          "signature": "0xf2e7cf6d6ed3f77039511409a43d4fa5108f09ab71d72b014380364c910233a5",
          "raw": {
            "data": "0x",
            "topics": [
              "0xf2e7cf6d6ed3f77039511409a43d4fa5108f09ab71d72b014380364c910233a5",
              "0x00000000000000000000000049bb12f629cd9323f70230194548409db68ca3b6",
              "0x000000000000000000000000860b57d8e96e0c27992a35302489d11401733ca8"
            ]
          }
        }
      ]
    }
  };
  
  const converterAddress = relay.events["OwnerUpdate"][1].address;
  console.log("Converter address "+converterAddress);
    const payload = {
      primaryReserveToken: '0xa9e296a17599cb43fa88ecbc5b36fec34421150a',
      primaryReserveOracle: primaryTokenOracle,
      secondaryReserveOracle: secondaryTokenOracle,
      converterAddress: converterAddress
    };
    
    console.log(payload);
    
    this.props.activateV2Pool(payload);
    
  }
  
  render() {
    const {primaryTokenOracle, secondaryTokenOracle} = this.state;
    return (
      
    <div className="create-pool-form-container">

        <div className="create-form-container">

        <div className="step-header">
          <div className="h4">Activate pool</div>
          <div className="label-text">
            <div>
              Oracle Address must be whitelisted and should be in same denomination (ETH denomination preferred)
            </div>
            <div>
            You can view list of existing chainlink Oracle contracts <a href='https://docs.chain.link/docs/reference-contracts#config' target="_blank">here</a>
            </div>
          </div>
        </div>  
          <Row>
            <Col lg={12}>
            Primary Reserve token oracle
            <Form.Control type="text" value={primaryTokenOracle} onChange={this.primaryTokenOracleChanged}/>
            </Col>
          </Row>
          
          <Row>
            <Col lg={12}>
              Secondary Reserve token Oracle
              <Form.Control type="text" value={secondaryTokenOracle} onChange={this.secondaryTokenOracleChanged}/>
            </Col>
          </Row>
                <Row>
          <Col lg={4}>
            <Button variant="primary" className="pool-wizard-submit-btn" onClick={this.activatePool}>
              Next
            </Button>
          </Col>
        <Col lg={8}>

        </Col>
        </Row>  
          
</div>
      </div>
      )
  }
}