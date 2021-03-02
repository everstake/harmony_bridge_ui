import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "./App";
import { Unit } from "@harmony-js/utils/dist/transformers";

import { Input } from 'antd';
import { ForwardOutlined, ReloadOutlined } from '@ant-design/icons';

const config = require("./config");
const Bridge = require("./contracts/Bridge");
const Token = require("./contracts/EdgewareToken");

export function Swap({ assetID }) {
    const [balance, setBalance] = useState("");
    const [receiver, setReceiver] = useState("5EvoXxzVSBAkRbvDK8U3may1GpYykCdMXwBu9THouFGP1hLH");
    const [assetName, setAssetName] = useState("");
    const [inputValue, setInputValue] = useState(0);
    const { walletAPI, account } = useContext(AppContext);
    const [balanceCoin, setBalanceCoin] = useState("");

    const updateCoinBalance = async () => {
        if (!walletAPI || !walletAPI.blockchain || !account) {
            return
        }
        if (assetName === "Harmony") {
            const balance = await walletAPI.blockchain.getBalance({
                address: account,
                shardID: 0,
            }).then((r) => r).catch(() => "error");

            setBalanceCoin(walletAPI.utils.hexToBN(balance.result).toString());
        }

    };

    const refreshInfo = async () => {
        if (!walletAPI || !account || !assetID) {

            return;
        }
        if (assetID === "Edgeware") {
            return;
        }

        if (assetID === "Harmony") {
            setAssetName("Harmony");
            await updateCoinBalance();
        } else {
            const token = walletAPI.contracts.createContract(Token.abi, assetID);
            const balanceResult = await token.methods.balanceOf(account).call();
            setBalance(balanceResult.toString());
            const nameResult = await token.methods.name().call();
            setAssetName(nameResult);
        }
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
        const res = await bridge.methods.transferToken(receiver, inputValue, assetID).send({
            from: account,
            gasLimit: 8000000,
            gasPrice: 1000000000
        });
        console.log("🚀 ~ file: Swap.js ~ line 74 ~ res ~ res", res)

        refreshInfo().catch();
    };

    const handleTransferCoin = async () => {
        if (!walletAPI) {
            return;
        }
        const bridge = await walletAPI.contracts.createContract(Bridge.abi, config.bridge);
        bridge.methods.transferCoin(receiver).send({
            from: account,
            gasLimit: 8000000,
            gasPrice: 1000000000,
            value: (new Unit(inputValue).asWei()).toWeiString(),
        }).then(res => {
            console.log('res1 :>>', res);
        })

        refreshInfo().catch();
    };

    return <div className="App-form">
        <h4>Harmony <ForwardOutlined /> Edgeware</h4>

        <button onClick={refreshInfo}>
            <ReloadOutlined /> update info
        </button>
        <br />

        <h5>Token {assetName} ({assetID})</h5>

        {assetID === "Harmony" ? <div className="balance">token balance {balanceCoin}</div> : <div className="balance">token balance {balance}</div>}

        <div className={"SwapParams"}>
            <Input addonBefore="Receiver:" defaultValue={receiver} onChange={handleReceiver} />
            {/* <input type="text" value={receiver} onChange={handleReceiver}/> */}

            {/* <span>Amount:</span> */}
            <Input addonBefore="Amount:" type="number" defaultValue={inputValue} onChange={onChangeTransferValue} />
            {/* <input type="number" value={inputValue} onChange={onChangeTransferValue}/> */}

            <button onClick={assetID === "Harmony" ? handleTransferCoin : handleTransferToken}>
                {assetID === "Harmony" ? "Transfer coin" : "Transfer token"}
            </button>
        </div>
    </div>
}
