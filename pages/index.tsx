import React, { useEffect, useState } from "react";
import {
  loadStdlib,
  ALGO_WalletConnect as WalletConnect,
} from "@reach-sh/stdlib";
import * as backend from "../smartcontract/build/index.main.mjs";
import Cards from "../NAWA/Assets/cards";
import Hero from "../NAWA/Assets/Hero";
import Reviews from "../NAWA/Assets/Reviews";
import Footer from "../NAWA/Assets/Footer";
import Layout from "../Components/Layout";
import { getStringFromErr, motionVariants } from "../helpers";
import { AnimatePresence, motion } from "framer-motion";
import Loading from "../Components/Loading";
import { useGlobalContext } from "../context";
import Main from "../Components/App";
const reach = loadStdlib((process.env.REACH_CONNECTOR_MODE = "ALGO"));

let i = 0;

reach.setWalletFallback(
  reach.walletFallback({
    providerEnv: "TestNet",
    WalletConnect,
  })
);

const App = () => {
  const {
    isConnected,
    Api,
    turnOffPopup,
    connectWallet,
    wallet,
    createAsyncTimeout,
  } = useGlobalContext();
  // const deploy = async (acc: any) => {
  //   try {
  //     const ctc =
  //       (await acc?.contract(backend)) ?? (await wallet?.contract(backend));
  //     await Promise.all([
  //       await backend.Deployer(ctc, {
  //         notify: async () => {
  //           console.log(
  //             `Contract info: ${JSON.stringify(await ctc.getInfo())}`
  //           );
  //         },
  //       }),
  //     ]);
  //     await createAsyncTimeout(90);
  //     // setContractInfo(await ctc.getInfo());
  //     console.log(await ctc.getInfo());
  //   } catch (error) {
  //     console.log({ error });
  //   }
  // };
  // React.useEffect(() => {
  //   (async () => {
  //     if (i < 1) {
  //       const acct = await connectWallet();
  //       await deploy(acct);
  //       i++;
  //     }
  //   })();
  // }, []);
  useEffect(() => {
    if (isConnected && Api.acc) {
      // call();
    }
  }, [Api]);

  // const call = async () => {
  //   let loopContinue = !!Api;
  //   while (loopContinue) {
  //     const [loop, out] = await Api.getResult()();
  //     // @ts-ignore
  //     const outcome = Number(parseInt(out));
  //     if (loop) {
  //       displayMessage(true, <Loading text={"The Game Ended in a Draw"} />);
  //       await turnOffPopup(3);
  //       continue;
  //     }
  //     if (outcome !== 1) {
  //       const psb = [[]];
  //       console.table({ out, outcome });
  //       displayMessage(true, <Loading text={"word"} />);
  //       await turnOffPopup(3);
  //     } else {
  //       displayMessage(true, <Loading text={"The Game Ended in a Draw"} />);
  //       await turnOffPopup(3);
  //     }
  //   }
  // };

  return (
    <Layout className="App">
      <Hero />
      <Cards />
      <Reviews />
      <Footer />
    </Layout>
  );
};

export default App;
