import React, { useEffect, useState } from "react";
import styles from "../styles/fund.module.scss";
import Layout from "../Components/Layout";
import { useGlobalContext } from "../context";
// import { fetchDb } from '../helpers';
// export async function getStaticProps() {
//   // Call an external API endpoint to get posts
//   const res = await fetchDb();
//   // Pass posts data to the page via props
//   return {
//     props: {
//       posts: JSON.stringify(res),
//     },
//   };
// }
const Fund = ({ posts }: { posts: any }) => {
  const { data, isConnected, Api, displayMessage, createAsyncTimeout } =
    useGlobalContext();
  const [amount, setamount] = useState(0);
  useEffect(() => {
    console.log(amount);
  }, [amount]);

  const handleClick = (owner: string) => {
    displayMessage(true, <Input address={owner} />);
  };
  const handleSubmit = async (address: string) => {
    try {
      displayMessage(false);
      await createAsyncTimeout(1);
      displayMessage(true, "Attempting to Donate");
      await Api.addToFund(address, amount??1);
      displayMessage(false);
      await createAsyncTimeout(1);
      displayMessage(true, "Successfully donated");
    } catch (error) {
      displayMessage(true, "An error Occured trying to donate");
    }
  };
  const Input = ({ address }: { address: string }) => {
    return (
      <div>
        <input
          placeholder="Enter Amount"
          type={"number"}
          onChange={(e: any) => setamount(e.target.value)}
        />
        <input
          className={styles.btn}
          type={"button"}
          value="Submit"
          onClick={() => handleSubmit(address)}
        />
      </div>
    );
  };
  return (
    <Layout className={`${styles.fund} hero-container`}>
      <div>
        {data?.map(
          (
            { amount_raised, owner, project_desc, project_name, raise_amount },
            index
          ) => {
            if (index == data.length - 1)
              return (
                <div
                  key={index}
                  style={{ textAlign: "center", width: "100vw" }}
                >
                  {!isConnected &&
                    "Connect Wallet to see Available projects to fund"}
                </div>
              );
            return (
              <div className={styles.card} key={index}>
                <h2>{project_name.replace(/\0/g, "")}</h2>
                <p>
                  {" "}
                  <span>Creator: </span>
                  {owner.replace(/\0/g, "").slice(0, 15)}....
                  {owner
                    .replace(/\0/g, "")
                    .slice(
                      owner.replace(/\0/g, "").length - 15,
                      owner.replace(/\0/g, "").length - 1
                    )}
                </p>
                <span>
                  <div>About the project: </div>
                  {project_desc.replace(/\0/g, "")}
                </span>
                <span>
                  <div>Amount seeking</div>
                  {parseInt(raise_amount)}
                </span>
                <span>
                  <div>Amount raised</div>
                  {parseInt(amount_raised)}
                </span>

                <input
                  className={styles.btn}
                  type="button"
                  value="submit"
                  onClick={() => handleClick(owner)}
                />
              </div>
            );
          }
        )}
      </div>
    </Layout>
  );
};

export default Fund;
