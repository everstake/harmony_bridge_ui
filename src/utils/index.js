import {HarmonyExtension} from "@harmony-js/core";
import {Messenger, Provider} from "@harmony-js/network";
import {
    isWeb3Injected,
    web3Accounts,
    web3Enable,
    web3FromAddress
} from "@polkadot/extension-dapp";
const { ApiPromise, WsProvider } = require('@polkadot/api');
web3Enable('polkadot-js/apps');

const {ChainID, ChainType} = require('@harmony-js/utils');

const config = require("../config");

export async function getHarmony(what) {
    let hmyEx = null;
    let wallet = what;
    if (wallet !== "MathWallet" && wallet !== "Harmony" && getWalletsList().length > 0) {
        wallet = getWalletsList().pop();
    }

    if (wallet === "MathWallet") {
        hmyEx = await new HarmonyExtension(window.harmony);
        hmyEx.provider = new Provider(config.endpoint).provider;

        hmyEx.messenger = new Messenger(hmyEx.provider, ChainType.Harmony, config.chainID);
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

        // hmyEx.login = async () => {
        //     // return {
        //     //     address: "one170h7vcj2gmxsdtc9m6sa6d482mhpsmqd69ejv8",
        //     // };
        //     // return hmyEx.wallet.getAccount(45645654, window.location).catch(console.error);
        // }
    }

    if (wallet === "MathWallet Edgeware") {
        hmyEx.login = async () => {
            if (!isWeb3Injected) {
                throw new Error("Please install/unlock the MathWallet first");
            }
            // meta.source contains the name of the extension that provides this account
            const allAccounts = await web3Accounts();
            console.log('allAccounts', allAccounts);
            return allAccounts;
        }
    }

    return hmyEx
}

export function getWalletsList() {
    let result = [];

    if (isWeb3Injected) {
        result.push("MathWallet Edgeware");
    }

    if (window.harmony) {
        result.push("MathWallet");
    }

    if (window.onewallet) {
        result.push("Harmony");
    }

    return result;
}
