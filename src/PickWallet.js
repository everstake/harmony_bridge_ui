import React, {useContext, useEffect, useState} from "react";
import {getHarmony, getWalletsList} from "./utils";
import { Combobox } from 'react-widgets'
import 'react-widgets/dist/css/react-widgets.css';
import {AppContext} from "./App";

export function PickWallet() {
    const [wallets, setWallets] = useState([]);
    const [currentWallet, setCurrentWallet] = useState("");
    const {setHarmony} = useContext(AppContext);

    const handleChange = async (what) => {
        const harmony = await getHarmony(what);
        if (harmony) {
            setHarmony(harmony);
            setCurrentWallet(what);
        }
    };

    useEffect(() => {
        const getWallets = async () => {
            const list = getWalletsList();
            setWallets(list);
            if (list.length) {
                await handleChange(list[0]);
            } else {
                setTimeout(getWallets, 3000);
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
