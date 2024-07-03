const  {
  TransactionInstruction,
  PublicKey,
  AddressLookupTableAccount,
  Connection,
} = require("@solana/web3.js");
const { CONNECTION }  =require("./constants");


 const deserializeInstruction = (instruction) => {
  return new TransactionInstruction({
    programId: new PublicKey(instruction.programId),
    keys: instruction.accounts.map((key) => ({
      pubkey: new PublicKey(key.pubkey),
      isSigner: key.isSigner,
      isWritable: key.isWritable,
    })),
    data: Buffer.from(instruction.data, "base64"),
  });
};

 const getAddressLookupTableAccounts = async (keys)=> {
  const addressLookupTableAccountInfos =
    await CONNECTION.getMultipleAccountsInfo(
      keys.map((key) => new PublicKey(key))
    );

  return addressLookupTableAccountInfos.reduce((acc, accountInfo, index) => {
    const addressLookupTableAddress = keys[index];
    if (accountInfo) {
      const addressLookupTableAccount = new AddressLookupTableAccount({
        key: new PublicKey(addressLookupTableAddress),
        state: AddressLookupTableAccount.deserialize(accountInfo.data),
      });
      acc.push(addressLookupTableAccount);
    }

    return acc;
  }, new Array());
};

module.exports = {
  deserializeInstruction,
  getAddressLookupTableAccounts,
};