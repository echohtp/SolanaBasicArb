const { parentPort, workerData } = require("worker_threads");

const {
  Keypair,
  TransactionMessage,
  ComputeBudgetProgram,
  VersionedTransaction,
} = require("@solana/web3.js");
const {
  getAddressLookupTableAccounts,
  deserializeInstruction,
} = require("./utils");
const { SLIPPAGE_BPS, POSITION_SIZE, CONNECTION } = require("./constants");
const { TOKENS } = require("./constants");
const LAMPORTS_PER_SOL = 1000000000;
const workerId = workerData.workerId;
const pair = workerData.tradePair;

let decodedSecretKey = Uint8Array.from(
  JSON.parse(process.env.SECRET_KEY ?? "")
);
const keypair = Keypair.fromSecretKey(decodedSecretKey);

async function doWork() {
  console.log(`Worker ${workerId} is working...`);
  const inQuote = await (
    await fetch(
      `https://quote-api.jup.ag/v6/quote?inputMint=${
        TOKENS[pair[0]]
      }&outputMint=${TOKENS[pair[1]]}&amount=${
        POSITION_SIZE[pair[0]]
      }&slippageBps=${SLIPPAGE_BPS}`
    )
  ).json();

  const outQuote = await (
    await fetch(
      `https://quote-api.jup.ag/v6/quote?inputMint=${
        TOKENS[pair[1]]
      }&outputMint=${TOKENS[pair[0]]}&amount=${
        inQuote["outAmount"]
      }&slippageBps=${SLIPPAGE_BPS}`
    )
  ).json();

  console.log(
    `${POSITION_SIZE[pair[0]]}->${inQuote["outAmount"]}->${
      outQuote["outAmount"]
    }`
  );

  if (outQuote["outAmount"] > POSITION_SIZE[pair[0]]) {
    console.log("Arbitrage opportunity found!");

    Promise.all([
      await fetch("https://quote-api.jup.ag/v6/swap-instructions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quoteResponse: inQuote,
          userPublicKey: keypair.publicKey.toBase58(),
        }),
      }),
      await fetch("https://quote-api.jup.ag/v6/swap-instructions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quoteResponse: outQuote,
          userPublicKey: keypair.publicKey.toBase58(),
        }),
      }),
    ]).then(async ([inQuote, outQuote]) => {
      // .json the responses and get the instructions
      Promise.all([inQuote.json(), outQuote.json()]).then(
        async ([inQuote, outQuote]) => {
          // console.log(inQuote);
          // console.log(outQuote);

          const addressLookupTableAccounts = [];

          addressLookupTableAccounts.push(
            ...(await getAddressLookupTableAccounts(
              inQuote.addressLookupTableAddresses
            )),
            ...(await getAddressLookupTableAccounts(
              outQuote.addressLookupTableAddresses
            ))
          );

          const blockhash = (await CONNECTION.getLatestBlockhash()).blockhash;
          const messageV0 = new TransactionMessage({
            payerKey: keypair.publicKey,
            recentBlockhash: blockhash,
            instructions: [
              ComputeBudgetProgram.setComputeUnitLimit({
                units: 3000000, // Set a higher limit, adjust as needed
              }),
              ComputeBudgetProgram.setComputeUnitPrice({
                microLamports: 1,
              }),
              ...inQuote.setupInstructions.map(deserializeInstruction),
              deserializeInstruction(inQuote.swapInstruction),
              deserializeInstruction(outQuote.swapInstruction),
              deserializeInstruction(outQuote.cleanupInstruction)
            ],
          }).compileToV0Message(addressLookupTableAccounts);
          const transaction = new VersionedTransaction(messageV0);

          // Sign the transaction
          transaction.sign([keypair]);
          try {
            // Send the transaction
            const signature = await CONNECTION.sendTransaction(transaction);
            console.log("Transaction sent with signature:", signature);

            // Wait for confirmation
            const confirmation = await CONNECTION.confirmTransaction(signature);
            console.log("Transaction confirmed:", confirmation);
          } catch (error) {
            console.error("Error sending transaction:", error);
          } finally {
            setTimeout(doWork, 5000); // Run every 5 seconds
          }
        }
      );
    });
  } else {
    console.log("No arbitrage opportunity found.");
    setTimeout(doWork, 5000); // Run every 5 seconds
  }

  // Send the result back to the main thread
  // parentPort.postMessage(`Worker ${workerId} produced: ${result}`);

  // Schedule the next iteration
}

console.log(`Worker ${workerId}: Pair: ${pair}`);
doWork();

// Keep the worker alive
setInterval(() => {
  // This empty interval keeps the worker's event loop running
}, 1000);
