# Katana

**Katana allows swapping of ERC20 tokens and creation of liquidity pools with whole as well as fractions reserves and allows discovering, funding and liquidating pools**

This alpha has been created in response to Bancor Trade and Liquidity Widget [challenge](https://gitcoin.co/issue/bancorprotocol/contracts/336/3947)

The app is live on mainnet as well as Ropsten and has been currently tested with Metamask. 

A live deployment for discovering creating, funding and liquidating pools as well as swapping convertible and smart tokens can be found [here](http://katanapools.s3-website-us-west-2.amazonaws.com/)


## Features

- Liquidity pool creation wizard

- Allows creation of pool with 30/30 to 50/50 weight fractional reserves

- Provides real-time feedback and guidance during pool creation.

- Allows discovery and search liquidity pools, fund and liquidate holdings.

- Swap tokens easily with predicable slippage and upfront cost-calculation.

- Works on both Ropsten and Mainnet. 

## Installation
This is built on top of vanilla CRA, so to run locally, Simply clone the project

```
sudo npm install
npm start
```
All the needed env variables should already be in the .env file

You currently need to use Metamask to login (Support for other providers is on the roadmap)

The app works on Mainnet (networkVersion 1) and Ropsten (networkVersion 3)


## Screenshots

- Swap tokens allows swapping of convertible as well as smart tokens.

![Swap tokens](https://github.com/pRoy24/Katana/blob/master/screenshots/swap.png)

- Fund/Liquidate/Discover pools

![Fund Liquidate pools](https://github.com/pRoy24/Katana/blob/master/screenshots/fund_liquidate.png)

- Create new pools 

![Create new pools image](https://github.com/pRoy24/Katana/blob/master/screenshots/create.png)


## Limitations and future work

- Currently the app only supports swapping of and creating pools with ERC20 tokens. Future iterations will support all networks supported by Bancor protocol.

- App only supports login via metamask, future work will make the app provider agnostic allow login via multiple web3 providers.

- Only 2 reserve tokens are supported for each liquidiy pool.

- Currently The app can be integrated into an existing web-app via cloning the project, installing the dependancies and importing the Landing component,
  future iterations will make this available as a node module.



