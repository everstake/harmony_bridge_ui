import React, {useContext, useEffect, useState} from "react";
import {AppContext} from "./App";
import {ContractPromise} from "@polkadot/api-contract";
import {web3FromAddress} from "@polkadot/extension-dapp";

const config = require("./config");
const Bridge = require("./contractsEdgeware/edgeware_bridge_metadata");
const Token = require("./contractsEdgeware/erc20token_metadata");

export function EdgewareSwap({assetID}) {
    const [balance, setBalance] = useState("");
    const [receiver, setReceiver] = useState("5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty");
    const [assetName, setAssetName] = useState("");
    const [inputValue, setInputValue] = useState(0);
    const {walletAPI, account} = useContext(AppContext);
    const [balanceCoin, setBalanceCoin] = useState("");

    const updateCoinBalance = async () => {
        if (!walletAPI  || !walletAPI.query|| !account) {
            return
        }
        const {data} = await walletAPI.query.system.account(account);
        setBalanceCoin(data["free"].toString());
    };

    const refreshInfo = async () => {
        if (!walletAPI || !account || !assetID) {
            return;
        }
        if (assetID === "Harmony") {
            return;
        }

        if (assetID === "Edgeware") {
            setAssetName("Edgeware");
            await updateCoinBalance();
        } else {
            setAssetName("Token");
            const token = await new ContractPromise(walletAPI, Token, assetID);

            if (!token) {
                return;
            }
            const {result, output} = await token.query.balanceOf(account, 0, -1, account);
            if (result.isOk) {
                setBalance(output.toString());
            } else {
                console.error('Error', result.asErr);
            }
        }
    };

    useEffect(() => {
        refreshInfo().catch(console.error);
    }, [walletAPI, assetID, account]);

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

        const injector = await web3FromAddress(account);
        await walletAPI.setSigner(injector.signer);

        const bridge = await new ContractPromise(walletAPI, Bridge, config["edgeware-bridge"]);
        if (!bridge) {
            return;
        }

        // const gasLimit = 5000n * 1000000n;
        await bridge.tx.transferToken(0, -1, receiver, inputValue, assetID)
            .signAndSend(account, (result) => {
                if (result.status.isInBlock) {
                    console.log('in a block');
                } else if (result.status.isFinalized) {
                    console.log('finalized');
                }
            }).catch((e) => {
                console.error(e);
            });

        refreshInfo().catch();
    };

    const handleTransferCoin = async () => {
        if (!walletAPI) {
            return;
        }

        const injector = await web3FromAddress(account);
        await walletAPI.setSigner(injector.signer);

        const bridge = await new ContractPromise(walletAPI, Bridge, config["edgeware-bridge"]);
        if (!bridge) {
            return;
        }

        // const gasLimit = 5000n * 1000000n;
        await bridge.tx.transferCoin(inputValue, -1, receiver).signAndSend(account, (result) => {
            if (result.status.isInBlock) {
                console.log('in a block');
            } else if (result.status.isFinalized) {
                console.log('finalized');
            }
        }).catch((e) => {
            console.error(e);
        });

        refreshInfo().catch();
    };

    return <div className={"SwapContainer-Edgeware"}>
        <span>Edgeware >>> Harmony</span>
        <br/>

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
            <input type="number" value={inputValue} onChange={onChangeTransferValue}/>

            <button onClick={assetID === "Edgeware" ? handleTransferCoin : handleTransferToken}>
                {assetID === "Edgeware" ? "Transfer coin" : "Transfer token"}
            </button>
        </div>
    </div>
}
