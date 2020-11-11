import React, {useContext, useEffect, useState} from "react";
import {getHarmony, getWalletsList} from "./utils";
import {AppContext} from "./App";
import 'antd/dist/antd.css';
import {Select} from 'antd';

const {Option} = Select;

export function PickWallet() {
    const [wallets, setWallets] = useState([]);
    const [currentWallet, setCurrentWallet] = useState("");
    const {account, harmony, setHarmony, setAccount, setAccounts, setWalletType} = useContext(AppContext);

    const handleChange = async (what) => {
        const harmony = await getHarmony(what);
        setAccount(null);
        if (harmony) {
            const accounts = await harmony.login();
            if (accounts) {
                if (Array.isArray(accounts) && accounts.length) {
                    setAccounts(accounts.map(i => i.address));
                    setAccount(accounts[0].address);
                } else if (!!accounts.address) {
                    setAccounts([accounts.address]);
                    setAccount(accounts.address);
                }
                setHarmony(harmony);
                setCurrentWallet(what);
                setWalletType(what);
            }
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

    const handleLogin = async () => {
        if (!harmony) {
            return;
        }
        const account = await harmony.login();
        setAccount(account.address);
    };

    const handleLogout = async () => {
        if (!harmony) {
            return;
        }
        await harmony.logout();
        setAccount(null);
    };

    const content = () => {
        return (<div className={"PickWalletContent"}>
            <span>Pick wallet:</span>
            <Select value={currentWallet} onChange={handleChange}>
                {wallets.map(v => <Option key={v} value={v}>{v}</Option>)}
            </Select>
            {
                !account ?
                    <button onClick={handleLogin}>
                        Login
                    </button>
                    :
                    <button onClick={handleLogout}>
                        Logout
                    </button>
            }
        </div>)
    };

    return (
        <div className={"PickWallet"}>
            {
                wallets.length ?
                    content()
                    :
                    <span className={"PickWalletNone"}>Please install Harmony or MathWallet wallet or unlock or wait injection</span>
            }
        </div>
    );
}
