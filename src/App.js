import './App.css';
import React, {useState, createContext} from "react";
import {PickWallet} from "./PickWallet";

export const AppContext = createContext({});

function App() {
    const [balance, setBalance] = useState(0);
    const [account, setAccount] = useState("");
    const [harmony, setHarmony] = useState(null);

    const onWalletChanged = async () => {
        if(!harmony) {
            return
        }
        // const balance = await harmony.blockchain.getBalance({
        //     address: account,
        //     shardID: 0,
        // }).then((r) => r.result).catch(() => "error");
        // setBalance(harmony.utils.to(harmony.utils.hexToBN(balance).toString()));
    };

    // {
    //     "type": "contract deploy",
    //     "tx": "0x4210cccd3efb16652850a0caefdfa60ba11e1ff507fc69e5fc4e0f26ab78ab26",
    //     "sender": "one1sjfqedsznhgzwf589tw2gvv56yne4vcjre4mnx",
    //     "contract": {
    //     "status": "deployed",
    //         "filename": "browser/Untitled.sol",
    //         "contractName": "Bridge",
    //         "address": "one1q3ee9usepm6p0f2jaygt7drh4z5d4ana6h4nql"
    // }
    // }

    const contextValues = {
        harmony,
        setHarmony: (what) => {
            setHarmony(what);
            onWalletChanged().catch();
        },
        account,
        setAccount
    };

    console.log('harmony', harmony);

    return (
        <AppContext.Provider value={contextValues}>
            <div className="App" style={{backgroundColor: "#9a9", height: "100vh"}}>
                <div className="Header">
                    <PickWallet/>
                    <span>Address {account}</span>
                    <span>Balance {balance}</span>
                </div>
            </div>
        </AppContext.Provider>
    );
}

export default App;
