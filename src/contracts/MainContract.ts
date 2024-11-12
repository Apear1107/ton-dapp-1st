import {
  Address,
  beginCell,
  Cell,
  Contract,
  contractAddress,
  ContractProvider,
  Sender,
  SendMode,
} from "@ton/core";

// 合约配置
export type MainContractConfig = {
  number: number;
  address: Address;
  owner_address: Address;
};

// 生成初始状态Cell
export function mainContractConfigToCell(config: MainContractConfig): Cell {
  return beginCell()
    .storeUint(config.number, 32)
    .storeAddress(config.address)
    .storeAddress(config.owner_address)
    .endCell();
}

export class MainContract implements Contract {
  // 构造器
  constructor(
    readonly address: Address,
    readonly init?: { code: Cell; data: Cell }
  ) {}

  // 静态方法 : 从配置中创建合约
  static createFromConfig(
    config: MainContractConfig,
    code: Cell,
    workchain = 0
  ) {
    // 从配置中加载Cell
    const data = mainContractConfigToCell(config);
    const init = { code, data };
    const address = contractAddress(workchain, init);
    return new MainContract(address, init);
  }

  // 实例方法 ： 发送增量
  async sendIncrement(
    provider: ContractProvider,
    sender: Sender,
    value: bigint,
    increment_by: number
  ) {
    const msg_body = beginCell()
      .storeUint(1, 32) // 操作码
      .storeUint(increment_by, 32) // 增量
      .endCell();

    await provider.internal(sender, {
      value, // nano格式的TON币数
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: msg_body,
    });
  }

  // 实例方法：存款
  async sendDeposit(provider: ContractProvider, sender: Sender, value: bigint) {
    const msg_body = beginCell()
      .storeUint(2, 32) // OP code == 2
      .endCell();

    await provider.internal(sender, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: msg_body,
    });
  }

  // 实例方法：无操作码存款
  async sendNoCodeDeposit(
    provider: ContractProvider,
    sender: Sender,
    value: bigint
  ) {
    const msg_body = beginCell().endCell();

    await provider.internal(sender, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: msg_body,
    });
  }

  // 实例方法：提款请求
  async sendWithdrawalRequest(
    provider: ContractProvider,
    sender: Sender,
    value: bigint,
    amount: bigint
  ) {
    const msg_body = beginCell()
      .storeUint(3, 32) // OP code
      .storeCoins(amount)
      .endCell();

    await provider.internal(sender, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: msg_body,
    });
  }

  // 实例方法 ： 获取数据（最近的发送者）：运行合约getter方法，并返回c4存储器中的结果。
  async getData(provider: ContractProvider) {
    // 如果方法不存在报错：Unable to execute get method. Got exit_code: 11
    const { stack } = await provider.get("get_contract_storage_data", []);
    return {
      number: stack.readNumber(), // readNumber() 读取栈顶的整数
      recent_sender: stack.readAddress(), // readAddress() 读取栈顶的地址
      owner_address: stack.readAddress(), // readAddress() 读取栈顶的地址
    };
  }

  // 实例方法 ： 获取合约余额
  async getBalance(provider: ContractProvider) {
    const { stack } = await provider.get("balance", []);
    return {
      balance: stack.readNumber(),
    };
  }

  // 实例方法 ： 部署合约
  async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().endCell(),
    });
  }
}
