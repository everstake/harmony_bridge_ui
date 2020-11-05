import React, {useContext, useEffect, useState} from "react";
import {getHarmony, getWalletsList} from "./utils";
import {AppContext} from "./App";
import 'antd/dist/antd.css';
import { Select } from 'antd';

const { Option } = Select;

export function PickWallet() {
    const [wallets, setWallets] = useState([]);
    const [currentWallet, setCurrentWallet] = useState("");
    const {setHarmony, setAccount} = useContext(AppContext);

    const handleChange = async (what) => {
        const harmony = await getHarmony(what);
        if (harmony) {
            console.log('harmony>>>>', harmony);
            const account = await harmony.login();
            console.log('account', account);
            setAccount(account.address);
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
                setTimeout(getWallets, 5000);
            }
        };
        getWallets().catch();
    }, []);

    return (<div className={"PickWallet"}>
        <span>Pick wallet:</span>
        {
            wallets.length ?
                <Select value={currentWallet} onChange={handleChange}>
                    {wallets.map(v => <Option key ={v} value={v}>{v}</Option>)}
                </Select>
                :
                <span className={"PickWalletNone"}>Please install Harmony or MathWallet wallet or unlock</span>
        }
    </div>)
}
