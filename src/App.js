import React, { useState, useEffect } from "react";
import * as fcl from "@onflow/fcl";
import { Magic } from "magic-sdk";
import { FlowExtension } from "@magic-ext/flow";
import "./styles.css";

// CONFIGURE ACCESS NODE
fcl.config().put("accessNode.api", "https://rest-testnet.onflow.org");



const magic = new Magic("pk_live_A0518BB95A143BFB", {
  extensions: [
    new FlowExtension({
      rpcUrl: "https://rest-testnet.onflow.org",
      network: "testnet"
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
    magic.user.isLoggedIn().then(async (magicIsLoggedIn) => {
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

  const purchase = async () => {
    await magic.nft.purchase({
      nft: {
        name: "Test NFT",
        blockchainNftId: "149939964",
        contractAddress: "0xe269be5ac12bad24",
        imageUrl: "https://cdn.shopify.com/s/files/1/0568/1132/3597/files/HWNFT_S4_modular-grid_584x800b.jpg?v=1669157307",
        network: "flow",
        platform: "mattel",
        type: "nft_secondary",
      },
      identityPrefill: {
        firstName: "john",
        lastName: "doe",
        dateOfBirth: "1990-01-01",
        emailAddress: "john.doe@gmail.com",
        // phone: "1 123-456-7890",
        address: {
          street1: "123 Main St",
          street2: "Apt 1",
          city: "San Francisco",
          regionCode: "CA",
          postalCode: "94103",
          countryCode: "US",
        },
      }
    });
  };

  const verify = async () => {
    try {

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
        fcl.proposer(AUTHORIZATION_FUNCTION),
        fcl.authorizations([AUTHORIZATION_FUNCTION]),
        fcl.payer(AUTHORIZATION_FUNCTION),
        fcl.limit(9999)
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
            onChange={(event) => {
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
                <div className="info">{publicAddress}</div>
              </div>
              <div className="container">
                <h1>Verify Transaction</h1>
                {verifying ? (
                    <div className="sending-status">Verifying Transaction</div>
                ) : (
                    ""
                )}
                <div className="info">
                  <div>{message}</div>
                </div>
                <button id="btn-deploy" onClick={verify}>
                  Verify
                </button>
              </div>
              <div className="container">
                <h1>Purchase NFT</h1>
                <button onClick={purchase}>Purchase</button>
              </div>
            </div>
      )}
    </div>
  );
}
