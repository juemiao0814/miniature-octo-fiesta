# 成长OS V3.1 部署说明

V3.1 在 V3.0 静态页面基础上，加入了完整的后端功能：

- ✅ 登录 / 注册系统
- ✅ 每日任务打卡（保存到数据库）
- ✅ 学习记录 + 成绩曲线（图表展示学习时长趋势）
- ✅ 错题本（考试答错自动收录，可标记已掌握/删除）
- ✅ 作业提交系统（文字内容 + 文件上传，含提交历史）
- ✅ AI 学习规划助手（调用 Anthropic API，根据打卡/学习/错题数据生成学习计划）

## 需要的环境

- 支持 PHP 的服务器（7.4+ 或 8.x），本地可以用 XAMPP / MAMP / phpstudy
- MySQL 数据库
- （可选）Anthropic API Key —— 只有「AI学习规划助手」功能需要，其余功能不需要

## 部署步骤

1. **建库建表**
   用 MySQL 命令行、phpMyAdmin 或 Navicat 执行 `api/db.sql`，会自动创建 `growthos` 数据库和五张表：
   - `users` 用户表
   - `daily_tasks` 每日任务打卡表
   - `study_logs` 学习记录表（用于成绩曲线）
   - `wrong_questions` 错题本
   - `homeworks` 作业提交记录

   > 如果你在 V3.0/V3.1 早期版本已经建过库，重新导入一次 `db.sql` 即可自动补上新表（用了 `IF NOT EXISTS`，不会清空已有数据）。

2. **修改数据库连接信息**
   打开 `api/config.php`，把 `$DB_HOST` / `$DB_NAME` / `$DB_USER` / `$DB_PASS` 改成你自己服务器的信息。

3. **（可选）配置 AI 学习规划助手**
   如果要用「AI学习规划助手」功能，去 https://console.anthropic.com 申请一个 API Key，
   填到 `api/config.php` 里的 `$ANTHROPIC_API_KEY = "";` 中。
   不填也没关系，其他功能都能正常使用，只是这一个功能会提示未配置。

4. **确认上传目录可写**
   `uploads/homework/` 目录用于存放作业附件，需要 PHP 有写入权限（Linux 服务器上一般执行 `chmod -R 755 uploads` 即可）。
   目录里已经放了 `.htaccess` 禁止里面的脚本被执行，防止有人上传恶意文件，这是 Apache 的写法；
   如果你用 Nginx，需要自己在 server 配置里加一条规则禁止 `uploads/` 目录执行 PHP。

5. **把整个 GrowthOS 文件夹放到 PHP 服务器的网站根目录**
   例如 XAMPP 是 `htdocs/GrowthOS`，phpstudy 是 `WWW/GrowthOS`。

6. **用浏览器打开**
   访问 `http://localhost/GrowthOS/register.html` 先注册一个账号，
   然后去 `login.html` 登录，登录成功会自动跳转到 `index.html`。

## 功能说明

| 页面 | 说明 |
|---|---|
| `index.html` | 首页，需要登录；每日任务打卡，可勾选/新增 |
| `stats.html` | 添加学习记录（科目/时长/分数），并用折线图展示最近30天学习时长 |
| `wrongbook.html` | 错题本，可手动添加，也可标记已掌握、删除 |
| `homework.html` | 提交作业（文字+可选附件），查看历史提交和老师反馈 |
| `ai-plan.html` | 点一下按钮，AI 根据你最近14天的数据生成下周学习计划 |
| `test/exam.html` | 考试测评，答错的题会自动加入错题本 |

## 目录结构

```
GrowthOS/
├── index.html            首页（需要登录）
├── login.html / register.html
├── stats.html             学习记录/成绩曲线
├── wrongbook.html         错题本
├── homework.html          作业提交
├── ai-plan.html           AI学习规划助手
├── css/style.css
├── js/
│   ├── common.js          公共逻辑：登录检查/退出登录
│   ├── app.js             首页逻辑
│   ├── stats.js
│   ├── wrongbook.js
│   ├── homework.js
│   └── ai-plan.js
├── api/
│   ├── config.php         数据库+API Key配置（需要你修改）
│   ├── db.sql              建库建表脚本
│   ├── register.php / login.php / logout.php / session_check.php
│   ├── tasks.php           每日任务打卡
│   ├── study_logs.php      学习记录（成绩曲线用）
│   ├── wrong_questions.php 错题本
│   ├── homework.php        作业提交（含文件上传）
│   └── ai_plan.php         AI学习规划助手
├── uploads/homework/       作业附件存放目录
├── courses/
│   ├── engineering.html
│   └── computer.html
└── test/
    └── exam.html
```

## 安全提醒

- 密码用 `password_hash`/`password_verify` 加密存储，不是明文
- 所有涉及用户数据的接口都做了归属校验（不能改到别人的任务/错题/作业）
- `api/config.php` 里的数据库密码和 API Key 不要提交到公开的 Git 仓库

## 下一步可以做的（V3.2 候选）

- 作业批改功能（老师端给 `homeworks.feedback` 字段写入反馈的管理页面）
- 错题本按科目筛选、按遗忘曲线自动提醒复习
- 成绩曲线按科目拆分对比
- 手机端适配 / PWA
