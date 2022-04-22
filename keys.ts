import bs58 from "bs58";
import { derivePath } from "ed25519-hd-key";
import { mnemonicToSeed } from "bip39";
import { Keypair } from "@solana/web3.js";

export class Keys {
  accountBIP = "m/44'/501'/0'/?'";
  mnemonic: string;

  constructor(mnemonic: string) {
    this.mnemonic = mnemonic;
  }

  async getKeyPair(index: string) {
    const seed = await mnemonicToSeed(this.mnemonic);
    const derivedSeed = derivePath(
      this.accountBIP.replace("?", index),
      seed.toString("hex")
    ).key;
    return Keypair.fromSeed(derivedSeed);
  }

  getEncodedKeyPair(keyPair: Keypair) {
    return {
      address: keyPair.publicKey.toString(),
      privateKey: bs58.encode(keyPair.secretKey),
    };
  }

  keyToArray(key: string) {
    return bs58.decode(key);
  }
}
