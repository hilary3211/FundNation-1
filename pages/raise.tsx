import { InputProps } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState } from "react";
import styles from "../styles/raise.module.scss";
import { useGlobalContext } from "../context";
import Nav from "../Components/Nav";
import Loading from "../Components/Loading";
function Send() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const { wallet, displayMessage, Api, connectWallet } = useGlobalContext();
  // Handles input change event and updates state
  async function handleClick(event: Event) {
    event.preventDefault();
    // @ts-ignore
    if (!name || !amount || !description) {
      displayMessage(true, "All field need to be filled");
      return;
    }
    try {
      const trial = await connectWallet();
      displayMessage(
        true,
        <Loading text={"Currently creating Fund Please Wait"} />
      );
      console.log(Api)
      await Api.raiseFund(name, description, amount);
    } catch (error) {
      console.log(error);
      displayMessage(
        true,
        <Loading
          error
          text="An error occured during Fund Creation, Contact hosts"
        />
      );
    }
  }
  const handleSubmit = async () => {};

  return (
    <Layout className="hero-container">
      <AnimatePresence>
        <div className={styles.raise}>
          <form className={styles.form}>
            <input
              className={styles.input}
              required
              onChange={(e: any) => setName(e.target.value)}
              placeholder="Project Name"
              // value={name}
            />

            <input
              className={styles.input}
              required
              onChange={(e: any) => setAmount(Number(e.target.value))}
              type="number"
              // value={amount}
              placeholder="How much do you need to raise"
            />
            <textarea
              className={styles.textArea}
              required
              onChange={(e: any) => setDescription(e.target.value)}
              // value={Location}
              placeholder="Describe the fund "
            />
            <input
              type="submit"
              placeholder=""
              onClick={(e: any) => handleClick(e)}
            />
          </form>
        </div>
      </AnimatePresence>
    </Layout>
  );
}

export default Send;
export const Layout = (props: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -200 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 200 }}
      className={props.className}
      {...props}
    >
      {props.children}
    </motion.div>
  );
};
