import { useEffect, useState } from "react";
import { useTonClient } from "./useTonClient";
import { Address, OpenedContract } from "@ton/core";
import { useAsyncInitialize } from "./useAsyncInitialize";
import {MainContract} from "../contracts/MainContract"

// 初始化主合约
// 接受已部署合约的链上地址，并运行合约的getter方法（借助包装器的.getData()方法）
export function useMainContract() {
    const client = useTonClient();
    const [contractData, setContractData] = useState<null | {
      counter_value: number;
      recent_sender: Address;
      owner_address: Address;
    }>();
    const [balance,setBalance] = useState<null | number>(0);
  
    const mainContract = useAsyncInitialize(async () => {
      if (!client) return;
      const contract = new MainContract(
        Address.parse("EQC7owMkxk1BQC4tPGfBFAfg9WCExerhSgtN38ae2H0SGS6z") 
      );
      return client.open(contract) as OpenedContract<MainContract>;
    }, [client]);
  
    useEffect(() => {
      async function getValue() {
        if (!mainContract) return;
        setContractData(null);
        const val = await mainContract.getData();
        setContractData({
          counter_value: val.number,
          recent_sender: val.recent_sender,
          owner_address: val.owner_address,
        });
        setBalance(balance);
      }
      getValue();
    }, [mainContract]);
  
    return {
      contract_address: mainContract?.address.toString(),
      contract_balance: balance,
      ...contractData,
    };
}