# LinguaX 商业版 V2

## 环境
- PHP 8.1+
- MySQL 8.0+
- PDO、cURL、mbstring
- HTTPS（生产环境强烈建议）

## 安装
1. 创建 MySQL 数据库并导入 `database/linguax.sql`。
2. 修改 `config/config.php` 的数据库账号密码。
3. 配置 `translation.endpoint` 与 `translation.api_key`。默认保留可运行的演示回退模式；生产环境应使用你购买/自建且符合服务条款的翻译 API。
4. 将项目放到 PHP 网站根目录。
5. 注册一个账户后，把该账户邮箱填入 `config/config.php` 的 `admin.email`，即可进入 `/admin/`。

## 会员与支付
当前订单表、会员字段和价格已预留，但支付网关没有伪造为“已支付”。正式上线需接入真实支付服务，并在服务端验签、处理回调、退款、订阅取消与幂等。

## 安全
生产环境请：
- 使用 HTTPS；
- 将数据库密码、API Key 放到环境变量或服务器密钥管理，不要提交 Git；
- 增加登录限流、邮箱验证、密码找回、管理员 2FA、审计日志；
- 对支付回调严格验签；
- 根据实际运营地区完善隐私政策、Cookie、退款和自动续费授权。
