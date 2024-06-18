import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { StacksMainnet } from "@stacks/network";
import {
  AppConfig,
  openContractCall,
  showConnect,
  UserData,
  UserSession,
} from "@stacks/connect";
import { AlexSDK, Currency } from "alex-sdk";

const appConfig = new AppConfig([]);
const userSession = new UserSession({ appConfig });
const appDetails = {
  name: "Alex Swap Example",
  icon: "https://cdn.alexlab.co/logos/ALEX_Token.png",
};

const alex = new AlexSDK();

function App() {
  const [allCurrencies, setAllCurrencies] = useState<Currency[]>([]);
  useEffect(() => {
    alex
      .fetchSwappableCurrency()
      .then((x) => setAllCurrencies(x.map((y) => y.id)));
  }, []);
  const [userData, setUserData] = useState<UserData | undefined>(undefined);

  useEffect(() => {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        setUserData(userData);
      });
    } else if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData());
    }
  }, []);

  const onConnectWallet = useCallback(() => {
    showConnect({
      appDetails,
      onFinish: () => window.location.reload(),
      userSession,
    });
  }, []);

  const [from, setFrom] = useState<Currency>(Currency.STX);
  const [amount, setAmount] = useState("");
  const [to, setTo] = useState<Currency>("token-alex" as Currency);

  const valid =
    from != null &&
    to != null &&
    amount !== "" &&
    !isNaN(Number(amount)) &&
    from !== to;

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 5,
          marginBottom: 10,
        }}
      >
        <button
          onClick={async () => {
            // const result = await alex.fetchTokenList();
            // console.log(result)
            // alert(JSON.stringify(result, null, 2));
          }}
        >
          Get Token Infos
        </button>
        <button
          onClick={async () => {
            const result = await alex.getLatestPrices();
            console.log(result);
            alert(JSON.stringify(result, null, 2));
          }}
        >
          Get Currency Prices
        </button>
        <p>From:</p>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="amount"
        />
        <select
          value={from}
          onChange={(e) => setFrom(e.target.value as Currency)}
        >
          {allCurrencies.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <p>to:</p>
        <select value={to} onChange={(e) => setTo(e.target.value as Currency)}>
          {allCurrencies.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>
      {userData == null ? (
        <button onClick={onConnectWallet}>Connect Wallet</button>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <button
            disabled={!valid}
            onClick={async () => {
              const result = await alex.getFeeRate(from!, to!);
              const feeRate = Number(result) / 1e8;
              alert(
                `Fee rate is ${feeRate * 100}%, fee is ${
                  Number(amount) * feeRate
                } ${from}`,
              );
            }}
          >
            Get Fee
          </button>
          <button
            disabled={!valid}
            onClick={async () => {
              const result = await alex.getAmountTo(
                from!,
                BigInt(Number(amount) * 1e8),
                to!,
              );
              alert(`You will get ${Number(result) / 1e8} ${to}`);
            }}
          >
            Get Rate
          </button>
          <button
            disabled={!valid}
            onClick={async () => {
              const routers = await alex.getRouter(from!, to!);
              alert(`Routers: ${routers.join(" -> ")}`);
            }}
          >
            Get Route
          </button>
          <button
            disabled={!valid}
            onClick={async () => {
              const stxAddress = userData!.profile.stxAddress.mainnet;
              const tx = await alex.runSwap(
                stxAddress,
                from!,
                to!,
                BigInt(Number(amount) * 1e8),
                BigInt(0),
              );
              await openContractCall({
                ...tx,
                network: new StacksMainnet(),
              });
            }}
          >
            Swap
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
