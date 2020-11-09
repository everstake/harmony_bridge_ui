import React, {useContext, useEffect, useState} from "react";
import {AppContext} from "./App";

const config = require("./config");
const Bridge = require("./contracts/Bridge");
const Token = require("./contracts/EdgewareToken");

export function Swap({assetID}) {
    const [balance, setBalance] = useState("");
    const [receiver, setReceiver] = useState("");
    const [assetName, setAssetName] = useState("");
    const [inputValue, setInputValue] = useState(0);
    const {harmony, account} = useContext(AppContext);

    const refreshInfo = async () => {
        if (!harmony) {
            return;
        }
        const token = harmony.contracts.createContract(Token.abi, assetID);
        const balanceResult = await token.methods.balanceOf(account).call();
        setBalance(balanceResult.toString());
        const nameResult = await token.methods.name().call();
        setAssetName(nameResult);
    };

    useEffect(() => {
        refreshInfo().catch(console.error);
    }, [harmony, assetID]);

    const handleReceiver = (event) => {
        setReceiver(event.target.value);
    };

    const onChangeTransferValue = (event) => {
        setInputValue(event.target.value);
    };

    const handleTransfer = async () => {
        if (!harmony) {
            return;
        }
        const bridge = await harmony.contracts.createContract(Bridge.abi, config.bridge);
        await bridge.methods.transferToken(receiver, inputValue, assetID).send({
            from: account,
            gasLimit: 8000000,
            gasPrice: 1000000000
        });

        refreshInfo().catch();
    };

    return <div className={"SWapContainer"}>
        <button onClick={refreshInfo}>
            get info from contract
        </button>
        <br/>

        <span>Token {assetName}({assetID})</span>
        <br/>

        <span>balance {balance}</span>
        <br/>

        <div className={"SwapParams"}>
            <span>Receiver:</span>
            <input type="text" value={receiver} onChange={handleReceiver}/>

            <span>Amount:</span>
            <input type="text" value={inputValue} onChange={onChangeTransferValue}/>

            <button onClick={handleTransfer}>
                Transfer
            </button>
        </div>
    </div>
}
