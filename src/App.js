import React, { useState, useEffect } from "react";
import * as fcl from "@onflow/fcl";
import {Magic} from 'magic-sdk';
import { FlowExtension } from '@magic-ext/flow';
import "./styles.css";


// CONFIGURE ACCESS NODE
fcl.config().put("accessNode.api", "https://access-testnet.onflow.org");

// CONFIGURE WALLET
// replace with your own wallets configuration
// Below is the local environment configuration for the dev-wallet
fcl
  .config()
  .put("challenge.handshake", "http://access-001.devnet9.nodes.onflow.org:8000");


const magic = new Magic('pk_test_8027A11635E49A34', {
  extensions: [
    new FlowExtension({
      rpcUrl: 'https://access-testnet.onflow.org'
    })
  ]
});

// CONFIGURE AUTHORIZATION FUNCTION
// replace with your authorization function.
// const AUTHORIZATION_FUNCTION = fcl.currentUser().authorization;
const AUTHORIZATION_FUNCTION = magic.flow.authorization;


export default function App() {
  const [email, setEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [publicAddress, setPublicAddress] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [userMetadata, setUserMetadata] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    magic.user.isLoggedIn().then(async magicIsLoggedIn => {
      setIsLoggedIn(magicIsLoggedIn);
      if (magicIsLoggedIn) {
        const { publicAddress } = await magic.user.getMetadata();
        setPublicAddress(publicAddress);
        setUserMetadata(await magic.user.getMetadata());
      }
    });
  }, [isLoggedIn]);

  const login = async () => {
    await magic.auth.loginWithMagicLink({ email });
    setIsLoggedIn(true);
  };

  const logout = async () => {
    await magic.user.logout();
    setIsLoggedIn(false);
  };

  const verify = async () => {

    try {
      const getReferenceBlock = async () => {
        const response = await fcl.send([fcl.getLatestBlock()])
        const data = await fcl.decode(response)
        return data.id
      }


      console.log("SENDING TRANSACTION");
      setVerifying(true);
      var response = await fcl.send([
        fcl.transaction`
      transaction {
        var acct: AuthAccount

        prepare(acct: AuthAccount) {
          self.acct = acct
        }

        execute {
          log(self.acct.address)
        }
      }
    `,
        fcl.ref(await getReferenceBlock()),
        fcl.proposer(AUTHORIZATION_FUNCTION),
        fcl.authorizations([AUTHORIZATION_FUNCTION]),
        fcl.payer(AUTHORIZATION_FUNCTION)
      ]);
      console.log("TRANSACTION SENT");
      console.log("TRANSACTION RESPONSE", response);

      console.log("WAITING FOR TRANSACTION TO BE SEALED");
      var data = await fcl.tx(response).onceSealed();
      console.log("TRANSACTION SEALED", data);
      setVerifying(false);

      if (data.status === 4 && data.statusCode === 0) {
        setMessage("Congrats!!! I Think It Works");
      } else {
        setMessage(`Oh No: ${data.errorMessage}`);
      }
    } catch (error) {
      console.error("FAILED TRANSACTION", error);
    }
  };

  return (
      <div className="App">
        {!isLoggedIn ? (
            <div className="container">
              <h1>Please sign up or login</h1>
              <input
                  type="email"
                  name="email"
                  required="required"
                  placeholder="Enter your email"
                  onChange={event => {
                    setEmail(event.target.value);
                  }}
              />
              <button onClick={login}>Send</button>
            </div>
        ) : (
            <div>
              <div>
                <div className="container">
                  <h1>Current user: {userMetadata.email}</h1>
                  <button onClick={logout}>Logout</button>
                </div>
              </div>
              <div className="container">
                <h1>Flow address</h1>
                <div className="info">
                    {publicAddress}
                </div>
              </div>
              <div className="container">
                <h1>Verify Transaction</h1>
                {
                  verifying ? <div className="sending-status">
                    Verifying Transaction
                  </div> : ''
                }
                <div className="info">
                  <div>
                    {message}
                  </div>
                </div>
                <button id="btn-deploy" onClick={verify}>
                  Verify
                </button>
              </div>
            </div>
        )}
      </div>
  );
}
