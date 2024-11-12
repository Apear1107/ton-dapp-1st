import { useEffect, useState } from "react";
import { useTonClient } from "./useTonClient";
import { Address, OpenedContract, toNano } from "@ton/core";
import { useAsyncInitialize } from "./useAsyncInitialize";
import {MainContract} from "../contracts/MainContract"
import { useTonConnect } from "./useTonConnect";

// 初始化主合约
// 接受已部署合约的链上地址，并运行合约的getter方法（借助包装器的.getData()方法）
export function useMainContract() {
    // TON 客户端
    const client = useTonClient();
    // TON 发送方
    const { sender } = useTonConnect();
    // 每5s自动轮询一次计数器值
    const sleep = (time: number) =>
      new Promise((resolve) => setTimeout(resolve, time));
    // 合约数据
    const [contractData, setContractData] = useState<null | {
      counter_value: number;
      recent_sender: Address;
      owner_address: Address;
    }>();
    // 合约账户余额
    const [balance, setBalance] = useState<null | number>(0);
    // 客户端打开合约？
    const mainContract = useAsyncInitialize(async () => {
      if (!client) return;
      const contract = new MainContract(
        Address.parse("EQC7owMkxk1BQC4tPGfBFAfg9WCExerhSgtN38ae2H0SGS6z") 
      );
      return client.open(contract) as OpenedContract<MainContract>;
    }, [client]);
    // 获取合约数据
    useEffect(() => { 
      async function getValue() {
        if (!mainContract) return;
        setContractData(null);
        const val = await mainContract.getData();
        const {balance} = await mainContract.getBalance();
        setContractData({
          counter_value: val.number,
          recent_sender: val.recent_sender,
          owner_address: val.owner_address,
        });
        setBalance(balance);
        await sleep(5000); // sleep 5 seconds and poll value again
        getValue();
      }
      getValue();
    }, [mainContract]);
  
    return {
      contract_address: mainContract?.address.toString(),
      contract_balance: balance,
      ...contractData,
      sendIncrement: async () => {
        return mainContract?.sendIncrement(sender, toNano("0.05"), 5);
      },
    };
}