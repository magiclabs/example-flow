import React, { useState, useEffect, ChangeEvent } from "react";
import * as fcl from "@onflow/fcl";
import { Magic, MagicUserMetadata } from "magic-sdk";
import { FlowExtension } from "@magic-ext/flow";
import "./styles.css";

// CONFIGURE ACCESS NODE
fcl.config().put("accessNode.api", "https://rest-testnet.onflow.org");

const magic = new Magic("pk_live_A0518BB95A143BFB", {
  extensions: [
    new FlowExtension({
      rpcUrl: "https://rest-testnet.onflow.org",
      network: "testnet",
    }),
  ],
});

// CONFIGURE AUTHORIZATION FUNCTION
// replace with your authorization function.
// const AUTHORIZATION_FUNCTION = fcl.currentUser().authorization;
const AUTHORIZATION_FUNCTION = magic.flow.authorization as any;

const App: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [publicAddress, setPublicAddress] = useState<string>("");
  const [verifying, setVerifying] = useState<boolean>(false);
  const [userMetadata, setUserMetadata] = useState<MagicUserMetadata | null>(
    null
  );
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    magic.user.isLoggedIn().then(async (magicIsLoggedIn: boolean) => {
      setIsLoggedIn(magicIsLoggedIn);
      if (magicIsLoggedIn) {
        const metadata = await magic.user.getInfo();
        setPublicAddress(metadata.publicAddress || "");
        setUserMetadata(metadata);
      }
    });
  }, [isLoggedIn]);

  const login = async (): Promise<void> => {
    await magic.auth.loginWithMagicLink({ email });
    setIsLoggedIn(true);
  };

  const logout = async (): Promise<void> => {
    await magic.user.logout();
    setIsLoggedIn(false);
  };

  const verify = async (): Promise<void> => {
    try {
      console.log("SENDING TRANSACTION");
      setVerifying(true);
      const response = await fcl.send([
        fcl.transaction`
      transaction {
        var acct: &Account

        prepare(acct: &Account) {
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
        fcl.limit(9999),
      ]);
      console.log("TRANSACTION SENT");
      console.log("TRANSACTION RESPONSE", response);

      console.log("WAITING FOR TRANSACTION TO BE SEALED");
      const data = await fcl.tx(response.transactionId).onceSealed();
      console.log("TRANSACTION SEALED", data);
      setVerifying(false);

      if (data.status === 4 && data.statusCode === 0) {
        setMessage("Congrats!!! I Think It Works");
      } else {
        setMessage(`Oh No: ${data.errorMessage}`);
      }
    } catch (error) {
      console.error("FAILED TRANSACTION", error);
      setVerifying(false);
    }
  };

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setEmail(event.target.value);
  };

  return (
    <div className="App">
      {!isLoggedIn ? (
        <div className="container">
          <h1>Please sign up or login</h1>
          <input
            type="email"
            name="email"
            required
            placeholder="Enter your email"
            onChange={handleEmailChange}
          />
          <button onClick={login}>Send</button>
        </div>
      ) : (
        <div>
          <div>
            <div className="container">
              <h1>Current user: {userMetadata?.email}</h1>
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
        </div>
      )}
    </div>
  );
};

export default App;
