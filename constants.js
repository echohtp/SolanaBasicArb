const { Connection, LAMPORTS_PER_SOL } = require("@solana/web3.js");

const SLIPPAGE_BPS = 10;

const POSITION_SIZE = {
  BONK: 0.0001 * LAMPORTS_PER_SOL,
  USDC: 10,
  SOL: 0.05 * LAMPORTS_PER_SOL
};

const TOKENS = {
  SOL: "So11111111111111111111111111111111111111112",
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  BONK: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"
};

const CONNECTION = new Connection(process.env.SOLANA_ENDPOINT, "confirmed");

const JITO_CONNECTION = new Connection(
  process.env.JITO_SOLANA_ENDPOINT,
  "confirmed"
);

module.exports = {
  POSITION_SIZE,
  SLIPPAGE_BPS,
  TOKENS,
  CONNECTION,
  JITO_CONNECTION,
};
