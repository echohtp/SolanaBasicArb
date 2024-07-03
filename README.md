# Solana Arbitrage Bot

This project implements a simple arbitrage bot for the Solana blockchain using Node.js, the Solana web3.js library, and the Jupiter aggregator.

## Features

- Connects to Solana network using QuickNode RPC
- Utilizes Jupiter aggregator for efficient token swaps
- Implements basic arbitrage strategy

## Prerequisites

- Node.js (v14 or higher recommended)
- yarn (Node Package Manager)
- A Solana wallet with some SOL for transaction fees

## Installation

1. Clone the repository:
```
git clone https://github.com/yourusername/solana-arbitrage-bot.git
cd solana-arbitrage-bot
```

2. Install dependencies:
```
yarn install
```

3. Set up your environment variables:
Create a `.env` file in the root directory with the following content:

```
#Replace with your Solana wallet secret key
SECRET_KEY=[...]

#Replace with your QuickNode Solana Mainnet RPC endpoint
SOLANA_ENDPOINT=https://your-quicknode-endpoint.com

#Optional: Jito Solana endpoint (if using)
JITO_SOLANA_ENDPOINT=

# Replace with your QuickNode Jupiter API endpoint (or use a public one)
JUP_ENDPOINT=https://quote-api.jup.ag
```

## Usage

To run the arbitrage bot:
```
ts-node bot.ts
```

## Configuration

You can modify the bot's behavior by adjusting parameters in the main script file. This may include:

- Token pairs to monitor
- Minimum profit threshold
- Polling interval

## Results

<img width="825" alt="image" src="https://github.com/echohtp/SolanaBasicArb/assets/313060/aced5b15-cabb-481e-a2ea-4694c1e44b0a">

## Disclaimer

This bot is for educational purposes only. Use it at your own risk. Cryptocurrency trading, especially arbitrage, carries significant financial risks.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).
