import './App.css';
import React, { useState, createContext } from "react";
import { PickWallet } from "./PickWallet";
import { Swap } from "./Swap";
import { Select } from "antd";
import { EdgewareSwap } from "./EdgewareSwap";

import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'
import './styles/App.scss';

const { Option } = Select;

export const AppContext = createContext({});
const config = require("./config");

function App() {
    const [account, setAccount] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [walletAPI, setWalletAPI] = useState(null);
    const [currentAsset, setCurrentAsset] = useState("Harmony");
    const [walletType, setWalletType] = useState("");
    const [assets, setAssets] = useState([]);

    const onWalletChanged = async () => {
        if (!walletAPI || !account) {
            return
        }

        if (walletType === "MathWallet Harmony") {

            setAssets([
                "Harmony",
                ...config.tokens,
            ]);
            setCurrentAsset("Harmony");
        } else {

            setAssets([
                "Edgeware",
                ...config["edgeware-tokens"],
            ]);
            setCurrentAsset("Edgeware");
        }
    };

    React.useEffect(onWalletChanged, [account, walletAPI, walletType]);

    const contextValues = {
        walletAPI,
        setWalletAPI,
        account,
        setAccount,
        setAccounts,
        setWalletType,
    };

    const getHarmonySwapBlock = () => {
        return account ? (
            <div>
                <div className="pick-head">
                    <div>
                        {
                            accounts.length === 1 ?
                                <span><strong>Address:</strong> {account}</span>
                                :
                                <div>
                                    <span>Account</span>
                                    <Select value={account} onChange={setAccount}>
                                        {accounts.map(v => <Option key={v} value={v}>{v}</Option>)}
                                    </Select>
                                </div>
                        }
                    </div>
                    <div className="pick-asset">
                        <strong>Pick asset: </strong>
                        <Select value={currentAsset} onChange={setCurrentAsset}>
                            {assets.map(v => <Option key={v} value={v}>{v}</Option>)}
                        </Select>
                    </div>
                </div>
                <Swap assetID={currentAsset} />
            </div>
        ) : ""
    };

    const getEdgewareSwapBlock = () => {
        return account ? (
            <div>
                <div className="pick-head">
                    <div>
                        {
                            accounts.length === 1 ?
                                <span><strong>Address:</strong> {account}</span>
                                :
                                <div>
                                    <span>Account</span>
                                    <Select value={account} onChange={setAccount}>
                                        {accounts.map(v => <Option key={v} value={v}>{v}</Option>)}
                                    </Select>
                                </div>
                        }
                    </div>
                    <div className="pick-asset">
                        <strong>Pick asset: </strong>
                        <Select value={currentAsset} onChange={setCurrentAsset}>
                            {assets.map(v => <Option key={v} value={v}>{v}</Option>)}
                        </Select>
                    </div>
                </div>
                <EdgewareSwap assetID={currentAsset}></EdgewareSwap>
            </div>
        ) : ""
    };

    return (
        <AppContext.Provider value={contextValues}>
            <div className="App">
                <div className="Header">
                    <div className="container">
                        <PickWallet />

                        {/* <br/> */}

                        {
                            walletType === "MathWallet Harmony" || walletType === "Harmony" ? getHarmonySwapBlock() : getEdgewareSwapBlock()
                        }
                    </div>
                </div>
            </div>
            <div className={"test-sass"}></div>
        </AppContext.Provider>
    );
}

export default App;
