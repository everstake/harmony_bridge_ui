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
    const [receiver, setReceiver] = useState("");
    const [assetName, setAssetName] = useState("ONE");
    const [inputValue, setInputValue] = useState(0);
    const [isSubmit, setIsSubmit] = useState(true);
    const { walletAPI, account } = useContext(AppContext);
    const [balanceCoin, setBalanceCoin] = useState("");

    const updateCoinBalance = async () => {
        if (!walletAPI || !walletAPI.blockchain || !account) {
            return
        }
        if (assetName === "ONE") {
            const balance = await walletAPI.blockchain.getBalance({
                address: account,
                shardID: 0,
            }).then((r) => r).catch(() => "error");
            if (!balance.result) { await updateCoinBalance() }
            setBalanceCoin(walletAPI.utils.hexToBN(balance.result).toString());
        }

    };

    const refreshInfo = async () => {
        if (!walletAPI || !account || !assetID) {
            return;
        }
        if (assetID === "EDG") {
            return;
        }

        if (assetID === "ONE") {
            setAssetName("ONE");
            await updateCoinBalance();
        } else {
            const token = walletAPI.contracts.createContract(Token.abi, config.tokens[0]);
            const balanceResult = await token.methods.balanceOf(account).call();
            setBalance(balanceResult.toString());
            const nameResult = await token.methods.name().call();
            setAssetName('wEDG');
            if (nameResult === 'Edgeware') {
                setAssetName('wEDG');
            }

        }
        await updateCoinBalance();
    };

    useEffect(() => {
        refreshInfo().catch(console.error);
    }, [walletAPI, assetID]);

    const handleReceiver = (event) => {
        setReceiver(event.target.value);
        if (inputValue && receiver) {
            setIsSubmit(false)
        }

    };

    const onChangeTransferValue = (event) => {
        setInputValue(event.target.value);
        if (inputValue && receiver) {
            setIsSubmit(false)
        }

    };

    const handleTransferToken = async () => {
        if (!walletAPI) {
            return;
        }

        if (!inputValue || receiver === "") {
            alert('Fill all inputs');
            return;
        }

        const bridge = await walletAPI.contracts.createContract(Bridge.abi, config.bridge);
        const res = await bridge.methods.transferToken(receiver, inputValue, config.tokens[0]).send({
            from: account,
            gasLimit: 8000000,
            gasPrice: 1000000000
        })

        setTimeout(() => {
            setInputValue(0)
            refreshInfo().catch();
            window.location.reload();
        }, 5000)
    };

    const handleTransferCoin = async () => {
        if (!walletAPI) {
            return;
        }

        if (inputValue === 0 || receiver === "") {
            alert('Fill all inputs');
            return;
        }


        const bridge = await walletAPI.contracts.createContract(Bridge.abi, config.bridge);
        try {
            await bridge.methods.transferCoin(receiver).send({
                from: account,
                gasLimit: 8000000,
                gasPrice: 1000000000,
                value: (new Unit(inputValue).asWei()).toWeiString(),
            }) 
           
        } catch (err) {
            console.log('err :>> ', err);
        } finally {
        }
        


    };

    return <div className="App-form">
        <h4>Harmony <ForwardOutlined /> Edgeware</h4>

        <button onClick={refreshInfo}>
            <ReloadOutlined /> update info
        </button>
        <br />

        <h5> {assetName} ({assetID === "ONE" ? 'Harmony' : 'EDG wrapped @ Harmony'})</h5>

        {assetID === "ONE" ? <div className="balance">token balance {balanceCoin}</div> : <div className="balance">token balance {balance}</div>}

        <div className={"SwapParams"}>
            <Input addonBefore="Receiver:" defaultValue={receiver} onChange={handleReceiver} placeholder="like as 5EvoXxzVSBAkRbvDK8U3may1GpYykCdMXwBu9THouFGP1hLH" />
            {/* <input type="text" value={receiver} onChange={handleReceiver}/> */}

            {/* <span>Amount:</span> */}
            <Input addonBefore="Amount:" type="number" defaultValue={inputValue} onChange={onChangeTransferValue} />
            {/* <input type="number" value={inputValue} onChange={onChangeTransferValue}/> */}

            <button onClick={assetID === "ONE" ? handleTransferCoin : handleTransferToken} disabled={isSubmit}>
                {assetID === "ONE" ? "Transfer coin" : "Transfer token"}
            </button>
        </div>
    </div>
}
