// Types and Interfaces - JavaScript/TypeScript Port
// Port of types.rs

/**
 * @typedef {Object} TokenBalance
 * @property {number} amount
 * @property {number} decimals
 * @property {number} [balanceFormatted]
 */

/**
 * @typedef {Object} TransactionResult
 * @property {boolean} success
 * @property {string} [signature]
 * @property {string} [error]
 * @property {boolean} confirmed
 * @property {boolean} finalized
 * @property {number} [slot]
 * @property {number} [feePaid]
 */

/**
 * @typedef {Object} TradeData
 * @property {string} tokenMint
 * @property {string} [actualTokenTraded]
 * @property {string} trader
 * @property {number} amount
 * @property {string} dex
 * @property {string[]} allDexs
 * @property {string} dexType
 * @property {boolean} isAggregated
 * @property {boolean} isSell
 * @property {boolean} isBuy
 */

/**
 * @typedef {Object} SellResult
 * @property {boolean} success
 * @property {string} tokenMint
 * @property {string} triggerType
 * @property {string} triggerDetails
 * @property {number} timestamp
 * @property {string} [transactionSignature]
 * @property {string} [error]
 * @property {number} balanceSold
 * @property {number} [solReceived]
 */

/**
 * @typedef {Object} TokenHolderInfo
 * @property {string} wallet
 * @property {number} amount
 * @property {number} percentage
 */

/**
 * @typedef {Object} TriggersActive
 * @property {boolean} topHolderSell
 * @property {boolean} liquidityRemoval
 * @property {boolean} accountFreeze
 */

/**
 * @typedef {Object} MonitoredToken
 * @property {string[]} topHolders
 * @property {string} [liquidityPool]
 * @property {Object} metadata
 * @property {number} addedAt
 * @property {TriggersActive} triggersActive
 * @property {string} [shyftCallbackId]
 * @property {string} [tokenPairAddr]
 * @property {string} [tokenAccount]
 */

/**
 * Creates a default TransactionResult
 * @returns {TransactionResult}
 */
function createDefaultTransactionResult() {
  return {
    success: false,
    signature: null,
    error: null,
    confirmed: false,
    finalized: false,
    slot: null,
    feePaid: null,
  };
}

/**
 * Creates a default TriggersActive
 * @returns {TriggersActive}
 */
function createDefaultTriggersActive() {
  return {
    topHolderSell: true,
    liquidityRemoval: true,
    accountFreeze: true,
  };
}

module.exports = {
  createDefaultTransactionResult,
  createDefaultTriggersActive,
};
