## Allow funding of pool with a single reserve token.
This feature allows any pool to be funded using just one of the pool reserves.

All calculations are done on client side and the conversion amounts are generated using Bancor forumulae.

This feature does not require depositing the reseve into any intermediate smart contract and all interactions are made
directly between the user wallet and Bancor contracts and as such any remainder balance after funding/liquidation is deposited into the user wallet.


## This feature was completed in response to Bancor Funding the future [challenge](https://gitcoin.co/issue/bancorprotocol/contracts/344/4119)*

**Live Demo URL Hosted at**

This feature is currently experimental so please switch to Ropsten network to test this feature.

*Screenshot*
![screenshot](https://github.com/pRoy24/katanapools/blob/master/screenshots/fund_liquidate_single.png)


# Implementation details-
To user provides the amount of pool token that they'd like to purchase and the reserve token that they want to purchase in.
Then the app colculates the amount of chosen reseve needed for each of the other reserve token swaps and converts them.

Intead of using a third party contract converting the chosen reserve into the other reserves, the app allows the user to sign the transaction and accept the other reserves in their wallet.

This allows the user to be in full control of the conversion process and any remainder reserves after the pool funding/withdrawl are left with the user rather than being deposited into a third party contract.

Additionally the app also allows the user to create pools of arbitrary weights and with or without the network hub token and fund or liquidate pools