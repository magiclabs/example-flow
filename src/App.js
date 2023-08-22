import React, { useState, useEffect } from "react";
import * as fcl from "@onflow/fcl";
import { Magic } from "magic-sdk";
import { FlowExtension } from "@magic-ext/flow";
import "./styles.css";

// CONFIGURE ACCESS NODE.
fcl.config().put("accessNode.api", "https://rest-testnet.onflow.org");



const magic = new Magic("pk_live_E8937B09A02CF1F7", {
  extensions: [
    new FlowExtension({
      rpcUrl: "https://rest-testnet.onflow.org",
      network: "testnet"
    })
  ]
});


export default function App() {
  const [email, setEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [publicAddress, setPublicAddress] = useState("");
  const [userMetadata, setUserMetadata] = useState({});
  const [nftId, setNftId] = useState("149939964");
  const [contractAddress, setContractAddress] = useState("0xe269be5ac12bad24");


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
    const res = await magic.nft.purchase({
      nft: {
        name: "Test NFT",
        blockchainNftId: nftId,
        contractAddress: contractAddress,
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
    console.log(res);
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
                <h1>NFT ID</h1>
                <input type="text" id="nftid" value={nftId} onChange={event => setNftId(event.target.value)}/>
                <h1>Contract Address</h1>
                <input type="text" id="contractaddress" value={contractAddress} onChange={event => setContractAddress(event.target.value)} />
                <button onClick={purchase}>Purchase</button>
              </div>
            </div>
      )}
    </div>
  );
}
