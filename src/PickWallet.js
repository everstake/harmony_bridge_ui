import React, {useContext, useEffect, useState} from "react";
import {getWalletAPI, getWalletsList} from "./utils";
import {AppContext} from "./App";
import 'antd/dist/antd.css';
import {Select} from 'antd';

const {Option} = Select;

export function PickWallet() {
    const [wallets, setWallets] = useState([]);
    const [currentWallet, setCurrentWallet] = useState("");
    const {account, walletAPI, setWalletAPI, setAccount, setAccounts, setWalletType} = useContext(AppContext);

    const handleChange = async (what) => {
        const walletAPI = await getWalletAPI(what);
        setAccount(null);
        if (walletAPI) {
            const accounts = await walletAPI.login();
            if (accounts) {
                if (Array.isArray(accounts) && accounts.length) {
                    setAccounts(accounts.map(i => i.address));
                    setAccount(accounts[0].address);
                } else if (!!accounts.address) {
                    setAccounts([accounts.address]);
                    setAccount(accounts.address);
                }
                setWalletAPI(walletAPI);
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
        if (!walletAPI) {
            return;
        }
        const accounts = await walletAPI.login();
        if (accounts) {
            if (Array.isArray(accounts) && accounts.length) {
                setAccounts(accounts.map(i => i.address));
                setAccount(accounts[0].address);
            } else if (!!accounts.address) {
                setAccounts([accounts.address]);
                setAccount(accounts.address);
            }
        }
    };

    const handleLogout = async () => {
        if (!walletAPI) {
            return;
        }
        await walletAPI.logout();
        setAccount(null);
    };

    const content = () => {
        return (<div className={"PickWalletContent"}>
            <div>
                <div className="pick-selector">
                <strong>Pick wallet: </strong>
                <Select value={currentWallet} onChange={handleChange}>
                    {wallets.map(v => <Option key={v} value={v}>{v}</Option>)}
                </Select>
                </div>
            </div>
            <div className="login-buttons">
            {
                !account ?
                    <button className="btn login"  onClick={handleLogin}>
                        Login
                    </button>
                    :
                    <button className="btn logout" onClick={handleLogout}>
                        Logout
                    </button>
            }
            </div>
        </div>)
    };

    return (
        <div className={"PickWallet"}>
            {
                wallets.length ?
                    content()
                    :
                    <span className={"PickWalletNone"}>You must install polkadot{"{"}.js{"}"}extension and MathWallet wallet or unlock it or wait injection</span>
            }
        </div>
    );
}
