# Workshop: Fund Raiser

In this workshop, we'll go through A Bounty Hack submission, for Fundraiser Dapp.
The Dapp consists of two actors `Project` and `Donors`. The `Project`s are responsible for creating new campaigns that need to be funded. The interact with the contract and create a campaign that is available to view by anyone.
The `Donors` are the participants interested in donating to specific campaigns and causes.

This workshop assumes that you've completed the rock, paper, scissors tutorial and or the API tutorial.

We assume that you’ll go through this workshop in a directory named ~/reach/fundnation:

`$ mkdir -p ~/reach/fundnation`

And that you have a copy of Reach installed in ~/reach so you can write

`$ ../reach version`

You should start by initializing your project

`$ ../reach init`

## Problem Analysis

Different Projects struggle to get their causes out there and secure funding for the cause, Fundnation solves this by giving Projects access to Donors from all over the world as long as they have an internet connection without any hurdles.

When building the Dapp we asked ourselves a couple of questions:

```
How many unique participant will interact with our Dapp?

What steps do each participant have to take to successfully use our Dapp?

Do they need any Information beforehand?

What happens if projects are unable to fully raise ?

```

**Question Answers!**

- Our application involves 3 roles: The Deployer of the contract, the Projects looking to raise funds and the Donors looking to supply funds.

- Steps that were taken by each participant

  - Deployer: The deployer is responsible for deploying the contract to the blockchain.
  - Project: The project interacts with an already deployed contract and tries to create a cause for others to donate by providing the necessary info.
  - Donors: These donate to different that they belive in.

- The only party that would need prior information before interaction with the contract is the `Donor`.

- If the project is unable to raise the target amount then the project can choose to withdraw that amount

Problem analysis is a crucial step that helps us understand what our application is supposed to be doing. Remember, programming in general, and Reach in particular, does not solve problems for you; instead, programs encode automatic solutions to problems you've already solved. Compared to normal languages, Reach does do a bit automatically for you: it automatically discovers problems you may not have realized your program had. You still have to solve them yourself though! But, at least you know about them because of Reach

## Data Definition

Humans and their social systems deal with information, but computers can only interact with data, which is merely a representation of information using particular structures, like numbers, arrays, and so on. After problem analysis, we know what information our program will deal with, but next, we need to decide how to translate that information into concrete data.

For the next step, we are going to define the data type equivalents of the values used in our answers from the previous section.

For this Dapp we have the following constants

```js
const name = Bytes(12);
const description = Bytes(280);
const amount = UInt;
const DEFAULT_FUND = Object({
  raise_amount: UInt,
  amount_raised: UInt,
  project_name: name,
  project_desc: description,
  owner: Address,
});
```

And our participant interfaces and APIs and events consist of:

```js
const A = Participant("Deployer", { notify: Fun([], Null) });

const Fund = API("raiser", {
  raiseFund: Fun([name, description, amount], Bool),
  addToFund: Fun([Address, amount], Null),
  fetch: Fun([Maybe(Address)], DEFAULT_FUND),
});

const E = Events("notify", {
  send: [DEFAULT_FUND],
});
```

At this point, you can modify your JavaScript file (index.mjs) to contain definitions of these values, although you may want to use a placeholder for the actual value. When you're writing a Reach program, especially in the early phases, you should have these two files open side-by-side and update them in tandem as you're deciding the participant interact interface and API structure.

## Communication Construction

A fundamental aspect of a decentralized application is the pattern of communication and transfer among the participants, including the consensus network. For example, who initiates the application? Who responds next? Is there a repeated segment of the program that occurs over and over again? We should explicitly write down this structure as comments in our program. For our current program it would be something like:.

```md
1. Deployer Deploys the contract and notify's the frontend of it's state.
2. Attacher s (APIS) are able to connect to contract.
3. Attaher(Product) creates a fund that others can fund.
4. Attacher (Donor) sees project created and donates to cause
```


## Interactions

A key concept of Reach programs is that they are concerned solely with the communication and consensus portions of a decentralized application. Frontends are responsible for all other aspects of the program. Thus, eventually, a Reach programmer needs to insert calls into their code to send data to and from the frontend via the participant interact interfaces and APIs that they defined during the Data Definition step.

Here's how our program looks

