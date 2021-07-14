import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "./App";
import { ContractPromise } from "@polkadot/api-contract";
import { web3FromAddress } from "@polkadot/extension-dapp";
import { Abi } from '@polkadot/api-contract';
import {
    stringToU8a,
    u8aToString
  }  from '@polkadot/util';

import { Input } from 'antd';
import { ForwardOutlined, ReloadOutlined } from '@ant-design/icons';

const config = require("./config");
const Bridge = require("./contractsEdgeware/edgeware_bridge_metadata");
const Token = require("./contractsEdgeware/erc20token_metadata");

export function EdgewareSwap({ assetID }) {
    const [balance, setBalance] = useState("");
    const [receiver, setReceiver] = useState("");
    const [assetName, setAssetName] = useState("");
    const [isSubmit, setIsSubmit] = useState(true);
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
        if (assetID === "ONE") {
            return;
        }

        if (assetID === "EDG") {
            setAssetName("EDG");
            await updateCoinBalance();
        } else {
            setAssetName("wONE");
            const token = await new ContractPromise(walletAPI, Token, config["edgeware-tokens"][0]);
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
        if (!inputValue || !receiver) {
            alert('Fill all inputs');
            return;
        }

        const injector = await web3FromAddress(account);
        await walletAPI.setSigner(injector.signer);

        const bridge = await new ContractPromise(walletAPI, Bridge, config["edgeware-bridge"]);
        if (!bridge) {
            return;
        }

        const gasLimit = 5000n * 1000000n;
        await bridge.tx.transferToken(0, -1, receiver, inputValue, config["edgeware-tokens"][0])
            .signAndSend(account, ({ status, events, dispatchError }) => 
            {
           
                if (dispatchError) {
                    if (dispatchError.isModule) {
                        // for module errors, we have the section indexed, lookup
                        const decoded = walletAPI.registry.findMetaError(dispatchError.asModule);
                        const { documentation, name, section } = decoded;

                        console.log(`${section}.${name}: ${documentation.join(' ')}`);
                    } else {
                        // Other, CannotLookup, BadOrigin, no extra info
                        console.log(dispatchError.toString());
                    }
                }
                if (status.isInBlock || status.isFinalized) {
                    events
                        // find/filter for failed events
                        .filter(({ event }) =>
                        {
                            return walletAPI.events.system.ExtrinsicFailed.is(event)}
                        )
                        // we know that data for system.ExtrinsicFailed is
                        // (DispatchError, DispatchInfo)
                        .forEach(({ event: { data: [error, info] } }) => {
                            if (error.isModule) {
                                // for module errors, we have the section indexed, lookup
                                const decoded = walletAPI.registry.findMetaError(error.asModule);
                                const { documentation, method, section } = decoded;

                                console.log(`${section}.${method}: ${documentation.join(' ')}`);
                            } else {
                                // Other, CannotLookup, BadOrigin, no extra info
                                console.log(error.toString());
                            }
                        });
                }               
            
            }).catch((e) => {
                console.error(e);
            });

        await refreshInfo().catch();
    };

    const handleTransferCoin = async () => {
        if (!walletAPI) {
            return;
        }
        if (inputValue === 0 || receiver === "") {
            alert('Fill all inputs');
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
            console.log("🚀 ~ file: EdgewareSwap.js ~ line 130 ~ res ~ result", result)
            if (result.status.isInBlock) {
                console.log('in a block');
                refreshInfo().catch();
                setInputValue(0);
            } else if (result.status.isFinalized) {
                console.log('finalized');
                refreshInfo().catch();
                setInputValue(0);
            }
        }).catch((e) => {
            console.error(e);
        });

        await refreshInfo().catch();
    };

    return <div className="App-form">
        {/* <div className="container"> */}
        <h4>Edgeware <ForwardOutlined /> Harmony</h4>

        <button onClick={refreshInfo}>
            <ReloadOutlined /> update info
        </button>

        <h5>{assetName} ({assetID === "EDG" ? 'Edgeware' : 'ONE wrapped @ Edgeware'})</h5>

        {assetID === "EDG" ? <div className="balance">coin balance {balanceCoin}</div> : <div className="balance">token balance {balance}</div>}

        <div className={"SwapParams"}>
            {/* <span>Receiver:</span> */}
            <Input addonBefore="Receiver:" defaultValue={receiver} onChange={handleReceiver} placeholder="like as one1az9yrfeegnv3jc8qrwj7etlldjnah2rgrd3jqd" />
            {/* <input type="text" value={receiver} onChange={handleReceiver}/> */}

            <Input addonBefore="Amount:" type="number" defaultValue={inputValue} onChange={onChangeTransferValue} />

            {/* <span>Amount:</span>
            <input type="number" value={inputValue} onChange={onChangeTransferValue}/> */}

            <button onClick={assetID === "EDG" ? handleTransferCoin : handleTransferToken} >
                {assetID === "EDG" ? "Transfer coin" : "Transfer token"}
            </button>
        </div>
        {/* </div> */}
    </div>
}
