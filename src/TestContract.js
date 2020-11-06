import React, {useContext, useEffect, useState} from "react";
import {AppContext} from "./App";

const config = require("./config");
const Bridge = require("./contracts/Bridge");

export function TestContract() {
    const [fee, setFee] = useState(0);
    const [inputFee, setInputFee] = useState(0);
    const {harmony, account} = useContext(AppContext);

    const refreshInfo = async () => {
        if (!harmony) {
            return;
        }
        const bridge = harmony.contracts.createContract(Bridge.abi, config.bridge);
        const feeResult = await bridge.methods.fee().call();
        setFee(feeResult.toString());
    };

    useEffect(() => {
        refreshInfo().catch(console.error);
    }, [harmony]);

    const handleFee = (event) => {
        setInputFee(event.target.value);
    };

    const updateFee = async () => {
        if (!harmony) {
            return;
        }
        const bridge = harmony.contracts.createContract(Bridge.abi, config.bridge);
        await bridge.methods.setFee(inputFee).send({
            from: account,
            gas: 8000000,
            gasPrice: 10000000000
        });
        {
            const tx = await harmony.blockchain.getTransactionReceipt({
                txnHash: '0xb7763bc58b624246742a30908051503e357e828c07a35dc9cfc93ae85cde31c4'
            });
            console.log('tx', tx);
        }
        {
            const tx = await harmony.blockchain.getTransactionReceipt({
                txnHash: '0x1b573090e4aff7b889383663f327f9900674121b81eb4e8f8959166ed6113c9c'
            });
            console.log('tx', tx);
        }
    };

    return <div style={{backgroundColor: "#aac", padding: "100px"}}>
        <span>Test tx</span>
        <br/>
        <button onClick={refreshInfo}>
            get info from contract
        </button>
        <br/>
        <span>Fee {fee}</span>
        <br/>
        <input type="text" value={inputFee} onChange={handleFee}/>
        <button onClick={updateFee}>
            update fee
        </button>
    </div>
}
