# 环境与基础

## 一、开发环境搭建

  **是什么？**
  > - 开发环境就是让你能跑起Laravel项目的工具箱，包含PHP、数据库等必备软件。

  **有什么用？**
  > - 没它你连项目都跑不起来

  **怎么搭建？（以Laravel Sail为例）**
  - 1.安装Docker Desktop：[官网下载](https://www.docker.com/products/docker-desktop)
  - 2.创建新项目：
  ```bash
  curl -s "https://laravel.build/your-project-name" | bash
  ```
  - 3.启动环境：
  ```bash
  cd your-project-name
  ./vendor/bin/sail up
  ```
  - 4.访问项目：`http://localhost`
  > 小贴士：Sail是官方推荐的Docker环境，开箱即用，不用单独装PHP/MySQL

## 二、Composer基础

  **是什么？**
  > - PHP的包管理器，相当于手机的"应用商店"。

  **有什么用？**
  > - 一键安装/更新PHP库，解决"依赖地狱"问题。

  **怎么用？**
  - 1.安装依赖包：
  ```bash
  composer require package-name
  ```

  - 2.安装项目所有依赖：
  ```bash
  composer require package-name
  ```

  - 3.更新所有包：
  ```bash
  composer update
  ```

  ---
  **实际案例**

  安装日志包：
  ```bash
  composer require monolog/monolog
  ```

  在代码中使用：
  ```php
  use Monolog\Logger;
  use Monolog\Handler\StreamHandler;

  // 创建日志实例
  $log = new Logger('name');
  $log->pushHandler(new StreamHandler('path/to/your.log', Logger::WARNING));

  // 记录日志
  $log->warning('这是一条警告');
  ```

## 三、Artisan命令

  **是什么？**
  > - Laravel自带的命令行工具，你的开发小助手。

  **有什么用？**
  > - 自动生成代码文件、管理数据库等重复工作。

  **常用命令**
  |  **命令**  |  **功能**  |  **示例**  |
  |  ---  |  ---  |  ---  |
  |  `make:model`  |  创建模型  |  `php artisan make:model Product`  |
  |  `make:controller`  |  创建控制器  |  `php artisan make:controller UserController`  |
  |  `migrate`  |  执行数据库迁移  |  `php artisan migrate`  |
  |  `tinker`  |  交互式命令行  |  `php artisan tinker`  |
  |  `route:list`  |  查看所有路由  |  `php artisan route:list`  |
  ---
  **实际案例**

  创建带迁移文件的模型：
  ```bash
  php artisan make:model Product -m
  ```

  执行后会生成：
  ```text
  app/Models/Product.php
  database/migrations/2023_xx_xx_create_products_table.php
  ```

## 四、项目结构

  核心目录作用
  |  **目录**  |  **用途**  |  **重要文件**  |
  |  ---  |  ---  |  ---  |
  |  `app/`  |  核心代码  |  Models/, Services/, Controllers/, Providers/  |
  |  `config/`  |  配置文件  |  app.php, database.php  |
  |  `database/`  |  数据库相关  |  migrations/, seeders/  |
  |  `routes/`  |  路由定义  |  web.php, api.php  |
  |  `resources/`  |  前端资源  |  js/, css/ (Vue/React文件)  |
  |  `storage/`  |  存储文件  |  logs/, app/ (文件上传)  |
  |  `vendor/`  |  依赖包  |  composer安装的第三方库  |
  ---
  文件示例：路由定义
  `routes/web.php`:

  ```php
  // 基本路由
  Route::get('/hello', function () {
      return '你好世界!';
  });

  // 带参数的路由
  Route::get('/user/{id}', function ($id) {
      return "用户ID: ".$id;
  });

  // 控制器路由
  Route::get('/products', [ProductController::class, 'index']);
  ```

  文件示例：控制器
  `app/Http/Controllers/ProductController.php`:

  ```php
  namespace App\Http\Controllers;

  use App\Models\Product;

  class ProductController extends Controller
  {
      public function index()
      {
          // 获取所有产品
          $products = Product::all();
          
          // 返回JSON响应
          return response()->json($products);
      }
  }
  ```

  文件示例：模型
  `app/Models/Product.php`:

  ```php
  namespace App\Models;

  use Illuminate\Database\Eloquent\Model;

  class Product extends Model
  {
      // 关联到products表
      protected $table = 'products';
      
      // 允许批量赋值的字段
      protected $fillable = ['name', 'price', 'description'];
      
      // 需要隐藏的字段（如密码）
      protected $hidden = ['created_at', 'updated_at'];
  }
  ```
## 最佳实践
  **环境配置**：

  - 开发环境用`.env`文件
  - 生产环境用服务器真实环境变量

  **Composer技巧**：

  ```bash
  # 查看过时的包
  composer outdated

  # 安全更新
  composer update --dry-run
  ```

  **Artisan技巧**：

  ```bash
  # 查看所有可用命令
  php artisan list

  # 生成路由缓存（生产环境加速）
  php artisan route:cache
  ```

  **项目结构规范**：

  - 控制器放在`app/Http/Controllers`
  - 模型放在`app/Models`
  - 服务类放在`app/Services`
## 常见问题
  ❓ Q：本地开发该用Homestead还是Sail？  
  → 新手推荐Sail，Docker环境更简单；老手可选Homestead

  ❓ Q：执行composer install报错怎么办？  
  → 尝试：

  ```bash
  composer install --ignore-platform-reqs
  rm -rf vendor
  composer clear-cache
  ```

  ❓ Q：如何查看当前PHP版本？  
  → 在项目根目录运行：

  ```bash
  php -v
  ./vendor/bin/sail php -v  # 如果使用Sail
  ```
