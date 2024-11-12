import { SenderArguments } from "@ton/core";
import { Sender } from "@ton/core";
import { useTonConnectUI } from "@tonconnect/ui-react";

// 从TON connecct接口生成一个发送方对象。
// 该发送方代表已连接的钱包，允许我们代表它们发送交易。
export function useTonConnect(): { sender: Sender; connected: boolean } {
    const [tonConnectUI] = useTonConnectUI();
  
    return {
      sender: {
        send: async (args: SenderArguments) => {
          tonConnectUI.sendTransaction({
            messages: [
              {
                address: args.to.toString(),
                amount: args.value.toString(),
                payload: args.body?.toBoc().toString("base64"),
              },
            ],
            validUntil: Date.now() + 5 * 60 * 1000, // 5 minutes for user to approve
          });
        },
      },
      connected: tonConnectUI.connected,
    };
  }