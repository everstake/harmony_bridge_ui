import React, {useEffect, useState} from "react";
import {getWalletsList} from "./utils";
import { Combobox } from 'react-widgets'
import 'react-widgets/dist/css/react-widgets.css';

export function PickWallet() {
    const [wallets, setWallets] = useState([]);
    const [currentWallet, setCurrentWallet] = useState("");

    const handleChange = async (what) => {
        setCurrentWallet(what);
    };

    useEffect(() => {
        const getWallets = async () => {
            const list = getWalletsList();
            setWallets(list);
            if (list.length) {
                await handleChange(list[0]);
            } else {
                setTimeout(getWallets, 1000);
            }
        };
        getWallets().catch();
    }, []);

    return (<div className={"PickWallet"}>
        <span>Pick wallet:</span>
        {
            wallets.length ?
                <Combobox data={wallets} value={currentWallet} onChange={handleChange} >
                </Combobox>
                :
                <span className={"PickWalletNone"}>Please install Harmony or MathWallet wallet or unlock</span>
        }
    </div>)
}
