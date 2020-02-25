import BigNumber from "bignumber.js";

export const zeroAddress = "0x0000000000000000000000000000000000000000";

export const fromDecimals = (amount, decimals) => {
  return new BigNumber(amount).dividedBy(10 ** Number(decimals)).toString(10);
};

export const toDecimals = (amount, decimals) => {
  return new BigNumber(amount)
    .multipliedBy(10 ** Number(decimals))
    .toString(10);
};

export const toFixed = amount => {
  const amountInt = Number(amount);

  if (!amount || amountInt === 0) {
    return "0";
  } else if (amountInt > 0.001) {
    return String(amountInt.toFixed(5));
  } else {
    return "<0.001";
  }
};
