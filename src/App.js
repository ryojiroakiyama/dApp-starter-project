import React, { useEffect, useState } from "react";
import "./App.css";
/* ethers 変数を使えるようにする*/
// webアプリからコントラクトを呼び出す際に必須
import { ethers } from "ethers";
/* ABIファイルを含むWavePortal.jsonファイルをインポートする*/
import abi from "./utils/WavePortal.json";
const App = () => {
  /* ユーザーのパブリックウォレットを保存するために使用する状態変数を定義します */
  const [currentAccount, setCurrentAccount] = useState("");
  console.log("currentAccount: ", currentAccount);
  const contractAddress = "0x6c0791Ce634E55Daea24f2c62b5650D1264f049F";
  // ABIの内容を参照する変数を作成
  const contractABI = abi.abi;
  /* window.ethereumにアクセスできることを確認します */
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Make sure you have MetaMask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }
      /* ユーザーのウォレットへのアクセスが許可されているかどうかを確認します */
      // eth_accounts: 空の配列または単一のアカウントアドレスを含む配列を返す
      // accountsにWEBサイトを訪れたユーザーのウォレットアカウントを格納する（複数持っている場合も加味、よって account's' と変数を定義している）
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const connectWallet = async () => {
    try {
      // ユーザーが認証可能なウォレットアドレスを持っているか確認
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      // 持っている場合は、ユーザーに対してウォレットへのアクセス許可を求める
      // 許可されれば、ユーザーの最初のウォレットアドレスを currentAccount に格納する。
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };
  // waveの回数をカウントする関数を実装
  const wave = async () => {
    try {
      // ユーザがMetaMaskを持っているか確認
      const { ethereum } = window;
      if (ethereum) {
        // provider(metamask)インスタンスの作成
        // providerを介してBL上のETHnodeに接続, デプロイされたコントラクトからデータを送受信
        const provider = new ethers.providers.Web3Provider(ethereum);
        // signer: ユーザウォレットアドレスを抽象化
        // signerを使って, ウォレットアドレスを使用して署名付きトランザクションをETHnetに送信できる
        const signer = provider.getSigner();
        // コントラクトへの接続, インスタンス作成
        const wavePortalContract = new ethers.Contract(
          contractAddress, // デプロイ先のアドレス(local, testnet, ETHnet)
          contractABI,// コントラクトABI
          signer // provider(コントラクトインスタンスreadonly) or signer
        );
        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        console.log("Signer:", signer);
        // コントラクトに👋（wave）を書き込む。ここから...
        const waveTxn = await wavePortalContract.wave();
        console.log("Mining...", waveTxn.hash);
        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);
        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };
  /* WEBページがロードされたときに下記の関数を実行します */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);
  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          <span role="img" aria-label="hand-wave">
            👋
          </span>{" "}
          WELCOME!
        </div>
        <div className="bio">
          イーサリアムウォレットを接続して、「
          <span role="img" aria-label="hand-wave">
            👋
          </span>
          (wave)」を送ってください
          <span role="img" aria-label="shine">
            ✨
          </span>
        </div>
        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>
        {/* ウォレットコネクトのボタンを実装 */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        {currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Wallet Connected
          </button>
        )}
      </div>
    </div>
  );
};
export default App;
