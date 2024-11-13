import './App.css';
import { TonConnectButton } from '@tonconnect/ui-react';
import { useMainContract } from './hooks/useMainContract'
import { useTonConnect } from './hooks/useTonConnect';
import { fromNano } from '@ton/core';
import WebApp from '@twa-dev/sdk';

function App() {
  // 合约数据
  const {
    contract_address,
    counter_value,
    contract_balance,
    sendIncrement,
    sendDeposit,
    sendWithdrawalRequest,
  } = useMainContract();
  // 钱包连接状态
  const { connected } = useTonConnect();
  const showAlert = () => {
    WebApp.showAlert("Hey there!");
  };

  return (
    <div>
      <div>
        <TonConnectButton />
      </div>
      <div>
        <div className='Card'>
          <b>{WebApp.platform}</b>
          <b>Our contract Address</b>
          <div className='Hint'>{contract_address}</div>
          <b>Our contract Balance</b>
          {contract_balance && (
            <div className='Hint'>{fromNano(contract_balance)}</div>
          )}        </div>

        <div className='Card'>
          <b>Counter Value</b>
          <div>{counter_value ?? "Loading..."}</div>
        </div>

        <a
          onClick={() => {
            showAlert();
          }}
        >
          Show Alert
        </a>

        <br />

        {connected && (
          <a
            onClick={() => {
              sendIncrement();
            }}
          >
            Increment by 5
          </a>
        )}

        <br />

        {connected && (
          <a
            onClick={() => {
              sendDeposit();
            }}
          >
            Request deposit of 1 TON
          </a>
        )}

        <br />

        {connected && (
          <a
            onClick={() => {
              sendWithdrawalRequest();
            }}
          >
            Request 0.1 TON withdrawal
          </a>
        )}
         {/*  call contract failed导致withdrawl没有成功*/}

      </div>
    </div>
  );
}

export default App;