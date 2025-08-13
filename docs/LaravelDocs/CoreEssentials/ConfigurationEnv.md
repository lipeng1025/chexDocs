# 配置与环境

## 一、配置文件

  **是什么？**
  > - Laravel的`config`目录下存放的PHP文件，用来集中管理项目设置。

  **有什么用？**
  > - 统一存放数据库连接、邮件设置等配置项，修改配置不用到处找代码。

  **怎么用？**
  - 1.**查看配置**：`config/app.php` 是核心配置文件
  - 2.**获取配置值**：

  ```php
  // 获取应用时区
  $timezone = config('app.timezone');

  // 获取数据库配置
  $dbHost = config('database.connections.mysql.host');
  ```

  - 3.**修改配置**：

  ```php
  // 临时修改时区（仅当前请求有效）
  config(['app.timezone' => 'Asia/Shanghai']);
  ```
  ---
  常用配置文件

  |  **文件**  |  **用途**  |  **重要配置项**  |
  |  ---  |  ---  |  ---  |
  |  `app.php`  |  核心设置  |  时区、语言、加密密钥  |
  |  `database.php`  |  数据库连接  |  MySQL、Redis配置  |
  |  `mail.php`  |  邮件设置  |  SMTP服务器、发件人  |
  |  `cache.php`  |  缓存配置  |  Redis、Memcached驱动  |
  |  `filesystems.php`  |  文件存储  |  本地存储、云存储  |

## 二、.env使用

  **是什么？**
  > - 项目根目录下的环境变量文件（.env），像项目的"密码本"。

  **有什么用？**
  > - 安全存储敏感信息（数据库密码、API密钥），不同环境用不同配置。

  **怎么用？**
  - 1.**基础格式**：

  ```env
  KEY=VALUE
  # 注释以#开头

  APP_NAME=Laravel
  DB_PASSWORD=my_secret_password
  ```

  - 2.**实际示例**：

  ```env
  # 应用设置
  APP_ENV=local
  APP_DEBUG=true

  # 数据库设置
  DB_CONNECTION=mysql
  DB_HOST=127.0.0.1
  DB_PORT=3306
  DB_DATABASE=homestead
  DB_USERNAME=homestead
  DB_PASSWORD=secret

  # 邮件设置
  MAIL_MAILER=smtp
  MAIL_HOST=mailtrap.io
  MAIL_PORT=2525
  MAIL_USERNAME=null
  MAIL_PASSWORD=null
  ```

  **重要规则**：
  - 1.永远不要提交`.env`到Git仓库
  - 2.复制`.env.example`创建新环境文件：

  ```bash
  cp .env.example .env
  ```
  - 3.修改后需要清除配置缓存：

  ```bash
  php artisan config:clear
  ```

## 三、环境访问

  **是什么？**
  > - 获取环境变量的方法，区分开发、生产等环境。

  **有什么用？**
  > - 根据运行环境自动切换配置，比如：
  >   - 开发环境：显示详细错误
  >   - 生产环境：隐藏错误信息

  **怎么用？**

  - 1.**检测当前环境**：

  ```php
  // 检查是否是本地环境
  if (app()->environment('local')) {
      // 开发环境特殊逻辑
  }

  // 检查是否是生产环境
  if (app()->environment('production')) {
      // 生产环境特殊逻辑
  }
  ```

  - 2.**获取环境变量**：

  ```php
  // 获取数据库密码
  $dbPassword = env('DB_PASSWORD');

  // 带默认值
  $debugMode = env('APP_DEBUG', false);
  ```

  - 3.**在Blade中判断环境**：

  ```html
  @env('local')
    <!-- 开发环境显示调试工具栏 -->
    <div class="debug-bar">Debug Mode</div>
  @endenv

  @production
    <!-- 生产环境加载Google Analytics -->
    <script>ga('send', 'pageview');</script>
  @endproduction
  ```

## 实际案例：邮件配置
  步骤1：修改`.env`  
  ```env
  MAIL_MAILER=smtp
  MAIL_HOST=smtp.mailtrap.io
  MAIL_PORT=2525
  MAIL_USERNAME=your_username
  MAIL_PASSWORD=your_password
  MAIL_FROM_ADDRESS=hello@example.com
  MAIL_FROM_NAME="${APP_NAME}"
  ```
  ---
  步骤2：发送测试邮件  
  ```php
  use Illuminate\Support\Facades\Mail;

  // 在路由中测试
  Route::get('/send-email', function () {
      Mail::raw('这是一封测试邮件', function ($message) {
          $message->to('test@example.com')
                  ->subject('环境配置测试');
      });
      
      return '邮件已发送！';
  });
  ```
## 最佳实践
  1.**安全第一**：

  - 敏感信息只放`.env`
  - 生产环境设置 `APP_DEBUG=false`

  2.**多环境配置**：
  创建不同环境的文件：

  ```bash
  .env.local       # 本地开发
  .env.staging     # 测试环境
  .env.production  # 生产环境
  ```

  通过服务器环境变量指定：

  ```bash
  export APP_ENV=production
  ```

  3.**配置缓存（生产环境必做）**：

  ```bash
  # 生成配置缓存
  php artisan config:cache

  # 清除缓存
  php artisan config:clear
  ```

  4.**配置优先级**：

  ```php
  // 环境变量 > 配置文件 > 默认值
  $value = env('KEY', config('file.key', 'default'));
  ```
## 常见问题
  ❓ Q：修改了.env为什么没生效？  
  → 需要重启服务：`php artisan serve` 或清除缓存：`php artisan config:clear`

  ❓ Q：如何在代码中安全使用API密钥？  
  → 永远不要硬编码：

  ```php
  // 错误做法 ❌
  $apiKey = "sk_live_123456";

  // 正确做法 ✅
  $apiKey = env('STRIPE_API_KEY');
  ```

  ❓ Q：团队协作时如何同步配置？  

  1.提交`.env.example`到Git  
  2.新成员复制后重命名：

  ```bash
  cp .env.example .env
  ```  
  3.生成应用密钥：

  ```bash
  php artisan key:generate
  ```

  ❓ Q：生产环境忘记设置APP_DEBUG怎么办？  
  → 在AppServiceProvider中强制设置：

  ```php
  public function boot()
  {
      // 强制生产环境关闭调试
      if ($this->app->environment('production')) {
          config(['app.debug' => false]);
      }
  }
  ```
