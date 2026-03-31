# DumbOx (Terminal Helper)

一款桌面端命令卡片与任务编排工具，支持卡片/集合/任务串行执行、内嵌终端、多会话管理，以及基于 MySQL 的舆情看板与新闻资料库。

## 核心功能
- 卡片与集合管理（搜索、排序、批量操作）
- 任务编排（串行运行多个集合）
- 内嵌终端（xterm + node-pty），运行过程可视化
- 看板（ECharts 舆情可视化）
- 资料库（新闻列表分页与搜索）
- 问答（Qwen SQL → 查询 → 总结）

## 本地部署

### 1. 安装依赖
```bash
npm install
```

### 2. 开发模式启动
```bash
npm run dev
```

### 3. 构建与启动
```bash
npm run build
npm run start
```

### 4. 打包 Windows 安装包
```bash
npm run dist:win
```

## 数据库（可选）
看板与资料库默认从 MySQL 读取数据，失败会回退本地示例数据。

默认配置：
- Host: `127.0.0.1`
- Port: `3306`
- User: `root`
- Password: `123123`
- Database: `land_news`
- 表：
  - `land_news_analysis`
  - `word_frequency_stats`

可用环境变量覆盖：
```
BOARD_DB_HOST
BOARD_DB_PORT
BOARD_DB_USER
BOARD_DB_PASSWORD
BOARD_DB_NAME
```

## Qwen 问答
在“牛棚配置”中填写 API Key / Base URL / Model 即可使用，无需每次配置环境变量。

