import './App.css';
import React, {useState, createContext} from "react";
import {PickWallet} from "./PickWallet";
import {Swap} from "./Swap";
import {Select} from "antd";

const {Option} = Select;

export const AppContext = createContext({});
const config = require("./config");

function App() {
    const [balance, setBalance] = useState("");
    const [account, setAccount] = useState(null);
    const [harmony, setHarmony] = useState(null);
    const [currentAsset, setCurrentAsset] = useState("Harmony");
    const assets = [
        "Harmony",
        ...config.tokens
    ];

    const updateBalance = async () => {
        console.log('onWalletChanged', account, harmony);
        if (!harmony || !account) {
            return
        }
        const balance = await harmony.blockchain.getBalance({
            address: account,
            shardID: 0,
        }).then((r) => r).catch(() => "error");
        setBalance(harmony.utils.hexToBN(balance.result).toString());
    };

    const onWalletChanged = async () => {
        console.log('onWalletChanged', account, harmony);
        if (!harmony || !account) {
            return
        }
        await updateBalance();
    };

    React.useEffect(onWalletChanged, [account, harmony]);

    const contextValues = {
        harmony,
        setHarmony,
        account,
        setAccount,
        updateBalance,
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

                {
                    account ? (
                        <div>
                            <span>Pick asset:</span>
                            <Select value={currentAsset} onChange={setCurrentAsset}>
                                {assets.map(v => <Option key={v} value={v}>{v}</Option>)}
                            </Select>
                            <Swap assetID={currentAsset}/>
                        </div>
                    ) : ""
                }
            </div>
        </AppContext.Provider>
    );
}

export default App;
