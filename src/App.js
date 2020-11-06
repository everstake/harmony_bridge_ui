import './App.css';
import React, {useState, createContext} from "react";
import {PickWallet} from "./PickWallet";
import {TestContract} from "./TestContract";
import {Swap} from "./Swap";

export const AppContext = createContext({});
const config = require("./config");

function App() {
    const [balance, setBalance] = useState("");
    const [account, setAccount] = useState(null);
    const [harmony, setHarmony] = useState(null);

    const onWalletChanged = async () => {
        console.log('onWalletChanged', account, harmony);
        if (!harmony || !account) {
            return
        }
        const balance = await harmony.blockchain.getBalance({
            address: account,
            shardID: 0,
        }).then((r) => r).catch(() => "error");
        console.log('balance', balance);
        setBalance(harmony.utils.hexToBN(balance.result).toString());
    };

    React.useEffect(onWalletChanged, [account, harmony]);

    const contextValues = {
        harmony,
        setHarmony,
        account,
        setAccount,
    };

    window.hrm = harmony;

    return (
        <AppContext.Provider value={contextValues}>
            <div className="App" style={{backgroundColor: "#9a9", height: "100vh"}}>
                <div className="Header">
                    <PickWallet/>
                    <span>Address {account}</span>
                    {account ? <span>Balance {balance}</span> : ""}
                </div>
                <br/>
                {account ? <div>
                    {
                        config.tokens.map(t => <Swap key={t} assetID={t}/>)
                    }
                </div> : ""}
                {account ? <TestContract/> : ""}
            </div>
        </AppContext.Provider>
    );
}

export default App;
