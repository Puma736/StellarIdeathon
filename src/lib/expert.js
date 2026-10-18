import { EXPERT_TX_URL } from "../config.js";

/** Comprobante público: https://stellar.expert/explorer/testnet/tx/HASH */
export function expertUrl(hash) {
  return `${EXPERT_TX_URL}/${hash}`;
}