```js
"reach 0.1";

// Users can doante to a fund
// users can create fund by saying
//    - How much you need
//    - Project name
//    - Project Description
const name = Bytes(12);
const description = Bytes(280);
const amount = UInt;
const DEFAULT_FUND = Object({
  raise_amount: UInt,
  amount_raised: UInt,
  project_name: name,
  project_desc: description,
  owner: Address,
});
export const main = Reach.App(() => {
  setOptions({ untrustworthyMaps: true, connectors: [ALGO] });
  const A = Participant("Deployer", { notify: Fun([], Null) });

  const Fund = API("raiser", {
    raiseFund: Fun([name, description, amount], Bool),
    addToFund: Fun([Address, amount], Null),
    fetch: Fun([Maybe(Address)], DEFAULT_FUND),
  });

  const E = Events("notify", {
    send: [DEFAULT_FUND],
  });

  init();

  A.publish();
  commit();
  A.interact.notify();
  A.publish();
  const fundMap = new Map(DEFAULT_FUND);
  const start = {
    raise_amount: 0,
    amount_raised: 0,
    project_name: name.pad(""),
    project_desc: description.pad(""),
    owner: this,
  };

  const [bal, noOfP] = parallelReduce([0, 0])
    .invariant(balance() == bal)
    .while(true)
    .api(
      Fund.raiseFund,
      (_, s, a) => {
        check(
          isNone(fundMap[this]),
          "This user already has a fund pending, can only create one"
        );
      },
      (_, a, b) => 0,
      (fund_name, desc, amt, k) => {
        const new_fund = {
          raise_amount: amt,
          project_name: fund_name,
          project_desc: desc,
          amount_raised: 0,
          owner: this,
        };
        fundMap[this] = new_fund;
        E.send(new_fund);
        k(true);

        return [bal, noOfP + 1];
      }
    )
    .api(
      Fund.addToFund,
      (_, a) => {
        check(true, "");
      },
      (_, a) => a,
      (addr, amt, k) => {
        const specific_fund = fromSome(fundMap[addr], start);
        const { amount_raised } = specific_fund;
        const newFunds = {
          ...specific_fund,
          amount_raised: amount_raised + amt,
        };
        fundMap[addr] = newFunds;

        k(null);
        return [bal + amt, noOfP];
      }
    )
    .api(
      Fund.fetch,
      (_) => {
        check(true, "");
      },
      (_) => 0,
      (addr, k) => {
        const specific_fund = isSome(addr)
          ? fromSome(fundMap[this], start)
          : fromSome(fundMap[fromSome(addr, A)], start);

        k(specific_fund);
        return [bal, noOfP];
      }
    )
    .timeout(false);
  transfer(balance()).to(A);
  commit();

  exit();
});
```

Running
` ../reach compile`
gives us a message telling us that all our theorems are true

## Possible Additions

Our code works fine as it is now. But can be implemented and represented better by using adding more functionality.

## Testing

We test our application by creating a file `index.mjs` in the same directory as the `index.rsh`

```bash
touch index.mjs
```

Our testing would be a CLI application that simulates how users would interact with our Dapp on-chain. It achieves this by spinning off a dev-net to handle this.

The Test (index.mjs) would look something like this

```js
import { loadStdlib, ask } from "@reach-sh/stdlib";
import * as backend from "./build/index.main.mjs";

if (
  process.argv.length < 3 ||
  ["Deployer", "Fund"].includes(process.argv[2]) == false
) {
  console.log("Usage: reach run index [Deployer|Fund]");
  process.exit(0);
}
const role = process.argv[2];

const stdlib = loadStdlib(process.env);

const startingBalance = stdlib.parseCurrency(1000);

const Fund = async (info, name = "Unknown") => {
  const acc = await stdlib.newTestAccount(startingBalance);
  const ctc = acc.contract(backend, info);

  const raiseFund = async (name, description, amount) => {
    try {
      const statement = await ctc.apis.raiser.raiseFund(
        name,
        description,
        amount
      );
      console.log(statement);
    } catch (error) {
      console.error(error);
    }
  };
  const addToFund = async (address, amount) => {
    try {
      const statement = await ctc.apis.raiser.addToFund(
        stdlib.formatAddress(address),
        stdlib.parseCurrency(amount)
      );
      console.log(statement);
    } catch (error) {
      console.error(error);
    }
  };
  const fetch = async (addr, show) => {
    try {
      const statement = await ctc.apis.raiser.fetch(addr);
      show && console.log({ statement });
      return statement;
    } catch (error) {
      console.error(error);
    }
  };

  const getBalance = async (acc = acc) => {
    return await stdlib.balanceOf(acc);
  };

  const displayBalance = async () => {
    console.log(`${name}'s balance: ${fmt(await getBalance())}`);
  };
  const getLog = (f) => async () => {
    const { when, what } = await ctc.e.notify.send.next();
    const lastTime = await ctc.e.notify.send.lastTime();
    console.log("what", what);
    return what;
  };

  return {
    raiseFund,
    addToFund,
    fetch,
    getBalance,
    displayBalance,
    getLog,
    acc,
  };
};

const [accAlice, accBob] = await stdlib.newTestAccounts(2, startingBalance);

console.log("Hello, Deployer and Fund!");

console.log("Launching...");

console.log("Starting backends...");

if (role == "Deployer") {
  try {
    const ctc = await accAlice.contract(backend);
    console.log("You the deployer");
    await backend.Deployer(ctc, {
      notify: async () => {
        console.log(`Contract info: ${JSON.stringify(await ctc.getInfo())}`);
      },
    });
  } catch (error) {
    console.log({ error });
  }
}
if (role == "Fund") {
  try {
    const info = await ask.ask("Paste contract info:", (s) => JSON.parse(s));
    const newUSer = await Fund(info);
    const user2 = await Fund(info);
    const user3 = await Fund(info);

    await newUSer.raiseFund(
      "prince",
      "The greatest project in the world",
      stdlib.parseCurrency(1000)
    );
    console.log(stdlib.formatAddress(newUSer.acc));
    await user2.addToFund(newUSer.acc, 2);
    await user2.addToFund(newUSer.acc, 2);
    await user3.addToFund(newUSer.acc, 10);
    await stdlib.wait(1);
  } catch (error) {
    console.log(error);
  }
}
ask.done();
console.log("Goodbye, Deployer and Participants!");
```

## Discussion

You did it!

Congrats on finishing this workshop. You implemented the Fundraiser that runs on the blockchain yourself.

If you found this workshop rewarding please let us know on [the Discord Community](https://discord.gg/AZsgcXu).

Thanks!!
