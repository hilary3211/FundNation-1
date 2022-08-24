import React, { PropsWithChildren, useContext, useState } from "react";
import {
  loadStdlib,
  ALGO_WalletConnect as WalletConnect,
} from "@reach-sh/stdlib";
// @ts-ignore
import * as backend from "./smartcontract/build/index.main.mjs";
import { useRouter } from "next/router.js";
let i = 1;

const ctcInfo = { type: "BigNumber", hex: "0x0658ed08" };
// @ts-ignore
const reach = loadStdlib("ALGO");

reach.setWalletFallback(
  reach.walletFallback({
    providerEnv: "TestNet",
    WalletConnect,
  })
);
export type modalType = "launch" | "message" | "raiseFund" | "none";

const AppContext = React.createContext(
  {} as {
    state: any;
    showModal: boolean;
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
    setState: React.Dispatch<React.SetStateAction<{}>>;
    wallet: any;
    setWallet: React.Dispatch<React.SetStateAction<{}>>;
    modalMessage: any;
    setModalMessage: React.Dispatch<any>;
    view: modalType;
    setView: React.Dispatch<React.SetStateAction<modalType>>;
    isOpen: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    createAsyncTimeout: (
      seconds: number,
      executable?: () => any
    ) => Promise<void>;
    displayMessage: (
      show: boolean,
      message?: string | JSX.Element,
      options?: {
        type: modalType;
      }
    ) => void;
    isConnected: boolean;
    setIsConnected: React.Dispatch<React.SetStateAction<boolean>>;
    Api: {
      raiseFund: (
        name: string,
        description: string,
        amount: number
      ) => Promise<any>;
      addToFund: (address: string, amount: number) => Promise<any>;
      getBalance: () => Promise<number | any>;
      displayBalance: () => Promise<void>;
      acc: any;
    };
    turnOffPopup: (seconds: number, executable?: () => any) => Promise<void>;
    connectWallet: () => Promise<void>;
    DisconnectWallet: () => void;
  }
);
export const AppProvider = ({ children }: PropsWithChildren) => {
  const [isConnected, setIsConnected] = useState(false);
  const [contractInfo, setContractInfo] = useState("" as string);
  const [state, setState] = useState({});
  const [wallet, setWallet] = useState({} as any);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("Hello" as any);
  const [view, setView] = useState<modalType>("none");
  const [isOpen, setOpen] = useState(false);
  const [Api, setApi] = useState(
    {} as {
      raiseFund: (
        name: string,
        description: string,
        amount: number
      ) => Promise<any>;
      addToFund: (address: string, amount: number) => Promise<any>;
      getBalance: () => Promise<number | any>;
      getLog: (f: any) => () => Promise<any>;
      displayBalance: () => Promise<void>;
      acc: any;
    }
  );

  const displayMessage = (
    show: boolean,
    message?: string | JSX.Element,
    options?: { type: modalType }
  ) => {
    setShowModal(show);
    setView(options?.type ?? show ? "message" : "none");
    setModalMessage(message);
  };
  const turnOffPopup = async (seconds: number, executable?: () => any) => {
    await new Promise((resolve) =>
      setTimeout(() => {
        displayMessage(false);
        executable && executable();
        resolve(null);
      }, seconds * 1000)
    );
  };
  const connectWallet = async () => {
    try {
      const acct = await FUND();
      setWallet(acct.acc);
      setApi(acct);
      setIsConnected(true);
      console.log(acct);
      return acct.acc;
    } catch (e) {
      console.log(e);
      throw e;
    }
  };

  const createAsyncTimeout = async (seconds: number) => {
    await new Promise((resolve) =>
      setTimeout(() => {
        resolve(null);
      }, seconds * 1000)
    );
  };

  const DisconnectWallet = async () => {
    window.localStorage.removeItem("walletconnect");
    setIsConnected(false);
    const router = useRouter();
    router.reload();
  };

  const FUND = async () => {
    const acc = await reach.getDefaultAccount();
    const ctc = () =>
      acc.contract(
        backend,
        // @ts-ignore
        reach.bigNumberToNumber(ctcInfo)
      );

    const raiseFund = async (
      name: string,
      description: string,
      amount: number
    ) => {
      try {
        // const pay = reach.parseCurrency();
        const res = await ctc().apis.raiser.raiseFund({
          name,
          description,
          amount,
        });
        console.log(res);
        return res;
      } catch (error) {
        console.error(error);
        throw error;
      }
    };

    const addToFund = async (address: string, amount: number) => {
      try {
        const rf = reach.parseCurrency(amount);
        const res = await ctc().apis.raiser.addToFund(address, rf);
        console.log(res);
        return res;
      } catch (error) {
        console.error(error);
        throw error;
      }
    };

    const getBalance = async () => {
      return await reach.balanceOf(acc);
    };

    const displayBalance = async () => {
      const bal = await getBalance();
      console.log(`s balance: ${reach.formatCurrency(bal, 4)}`);
    };

    const getLog = (f: any) => async () => {
      const { when, what } = await ctc().e.notify.send.next();
      const lastTime = await ctc().e.notify.send.lastTime();
      console.log("what", what);
      return what;
    };

    return {
      raiseFund,
      addToFund,
      getBalance,
      displayBalance,
      acc,
      getLog,
    };
  };

  const deploy = async (acc: any) => {
    try {
      const ctc =
        (await acc?.contract(backend)) ?? (await wallet?.contract(backend));
      await Promise.all([
        await backend.Deployer(ctc, {
          notify: async () => {
            console.log(
              `Contract info: ${JSON.stringify(await ctc.getInfo())}`
            );
          },
        }),
      ]);
      await createAsyncTimeout(90);
      setContractInfo(await ctc.getInfo());
      console.log(await ctc.getInfo());
    } catch (error) {
      console.log({ error });
    }
  };
  React.useEffect(() => {
    (async () => {
      if (i < 1) {
        const acct = await connectWallet();
        await deploy(acct);
        i++;
      }
    })();
  }, []);
  return (
    <AppContext.Provider
      value={{
        Api,
        turnOffPopup,
        DisconnectWallet,
        createAsyncTimeout,
        connectWallet,
        state,
        setState,
        wallet,
        setWallet,
        modalMessage,
        setModalMessage,
        showModal,
        setShowModal,
        view,
        isOpen,
        setOpen,
        setView,
        displayMessage,
        isConnected,
        setIsConnected,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
export const useGlobalContext = () => useContext(AppContext);
