import abi from '../utils/SupART.json';
import { ethers } from "ethers";
import Head from 'next/head'
import React, { useEffect, useState } from "react";
import styles from '../styles/Home.module.css'


// Create an time display
function TimeDisplay() {
  const [time, setTime] = useState('');

  useEffect(() => {
    function updateTime() {
      let now = new Date();
      let formattedTime = now.toLocaleString('en-US', { hour12: false }) + '.' + String(now.getMilliseconds()).padStart(3, '0');
      setTime('' + formattedTime);
    }

    const interval = setInterval(updateTime, 1); // Update every millisecond

    // Clean up function to clear the interval when the component unmounts
    return () => clearInterval(interval);
  }, []); // Empty dependency array means this effect runs once on mount and clean up on unmount

  return <p id="time-display">{time}</p>;
}



export default function Home() {
  // Contract Address & ABI
  const contractAddress = "0xeD7A7c03541e65C91eFf41c51fA33a18ec2246e8";
  const contractABI = abi.abi;

  // Component state
  const [currentAccount, setCurrentAccount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [memos, setMemos] = useState([]);

  const onNameChange = (event) => {
    setName(event.target.value);
  }

  const onMessageChange = (event) => {
    setMessage(event.target.value);
  }

   // Wallet connection logic
  const isWalletConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Please install a wallet application (like MetaMask or TrustWallet) and open this page in the wallet's browser.");
        return;
      }

      const accounts = await ethereum.request({method: 'eth_accounts'})
      console.log("accounts: ", accounts);

      if (accounts.length > 0) {
        const account = accounts[0];
        console.log("wallet is connected! " + account);
      } else {
        console.log("make sure MetaMask is connected");
      }
    } catch (error) {
      console.log("error: ", error);
    }
  }

  const connectWallet = async () => {
    try {
      const {ethereum} = window;

      if (!ethereum) {
        alert("Install a Cryptocurrency wallet (MetaMask, TrustWallet or Math Wallet) and open this page in the wallet's browser.");
        return;
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  
  }

  const buyCoffee = async () => {
    try {
      const {ethereum} = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("buying art..")
        const coffeeTxn = await buyMeACoffee.buyCoffee(
          name ? name : "anon",
          message ? message : "Enjoy your day!",
          {value: ethers.utils.parseEther("0.01")}
        );

        await coffeeTxn.wait();

        console.log("mined ", coffeeTxn.hash);

        console.log("supported artist!");

        // Clear the form fields.
        setName("STREET");
        setMessage("Support ART");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Function to fetch all memos stored on-chain.
  const getMemos = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        
        console.log("fetching memos from the blockchain..");
        const memos = await buyMeACoffee.getMemos();
        console.log("fetched!");
        setMemos(memos);
      } else {
        console.log("Metamask is not connected");
      }
      
    } catch (error) {
      console.log(error);
    }
  };
  
  useEffect(() => {
    let buyMeACoffee;
    isWalletConnected();
    getMemos();
    
    // Create an event handler function for when someone sends
    // us a new memo.
    const onNewMemo = (from, timestamp, name, message) => {
      console.log("BlockNote Wrote", from, timestamp, name, message);
      setMemos((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message,
          name
        }
      ]);
    };
    
    const {ethereum} = window;
    // Listen for new memo events.
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum, "any");
      const signer = provider.getSigner();
      buyMeACoffee = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      buyMeACoffee.on("NewMemo", onNewMemo);
    }
    return () => {
      if (buyMeACoffee) {
        buyMeACoffee.off("NewMemo", onNewMemo);
      }
    }
  }, []);
  
  return (
    <div className={styles.container}>
      <Head>
         <meta charSet="UTF-8" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <title>BlockNote</title>
        <meta name="description" content="BlockNote is a blockchain-based timestamping app for trasparent network"/>   
      <meta http-equiv="x-ua-compatible" content="ie=edge"/>
<meta name="keywords" content="BlockNote, app, platform, artists, creators, community, blockchain, messaging, trasparent"/>
<meta name="robots" content="index, follow"/>
<meta property="og:title" content="BlockNote is a blockchain-based timestamping app"/>
<meta property="og:description" content="BlockNote is a blockchain-based messaging app for trasparent network."/>
<meta property="og:image" content="https://wearetheartmakers.com/wp-content/uploads/2023/07/blocknote-logo.gif"/>
<meta property="og:url" content="https://blocknote.watam.repl.co"/>
<meta property="og:type" content="https://blocknote.watam.repl.co"/>
<meta name="twitter:card" content="https://blocknote.watam.repl.co"/>
<meta name="twitter:title" content="BlockNote - Blockchain-based Platform"/>
<meta name="twitter:description" content="BlockNote is a blockchain-based timestamping app for trasparent network."/>
<meta name="twitter:image" content="https://wearetheartmakers.com/wp-content/uploads/2023/07/blocknote-logo.gif"/>
<link rel="icon" href="/logo.png" />
      </Head>
      <main className={styles.main}>
        <img 
        src="https://wearetheartmakers.com/us/images/2023/07/08/blocknote.gif" 
        alt="BlockNote" 
        width="300" 
        height="300"
        className={styles.title}
    />
    
        {currentAccount ? (
          <div>
            <form>
              <div class="formgroup">
                <label>
                  Name
                </label>
                <br/>
                 <br/>
                <input
                  id="name"
                  type="text"
                  placeholder="anon"
                  onChange={onNameChange}
                  />
              </div>
              <br/>
               <br/>
              <div class="formgroup">
                <label>
                  Send a message
                </label>
                <br/>
                 <br/>

                <textarea
                  rows={3}
                  placeholder="Enjoy your day!"
                  id="message"
                  onChange={onMessageChange}
                  required
                >
                </textarea>
              </div>
              <div>
                <button
                  type="button"
                  onClick={buyCoffee}
                >
                  Send a message for 0.03 
                </button>
              </div>
            </form>
          </div>
        ) : ( 
           <button onClick={connectWallet}> Connect your wallet </button>
        )}
<br/>
              {/* Açıklama */}
<p><center>
  Blockchain-based timestamping app. <br/> Connect with any chain to record your message</center>
</p>     
<div className={styles.socialShare} style={{ display: 'flex', justifyContent: 'center' }}>
  <a
    href={`https://twitter.com/intent/tweet?text=Blockchain-based-timestamping-Dapp.&url=${encodeURIComponent(
      "https://blocknote.watam.repl.co/"
    )}`}
    target="_blank"
    rel="noopener noreferrer"
    style={{ margin: '0 10px' }}
  >
    <img src="https://wearetheartmakers.com/wp-content/uploads/2023/07/twitter_icon.png" alt="Share on Twitter" width="30" height="30" />
  </a>
  <a
    href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
      "https://blocknote.watam.repl.co/"
    )}&title=Check%20out%20this%20awesome%20app!`}
    target="_blank"
    rel="noopener noreferrer"
    style={{ margin: '0 10px' }}
  >
    <img src="https://wearetheartmakers.com/wp-content/uploads/2023/07/linkedin_icon.png" alt="Share on LinkedIn" width="30" height="30" />
  </a>

  <a
    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      "https://blocknote.watam.repl.co/"
    )}`}
    target="_blank"
    rel="noopener noreferrer"
    style={{ margin: '0 10px' }}
  >
    <img src="https://wearetheartmakers.com/wp-content/uploads/2023/07/facebook_icon.png" alt="Share on Facebook" width="30" height="30" />
  </a>
</div>
      </main>  
      {currentAccount && (<h1>Memos received</h1>)}
      {currentAccount && (memos.map((memo, idx) => {
        return (
          <div key={idx} style={{border:"10px solid", "border-radius":"10px", padding: "5px", margin: "5px"}}>
            <p style={{"font-weight":"bold"}}>"{memo.message}"</p>
            <br/> From: {memo.name} at {memo.timestamp.toString()}
          </div>
        )
      }))}
      <footer className={styles.footer}> 
  <TimeDisplay /> 
</footer>
    </div>
  )
}
