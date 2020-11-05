import './App.css';
import React, {useState, createContext} from "react";
import {PickWallet} from "./PickWallet";

export const AppContext = createContext({});

function App() {
    const [balance, setBalance] = useState(0);
    const [harmony, setHarmony] = useState(0);

    const handleUpdateBalance = async () => {
        // const {Harmony} = require('@harmony-js/core');
        // const {ChainID, ChainType} = require('@harmony-js/utils');

        // const harmony = new Harmony('wss://ws.s0.b.hmny.io', {
        //     chainUrl: 'wss://ws.s0.b.hmny.io',
        //     chainId: ChainID.Default,
        //     chainType: ChainType.Harmony,
        // });
        // const harmony = new Harmony('https://api.s0.b.hmny.io', {
        //     chainUrl: 'https://api.s0.b.hmny.io',
        //     chainId: ChainID.Default,
        //     chainType: ChainType.Harmony,
        // });

        console.log('harmony', harmony);


        const balance = await harmony.blockchain.getBalance({
            address: "one170h7vcj2gmxsdtc9m6sa6d482mhpsmqd69ejv8",
            shardID: 0,
        }).then((r) => r.result).catch(() => "error");
        console.log(balance);
        setBalance(harmony.utils.hexToBN(balance).toString());
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

    return (
        <AppContext.Provider value={{harmony, setHarmony}}>
            <div className="App" style={{backgroundColor: "#9a9", height: "100vh"}}>
                <div className="Header">
                    <PickWallet/>
                    <span>Balance {balance}</span>
                    <button onClick={handleUpdateBalance}>
                        update balance
                    </button>
                </div>
            </div>
        </AppContext.Provider>
    );
}

export default App;
