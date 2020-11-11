import React, {useContext, useEffect, useState} from "react";
import {AppContext} from "./App";
import {ContractPromise} from "@polkadot/api-contract";

const config = require("./config");
const Bridge = require("./contractsEdgeware/edgeware_bridge_metadata");
const Token = require("./contractsEdgeware/erc20token_metadata");

export function EdgewareSwap({assetID}) {
    const [balance, setBalance] = useState("");
    const [receiver, setReceiver] = useState("5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty");
    const [assetName, setAssetName] = useState("");
    const [inputValue, setInputValue] = useState(0);
    const {harmony, account} = useContext(AppContext);
    const [balanceCoin, setBalanceCoin] = useState("");

    const updateCoinBalance = async () => {
        if (!harmony || !account) {
            return
        }
        // console.log('harmony', harmony);
        // window.hrm = harmony;

        const {data} = await harmony.query.system.account(account);
        // console.log("balance",data["free"]);
        setBalanceCoin(data["free"].toHuman());
    };

    const refreshInfo = async () => {
        if (!harmony) {
            return;
        }
        if (assetID === "Edgeware") {
            setAssetName("Edgeware");
            await updateCoinBalance();
        } else {
            setAssetName("Token");
            const token = await new ContractPromise(harmony, Token, assetID);

            if (!token) {
                return;
            }
            const { result, output }  = await token.query.balanceOf(account,  0, -1, account);
            if (result.isOk) {
                setBalance(output.toHuman());
            } else {
                console.error('Error', result.asErr);
            }
        }
    };

    useEffect(() => {
        refreshInfo().catch(console.error);
    }, [harmony, assetID, account]);

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

        {assetID === "Edgeware" ? <span>coin balance {balanceCoin}</span> : <span>token balance {balance}</span>}
        <br/>

        <div className={"SwapParams"}>
            <span>Receiver:</span>
            <input type="text" value={receiver} onChange={handleReceiver}/>

            <span>Amount:</span>
            <input type="text" value={inputValue} onChange={onChangeTransferValue}/>

            <button onClick={assetID === "Edgeware" ? handleTransferCoin : handleTransferToken}>
                {assetID === "Edgeware" ? "Transfer coin" : "Transfer token"}
            </button>
        </div>
    </div>
}
