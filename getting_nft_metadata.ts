// https://stackoverflow.com/questions/68913872/solana-web3-js-is-there-an-api-for-erc721-metadata
// https://docs.blockchainapi.com/#operation/solanaGetNFTsBelongingToWallet
import * as web3 from "@solana/web3.js";
import * as metadata from "./metadata"; // see metadata.ts

const mintAddress = "7YACVqDe9L5gUMP54uaV8gzPrRcYztscd7JnLiAQxEkR";

(async () => {
  // Connect to cluster
  var connection = new web3.Connection(
    web3.clusterApiUrl("mainnet-beta"),
    "confirmed"
  );

  // get metadata account that holds the metadata information
  const m = await metadata.getMetadataAccount(mintAddress);
  console.log("metadata acc: ", m);

  // get the account info for that account
  const accInfo = await connection.getAccountInfo(new web3.PublicKey(m));
  console.log(accInfo);

  // finally, decode metadata
  console.log(metadata.decodeMetadata(accInfo!.data));
})();
