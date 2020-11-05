import {HarmonyExtension} from "@harmony-js/core";
import {Messenger, Provider} from "@harmony-js/network";

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
        // hmyEx.provider = new Provider(config.endpoint).provider;

        // hmyEx.messenger = new Messenger(hmyEx.provider, ChainType.Harmony, config.chainID);
        // hmyEx.setShardID(config.shard);
        // hmyEx.wallet.messenger = hmyEx.messenger;
        // hmyEx.blockchain.messenger = hmyEx.messenger;
        // hmyEx.transactions.messenger = hmyEx.messenger;
        // hmyEx.contracts.wallet = hmyEx.wallet;
    }

    return hmyEx
}

export function getWalletsList() {
    let result = [];
    if (window.harmony) {
        result.push("MathWallet");
    }

    if (window.onewallet) {
        result.push("Harmony");
    }

    if (result.length > 1) {
        result = ["Default", ...result];
    }

    return result;
}
