# SPL Practice 项目代码结构重组

## 重组后的文件结构

```
programs/spl-practice/src/
├── lib.rs              # 主入口文件，程序声明和模块导入
├── account_structs.rs  # 账户结构定义 (原 accounts.rs)
├── error_types.rs      # 错误类型定义 (原 errors.rs)
├── instruction_handlers.rs # 指令处理函数 (原 instructions.rs)
└── state_types.rs      # 状态数据结构定义 (原 state.rs)
```

## 各文件职责

### 1. `lib.rs` - 主入口文件

- 程序的主入口点
- 模块声明和重新导出
- 程序指令的入口点，委托给具体的处理函数
- 简洁清晰，易于理解整个程序的结构

### 2. `account_structs.rs` - 账户结构定义

- 所有 Anchor 账户结构（`#[derive(Accounts)]`）
- 账户验证规则和约束条件
- 用户资料相关账户：`CreateUserProfile`, `UpdateUserProfile`, `UpdateBalance`
- Token 相关账户：`InitializeMint`, `CreateTokenMetadata`, `MintDailyTokens`

### 3. `error_types.rs` - 错误类型定义

- 自定义错误代码枚举
- 错误消息定义
- 便于错误处理和调试

### 4. `instruction_handlers.rs` - 指令处理函数

- 分模块组织指令处理逻辑
- `user_profile_instructions`: 用户资料相关的指令
- `token_instructions`: Token 相关的指令
- 每个指令的具体业务逻辑实现

### 5. `state_types.rs` - 状态数据结构定义

- 程序状态数据结构（`#[account]`）
- `UserProfile`: 用户资料数据
- `TokenMetadata`: Token 元数据
- `DailyMintRecord`: 每日铸造记录

## 重组的优势

1. **模块化设计**: 每个文件职责单一，便于维护
2. **避免命名冲突**: 使用新的模块名称避免与 Anchor 内部模块冲突
3. **清晰的依赖关系**: 模块间的依赖关系明确
4. **易于扩展**: 新功能可以轻松添加到相应的模块中
5. **代码复用**: 公共结构和函数可以被其他模块使用

## 编译验证

项目重组后编译成功，只有一些可忽略的警告信息。所有功能保持不变，代码结构更加清晰和模块化。

```bash
anchor build
# 编译成功 ✅
```
