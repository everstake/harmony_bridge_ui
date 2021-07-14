import { HarmonyExtension } from "@harmony-js/core";
import { Messenger, Provider } from "@harmony-js/network";
import { spec } from '@edgeware/node-types';
import {
    isWeb3Injected,
    web3Accounts,
    web3Enable,
} from "@polkadot/extension-dapp";
const { ApiPromise, WsProvider } = require('@polkadot/api');

web3Enable(window.origin);

const { ChainType, ChainID } = require('@harmony-js/utils');

const config = require("../config");

export async function getWalletAPI(what) {
    let hmyEx = null;
    let wallet = what;
    if (wallet !== "MathWallet Harmony" && wallet !== "Harmony" && getWalletsList().length > 0) {
        wallet = getWalletsList().pop();
    }

    if (wallet === "MathWallet Harmony") {
        hmyEx = await new HarmonyExtension(window.harmony);
        hmyEx.provider = new Provider(config.endpoint).provider;

        hmyEx.messenger = new Messenger(hmyEx.provider, ChainType.Harmony, ChainID.HmyTestnet);
        hmyEx.setShardID(config.shard);
        hmyEx.wallet.messenger = hmyEx.messenger;
        hmyEx.blockchain.messenger = hmyEx.messenger;
        hmyEx.transactions.messenger = hmyEx.messenger;
        hmyEx.contracts.wallet = hmyEx.wallet;

    }

    if (wallet === "Harmony") {
        hmyEx = await new HarmonyExtension(window.onewallet);
        hmyEx.provider = new Provider(config.endpoint).provider;

        hmyEx.messenger = new Messenger(hmyEx.provider, ChainType.Harmony, config.chainID);
        hmyEx.setShardID(config.shard);
        hmyEx.wallet.messenger = hmyEx.messenger;
        hmyEx.blockchain.messenger = hmyEx.messenger;
        hmyEx.transactions.messenger = hmyEx.messenger;
        hmyEx.contracts.wallet = hmyEx.wallet;

    }

    if (wallet === "polkadot{.js} extension") {
        const provider = new WsProvider(config["edgeware-endpoint"]);
        const api = await ApiPromise.create({ provider, ...spec});

        hmyEx = api;

        hmyEx.login = async () => {
            if (!isWeb3Injected) {
                throw new Error("Please install/unlock the MathWallet first");
            }
            return await web3Accounts();
        };

        hmyEx.logout = () => {
        };
    }

    return hmyEx
}

export function getWalletsList() {
    let result = [];

    if (window.harmony) {
        result.push("MathWallet Harmony");
    }

    // if (window.onewallet) {
    //     result.push("Harmony");
    // }

    if (isWeb3Injected) {
        result.push("polkadot{.js} extension");
    }

    return result;
}
