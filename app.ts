import {
  Keypair,
  Transaction,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  clusterApiUrl,
  Connection,
  PublicKey,
  Cluster,
} from "@solana/web3.js";
import { TokenListProvider } from "@solana/spl-token-registry";
import {
  AccountLayout,
  TOKEN_PROGRAM_ID,
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
} from "@solana/spl-token";
import { Keys } from "./keys";

(async () => {
  const network = {
    mainnet: "mainnet-beta",
    devnet: "devnet",
    testnet: "testnet",
  };

  const keys = new Keys("my 12 word mnemonic");
  const xSolAddr = "BdUJucPJyjkHxLMv6ipKNUhSeY3DWrVtgxAES1iSBAov"

  // list spl tokens
  const tokenListProvider = new TokenListProvider();
  const tokenListContainer = await tokenListProvider.resolve();
  const list = tokenListContainer
    .filterByClusterSlug(network.mainnet)
    .getList();
  const token = list.filter(
    (token) => token.address == xSolAddr
  );
  console.log(token);

  const connection = new Connection(
    clusterApiUrl(network.mainnet as Cluster),
    "confirmed"
  );
  const keyPair = Keypair.fromSecretKey(
    (await keys.getKeyPair("0")).secretKey,
    { skipValidation: false }
  );

  // get SOL balance
  const key = keys.getEncodedKeyPair(keyPair);
  const result = await connection.getBalance(keyPair.publicKey);
  console.log(`${key.address} has ${result / LAMPORTS_PER_SOL} sol`);

  // Get owned tokens and token balance
  const tokenAccounts = await connection.getTokenAccountsByOwner(
    keyPair.publicKey,
    { programId: TOKEN_PROGRAM_ID }
  );
  tokenAccounts.value.forEach((ta) => {
    const accountInfo = AccountLayout.decode(ta.account.data);
    console.log(
      `${new PublicKey(accountInfo.mint)}   
      ${Number(accountInfo.amount) / LAMPORTS_PER_SOL}`
    );
  });

  // if knowing Mint(a.k.a Token) address you can just get the balance
  {
    const quicknodeAddr = "DcTmx4VLcf5euAB17nynax7g55xuB3XKBDyz1pudMcjW";
    const result = await connection.getTokenAccountsByOwner(
      new PublicKey(quicknodeAddr),
      { mint: new PublicKey("EAU1dDVypbHQ1GtnDHZAfc2UzcUEx4YFe1N9kS1vSvWx") }
    );
    const accountInfo = AccountLayout.decode(result.value[0].account.data);
    console.log(accountInfo);
    console.log(Number(accountInfo.amount) / LAMPORTS_PER_SOL);
  }

  // Transfer Tokens
  const mint = new PublicKey(xSolAddr);
  const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    keyPair,
    mint,
    keyPair.publicKey
  );
  const toTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    keyPair,
    mint,
    new PublicKey("EEaoy13dg3MsC9WrvfJqRkj8devS5yYaTCuLX3iFHyMc")
  );
  console.log(fromTokenAccount.address);
  console.log(toTokenAccount.address);

  const tx = new Transaction().add(
    createTransferInstruction(
      fromTokenAccount.address,
      toTokenAccount.address,
      keyPair.publicKey,
      0.1 * LAMPORTS_PER_SOL
    )
  );
  const signature = await sendAndConfirmTransaction(connection, tx, [keyPair]);
  console.log(signature);
})();
