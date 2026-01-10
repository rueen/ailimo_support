# 艾力默管理端

基于 Vue 3 + Vite + Ant Design Vue 的管理端项目

## 技术栈

- Vue 3 (Composition API)
- Vite
- Vue Router 4
- Pinia
- Ant Design Vue
- Axios
- Less

## 项目结构

```
.
├── docs/              # 接口文档
├── src/
│   ├── api/          # API 接口
│   ├── assets/       # 静态资源
│   ├── components/   # 公共组件
│   ├── layouts/      # 布局组件
│   ├── router/       # 路由配置
│   ├── store/        # Pinia 状态管理
│   ├── styles/       # 全局样式
│   ├── utils/        # 工具函数
│   ├── views/        # 页面组件
│   ├── App.vue       # 根组件
│   └── main.js       # 入口文件
├── index.html
├── vite.config.js
└── package.json
```

## 安装依赖

```bash
npm install
```

## 开发

```bash
npm run dev
```

访问 http://localhost:3000

## 构建

```bash
npm run build
```

## 功能模块

- 认证与权限管理
- 用户管理
- 设备租赁管理
- 笼位租赁管理
- 实验代操作管理
- 动物订购管理
- 试剂耗材管理
- 内容管理
