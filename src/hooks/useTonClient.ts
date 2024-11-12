import { getHttpEndpoint } from "@orbs-network/ton-access";
import { TonClient } from "@ton/ton";
import { useAsyncInitialize } from "./useAsyncInitialize";

// 初始化ton客户端
export function useTonClient() {
    return useAsyncInitialize(
      async () =>
        new TonClient({
          endpoint: await getHttpEndpoint({ network: 'testnet' }),
        })
    );
  }
