import React, {useContext, useEffect, useState} from "react";
import {AppContext} from "./App";

const config = require("./config");
const Bridge = require("./contracts/Bridge");
const Token = require("./contracts/EdgewareToken");

export function Swap({assetID}) {
    const [balance, setBalance] = useState("");
    const [receiver, setReceiver] = useState("one1swpff8afhyyc2yds6z7v2mk8vr5am5gkupgnh4");
    const [assetName, setAssetName] = useState("");
    const [inputValue, setInputValue] = useState(0);
    const {walletAPI, account} = useContext(AppContext);
    const [balanceCoin, setBalanceCoin] = useState("");

    const updateCoinBalance = async () => {
        if (!walletAPI || !account) {
            return
        }
        const balance = await walletAPI.blockchain.getBalance({
            address: account,
            shardID: 0,
        }).then((r) => r).catch(() => "error");
        setBalanceCoin(walletAPI.utils.hexToBN(balance.result).toString());
    };

    const refreshInfo = async () => {
        if (!walletAPI) {
            return;
        }
        if (assetID === "Harmony") {
            setAssetName("Harmony");
        } else {
            const token = walletAPI.contracts.createContract(Token.abi, assetID);
            const balanceResult = await token.methods.balanceOf(account).call();
            setBalance(balanceResult.toString());
            const nameResult = await token.methods.name().call();
            setAssetName(nameResult);
        }
        await updateCoinBalance();
    };

    useEffect(() => {
        refreshInfo().catch(console.error);
    }, [walletAPI, assetID]);

    const handleReceiver = (event) => {
        setReceiver(event.target.value);
    };

    const onChangeTransferValue = (event) => {
        setInputValue(event.target.value);
    };

    const handleTransferToken = async () => {
        if (!walletAPI) {
            return;
        }
        const bridge = await walletAPI.contracts.createContract(Bridge.abi, config.bridge);
        await bridge.methods.transferToken(receiver, inputValue, assetID).send({
            from: account,
            gasLimit: 8000000,
            gasPrice: 1000000000
        });

        refreshInfo().catch();
    };

    const handleTransferCoin = async () => {
        if (!walletAPI) {
            return;
        }
        const bridge = await walletAPI.contracts.createContract(Bridge.abi, config.bridge);
        await bridge.methods.transferCoin(receiver).send({
            from: account,
            gasLimit: 8000000,
            gasPrice: 1000000000,
            value: inputValue
        });

        refreshInfo().catch();
    };

    return <div className={"SwapContainer"}>
        <button onClick={refreshInfo}>
            update info
        </button>
        <br/>

        <span>Token {assetName}({assetID})</span>
        <br/>

        {assetID === "Harmony" ? <span>token balance {balanceCoin}</span> : <span>token balance {balance}</span>}
        <br/>

        <div className={"SwapParams"}>
            <span>Receiver:</span>
            <input type="text" value={receiver} onChange={handleReceiver}/>

            <span>Amount:</span>
            <input type="text" value={inputValue} onChange={onChangeTransferValue}/>

            <button onClick={assetID === "Harmony" ? handleTransferCoin : handleTransferToken}>
                {assetID === "Harmony" ? "Transfer coin" :  "Transfer token"}
            </button>
        </div>
    </div>
}
