import React, {useContext, useEffect, useState} from "react";
import {AppContext} from "./App";

const config = require("./config");
const Bridge = require("./contracts/Bridge");
const Token = require("./contracts/EdgewareToken");

export function EdgewareSwap({assetID}) {
    const [balance, setBalance] = useState("");
    const [receiver, setReceiver] = useState("5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty");
    const [assetName, setAssetName] = useState("");
    const [inputValue, setInputValue] = useState(0);
    const {harmony, account, updateBalance} = useContext(AppContext);
    const [balanceCoin, setBalanceCoin] = useState("");

    const updateCoinBalance = async () => {
        if (!harmony || !account) {
            return
        }
        console.log('harmony', harmony);
        window.hrm = harmony;

        const { data } = await harmony.query.system.account(account);
        console.log(data["free"]);
        setBalanceCoin(data["free"].toString(10));
    };

    const refreshInfo = async () => {
        if (!harmony) {
            return;
        }
        // if (assetID === "Harmony") {
        //     setAssetName("Harmony");
        // } else {
        //     const token = harmony.contracts.createContract(Token.abi, assetID);
        //     const balanceResult = await token.methods.balanceOf(account).call();
        //     setBalance(balanceResult.toString());
        //     const nameResult = await token.methods.name().call();
        //     setAssetName(nameResult);
        // }
        await updateCoinBalance();
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

    const handleTransferToken = async () => {
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

    const handleTransferCoin = async () => {
        if (!harmony) {
            return;
        }
        const bridge = await harmony.contracts.createContract(Bridge.abi, config.bridge);
        await bridge.methods.transferCoin(receiver).send({
            from: account,
            gasLimit: 8000000,
            gasPrice: 1000000000,
            value: inputValue
        });

        refreshInfo().catch();
    };

    return <div className={"SwapContainer-Edgeware"}>
        <button onClick={refreshInfo}>
            update info
        </button>
        <br/>

        <span>Token {assetName}({assetID})</span>
        <br/>

        {assetID === "edgeware" ? <span>token balance {balanceCoin}</span> : <span>token balance {balance}</span>}
        <br/>

        <div className={"SwapParams"}>
            <span>Receiver:</span>
            <input type="text" value={receiver} onChange={handleReceiver}/>

            <span>Amount:</span>
            <input type="text" value={inputValue} onChange={onChangeTransferValue}/>

            <button onClick={assetID === "edgeware" ? handleTransferCoin : handleTransferToken}>
                {assetID === "edgeware" ? "Transfer coin" :  "Transfer token"}
            </button>
        </div>
    </div>
}
