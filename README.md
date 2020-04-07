## Allow funding of pool with a single reserve token.


* This feature was completed in response to Bancor Funding the future (challenge)[https://gitcoin.co/issue/bancorprotocol/contracts/344/4119] *

# To test this feature switch to Ropsten network

# Implementation details-
To user provides the amount of pool token that they'd like to purchase and the reserve token that they want to purchase in.
Then the app colculates the amount of chosen reseve needed for each of the other reserve token swaps and converts them.

Intead of using a third party contract converting the chosen reserve into the other reserves, the app allows the user to sign the transaction and accept the other reserves in their wallet.

This allows the user to be in full control of the conversion process and any remainder reserves after the pool funding/withdrawl are left with the user rather than being deposited into a third party contract.

Additionally the app also allows the user to create pools of arbitrary weights and with or without the network hub token and fund or liquidate pools