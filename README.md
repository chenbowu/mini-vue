# mini-vue

本项目采用 TDD 驱动测试的开发方式，抽离出了 **vue3** 的核心逻辑，完成了一个最小 **vue3** 模型的实现。

## 使用了哪些技术栈

:rocket: Jest

:rocket: TypeScript

:rocket: rollup

## 实现了什么功能

### **reactivity**

:white_check_mark: 环境-集成 jest 做单元测试-集成 ts

:white_check_mark: 实现 effect & reactive & 依赖收集 & 触发依赖

:white_check_mark: 实现 effect 返回 runner

:white_check_mark: 实现 effect 的 scheduler 功能

:white_check_mark: 实现 effect 的 stop 功能

:white_check_mark: 实现 readonly 功能

:white_check_mark: 实现 isReactive 和 isReadonly

:white_check_mark: 优化 stop 功能

:white_check_mark: 实现 reactive 和 readonly 嵌套对象转换功能

:white_check_mark: 实现 shallowReadonly 功能

:white_check_mark: 实现 isProxy 功能

:white_check_mark: 实现 ref 功能

:white_check_mark: 实现 isRef 和 unRef 功能

:white_check_mark: 实现 proxyRefs 功能

:white_check_mark: 实现 computed 计算属性功能

### **runtime-core 初始化**

:white_check_mark: 实现初始化 component 主流程

:white_check_mark: 使用 rollup 打包库

:white_check_mark: 实现初始化 element 主流程

:white_check_mark: 实现组件代理对象

:white_check_mark: 实现 shapeFlags

:white_check_mark: 实现注册事件功能

:white_check_mark: 实现组件 props 功能

:white_check_mark: 实现组件 emit 功能

:white_check_mark: 实现组件 slots 功能

:white_check_mark: 实现 Fragment 和 Text 类型节点

:white_large_square: 实现 getCurrentInstance

:white_large_square: 实现依赖注入功能（provide/inject）

:white_large_square: 实现自定义渲染器 custom renderer

### runtime-core 更新

:white_large_square: 更新 element 流程搭建

:white_large_square: 更新 element 的 props

:white_large_square: 更新 element 的 children

:white_large_square: 更新 element 的 children - 双端对比 diff 算法（1）

:white_large_square: 更新 element 的 children - 双端对比 diff 算法 （2）

:white_large_square: 更新 element 的 children - 双端对比 diff 算法 （3）

:white_large_square: 学习尤大解决 bug 的处理方式

:white_large_square: 实现组件更新功能

:white_large_square: 实现 nextTick 功能

### compiler-core

:white_large_square: 编译模块概述

:white_large_square: 实现解析插值功能

:white_large_square: 实现解析 element 标签

:white_large_square: 实现解析 text 功能

:white_large_square: 实现解析三种联合类型 template

:white_large_square: parse 的实现原理&有限状态机

:white_large_square: 实现 transform 功能

:white_large_square: 实现代码生成 string 类型

:white_large_square: 实现代码生成插值类型

:white_large_square: 实现代码生成三种联合类型

:white_large_square: 实现编译 template 成 render 函数
