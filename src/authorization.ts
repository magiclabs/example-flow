import { ec as EC } from "elliptic";
import { SHA3 } from "sha3";
import * as fcl from "@onflow/fcl";

const ec = new EC("p256");

const ADDRESS = "f8d6e0586b0a20c7";
const PRIVATE_KEY =
  "2ee7761dabdd65f4bbd6c83a36a32423da5af1ea779de72685e38e75d3eeb600";

interface SigningData {
  message: string;
}

interface SignatureResult {
  addr: string;
  keyId: number;
  signature: string;
}

interface AccountRole {
  proposer?: boolean;
  authorizer?: boolean;
  payer?: boolean;
}

interface Account {
  role: AccountRole;
  [key: string]: any;
}

interface FlowAccount {
  keys: Array<{
    sequenceNumber: number;
    [key: string]: any;
  }>;
  [key: string]: any;
}

const hashMsgHex = (msgHex: string): Buffer => {
  const sha = new SHA3(256);
  sha.update(Buffer.from(msgHex, "hex"));
  return sha.digest();
};

export const signWithKey = (privateKey: string, msgHex: string): string => {
  const key = ec.keyFromPrivate(Buffer.from(privateKey, "hex"));

  const sig = key.sign(hashMsgHex(msgHex));
  const n = 32; // half of signature length?
  const r = sig.r.toArrayLike(Buffer, "be", n);
  const s = sig.s.toArrayLike(Buffer, "be", n);

  return Buffer.concat([r, s]).toString("hex");
};

export const authorization = async (account: Account = { role: {} }) => {
  const addr = ADDRESS;
  const keyId = 0;

  let sequenceNum: number | undefined;
  if (account.role.proposer) {
    const response = await fcl.send([fcl.getAccount(addr)]);
    const acct: FlowAccount = await fcl.decode(response);
    sequenceNum = acct.keys[keyId].sequenceNumber;
  }

  const signingFunction = (data: SigningData): SignatureResult => {
    return {
      addr,
      keyId,
      signature: signWithKey(PRIVATE_KEY, data.message),
    };
  };

  return {
    ...account,
    addr,
    keyId,
    signingFunction,
    sequenceNum,
  };
};
