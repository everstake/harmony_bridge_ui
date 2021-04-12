import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "./App";
import { ContractPromise } from "@polkadot/api-contract";
import { web3FromAddress } from "@polkadot/extension-dapp";

import { Input } from 'antd';
import { ForwardOutlined, ReloadOutlined } from '@ant-design/icons';

const config = require("./config");
const Bridge = require("./contractsEdgeware/edgeware_bridge_metadata");
const Token = require("./contractsEdgeware/erc20token_metadata");

export function EdgewareSwap({ assetID }) {
    const [balance, setBalance] = useState("");
    const [receiver, setReceiver] = useState("one1x4c08x8e6dp9fe08ujhpjhmqml05ja6s4kdvj6");
    const [assetName, setAssetName] = useState("");
    const [inputValue, setInputValue] = useState(0);
    const { walletAPI, account } = useContext(AppContext);
    const [balanceCoin, setBalanceCoin] = useState("");

    const updateCoinBalance = async () => {
        if (!walletAPI || !walletAPI.query || !account) {
            return
        }
        const { data } = await walletAPI.query.system.account(account);
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
            const { result, output } = await token.query.balanceOf(account, 0, -1, account);
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
        const res = await bridge.tx.transferCoin(inputValue, -1, receiver).signAndSend(account, (result) => {
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

    return <div className="App-form">
        {/* <div className="container"> */}
        <h4>Edgeware <ForwardOutlined /> Harmony</h4>

        <button onClick={refreshInfo}>
            <ReloadOutlined /> update info
        </button>

        <h5>{assetName} ({assetID})</h5>

        {assetID === "Edgeware" ? <div className="balance">coin balance {balanceCoin}</div> : <div className="balance">token balance {balance}</div>}

        <div className={"SwapParams"}>
            {/* <span>Receiver:</span> */}
            <Input addonBefore="Receiver:" defaultValue={receiver} onChange={handleReceiver} />
            {/* <input type="text" value={receiver} onChange={handleReceiver}/> */}

            <Input addonBefore="Amount:" type="number" defaultValue={inputValue} onChange={onChangeTransferValue} />

            {/* <span>Amount:</span>
            <input type="number" value={inputValue} onChange={onChangeTransferValue}/> */}

            <button onClick={assetID === "Edgeware" ? handleTransferCoin : handleTransferToken}>
                {assetID === "Edgeware" ? "Transfer coin" : "Transfer token"}
            </button>
        </div>
        {/* </div> */}
    </div>
}
