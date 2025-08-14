# 包开发
## 概念

  **什么是包开发？**
  > - 包开发就是创建可复用的代码模块（就像乐高积木），可以轻松集成到多个Laravel项目中，避免重复造轮子。

  **有什么用？**
  - 封装通用功能供多个项目使用
  - 分享代码给社区
  - 保持项目核心代码简洁
  - 提高开发效率
  - 方便功能升级和维护

## 一、包结构

  **是什么？**
  > - 包结构就像给你的代码模块设计"房间布局"，合理的结构能让你的包更易用、更专业。

  **有什么用？**
  - 组织代码逻辑清晰
  - 符合Laravel标准规范
  - 方便其他开发者使用
  - 支持Composer自动加载
  - 便于测试和维护

  **怎么用？**

  1. **创建基础目录结构**
  ```bash
    my-package/
    ├── src/
    │   ├── MyPackageServiceProvider.php
    │   └── Facades/
    │       └── MyPackage.php
    ├── config/
    │   └── mypackage.php
    ├── resources/
    │   ├── views/
    │   └── lang/
    ├── tests/
    ├── database/
    │   ├── migrations/
    │   └── seeders/
    ├── routes/
    │   └── web.php
    ├── composer.json
    └── README.md
  ```

  2. **编辑composer.json文件**
  ```json
  {
      "name": "your-name/my-package",
      "description": "A simple Laravel package example",
      "type": "library",
      "license": "MIT",
      "authors": [
          {
              "name": "Your Name",
              "email": "your@email.com"
          }
      ],
      "require": {
          "php": "^8.0",
          "laravel/framework": "^10.0"
      },
      "autoload": {
          "psr-4": {
              "YourName\\MyPackage\\": "src/"
          }
      },
      "extra": {
          "laravel": {
              "providers": [
                  "YourName\\MyPackage\\MyPackageServiceProvider"
              ],
              "aliases": {
                  "MyPackage": "YourName\\MyPackage\\Facades\\MyPackage"
              }
          }
      }
  }
  ```

  3. **创建服务提供者 `src/MyPackageServiceProvider.php`**
  ```php
  namespace YourName\MyPackage;

  use Illuminate\Support\ServiceProvider;

  class MyPackageServiceProvider extends ServiceProvider
  {
      public function boot()
      {
          // 发布配置文件
          $this->publishes([
              __DIR__.'/../config/mypackage.php' => config_path('mypackage.php'),
          ], 'config');
          
          // 发布视图文件
          $this->publishes([
              __DIR__.'/../resources/views' => resource_path('views/vendor/mypackage'),
          ], 'views');
          
          // 加载路由
          $this->loadRoutesFrom(__DIR__.'/../routes/web.php');
          
          // 加载视图
          $this->loadViewsFrom(__DIR__.'/../resources/views', 'mypackage');
          
          // 加载数据库迁移
          $this->loadMigrationsFrom(__DIR__.'/../database/migrations');
          
          // 加载语言文件
          $this->loadTranslationsFrom(__DIR__.'/../resources/lang', 'mypackage');
      }
      
      public function register()
      {
          // 合并配置
          $this->mergeConfigFrom(
              __DIR__.'/../config/mypackage.php', 'mypackage'
          );
          
          // 注册包的单例
          $this->app->singleton('mypackage', function ($app) {
              return new \YourName\MyPackage\MyPackage();
          });
      }
  }
  ```

  4. **创建包主类 `src/MyPackage.php`**
  ```php
  namespace YourName\MyPackage;

  class MyPackage
  {
      public function hello($name = 'World')
      {
          return "Hello, $name! From MyPackage";
      }
      
      public function advancedMethod()
      {
          // 包的核心功能实现
      }
  }
  ```

  5. **创建门面 `src/Facades/MyPackage.php`**
  ```php
  namespace YourName\MyPackage\Facades;

  use Illuminate\Support\Facades\Facade;

  class MyPackage extends Facade
  {
      protected static function getFacadeAccessor()
      {
          return 'mypackage';
      }
  }
  ```

  6. **创建配置文件 `config/mypackage.php`**
  ```php
  return [
      'api_key' => env('MYPACKAGE_API_KEY', 'default_key'),
      'options' => [
          'feature_enabled' => true,
          'max_attempts' => 5,
      ],
  ];
  ```

  7. **创建示例视图 `resources/views/hello.blade.php`**
  ```blade
  <!DOCTYPE html>
  <html>
  <head>
      <title>MyPackage</title>
  </head>
  <body>
      <h1>{{ $message }}</h1>
  </body>
  </html>
  ```

  8. **创建路由文件 `routes/web.php`**
  ```php
  use Illuminate\Support\Facades\Route;
  use YourName\MyPackage\Facades\MyPackage;

  Route::get('mypackage/hello', function () {
      return MyPackage::hello('Laravel Developer');
  });

  Route::get('mypackage/view', function () {
      return view('mypackage::hello', [
          'message' => MyPackage::hello('View User')
      ]);
  });
  ```

## 二、服务提供者

  **是什么？**
  > - 服务提供者就像包的"启动引擎"，负责将包集成到Laravel应用中。

  **有什么用？**
  - 注册包的服务到容器
  - 初始化包的功能
  - 发布资源文件
  - 定义路由和事件
  - 扩展Laravel核心功能

  **怎么用？**

  1. **基本结构**
  ```php
  namespace YourName\MyPackage;

  use Illuminate\Support\ServiceProvider;

  class MyPackageServiceProvider extends ServiceProvider
  {
      // 注册绑定到容器
      public function register()
      {
          $this->app->singleton('mypackage', function ($app) {
              return new MyPackage(config('mypackage.api_key'));
          });
      }
      
      // 启动包服务
      public function boot()
      {
          // 初始化逻辑
      }
  }
  ```

  2. **注册命令**
  ```php
  public function boot()
  {
      if ($this->app->runningInConsole()) {
          $this->commands([
              \YourName\MyPackage\Console\InstallCommand::class,
          ]);
      }
  }
  ```

  3. **创建安装命令 `src/Console/InstallCommand.php`**
  ```php
  namespace YourName\MyPackage\Console;

  use Illuminate\Console\Command;

  class InstallCommand extends Command
  {
      protected $signature = 'mypackage:install';
      protected $description = 'Install MyPackage';
      
      public function handle()
      {
          $this->info('Installing MyPackage...');
          
          // 发布配置文件
          $this->call('vendor:publish', [
              '--provider' => "YourName\MyPackage\MyPackageServiceProvider",
              '--tag' => 'config'
          ]);
          
          // 发布视图
          $this->call('vendor:publish', [
              '--provider' => "YourName\MyPackage\MyPackageServiceProvider",
              '--tag' => 'views'
          ]);
          
          // 运行迁移
          $this->call('migrate');
          
          $this->info('MyPackage installed successfully!');
      }
  }
  ```

  4. **扩展Laravel功能**
  ```php
  public function boot()
  {
      // 扩展验证规则
      \Illuminate\Support\Facades\Validator::extend('custom_rule', function ($attribute, $value, $parameters) {
          return $value === 'custom';
      });
      
      // 添加中间件
      $this->app['router']->aliasMiddleware('package_middleware', \YourName\MyPackage\Middleware\PackageMiddleware::class);
      
      // 注册事件监听器
      $this->app['events']->listen(
          \App\Events\UserRegistered::class,
          \YourName\MyPackage\Listeners\SendWelcomeNotification::class
      );
  }
  ```

  5. **条件加载服务**
  ```php
  public function register()
  {
      // 仅在特定环境注册服务
      if ($this->app->environment('production')) {
          $this->app->singleton('mypackage', function ($app) {
              return new ProductionPackage();
          });
      } else {
          $this->app->singleton('mypackage', function ($app) {
              return new DevelopmentPackage();
          });
      }
  }
  ```

  6. **延迟加载服务提供者**
  ```php
  class MyPackageServiceProvider extends ServiceProvider
  {
      protected $defer = true; // 延迟加载
      
      public function provides()
      {
          return ['mypackage'];
      }
  }
  ```
## 完整示例：开发一个简单的统计包

  1. **包结构**
  ```text
  statistics-package/
  ├── src/
  │   ├── StatisticsServiceProvider.php
  │   ├── Facades/
  │   │   └── Statistics.php
  │   ├── Services/
  │   │   └── StatisticsService.php
  │   └── Models/
  │       └── PageView.php
  ├── config/
  │   └── statistics.php
  ├── database/
  │   ├── migrations/
  │   │   └── 2023_01_01_000000_create_page_views_table.php
  │   └── seeders/
  ├── resources/
  │   └── views/
  │       └── dashboard.blade.php
  ├── routes/
  │   └── web.php
  ├── tests/
  ├── composer.json
  └── README.md
  ```

  2. **服务提供者 `src/StatisticsServiceProvider.php`**
  ```php
  namespace YourName\Statistics;

  use Illuminate\Support\ServiceProvider;

  class StatisticsServiceProvider extends ServiceProvider
  {
      public function boot()
      {
          // 发布配置文件
          $this->publishes([
              __DIR__.'/../config/statistics.php' => config_path('statistics.php'),
          ], 'config');
          
          // 发布迁移文件
          $this->publishes([
              __DIR__.'/../database/migrations' => database_path('migrations'),
          ], 'migrations');
          
          // 发布视图
          $this->publishes([
              __DIR__.'/../resources/views' => resource_path('views/vendor/statistics'),
          ], 'views');
          
          // 加载路由
          $this->loadRoutesFrom(__DIR__.'/../routes/web.php');
          
          // 加载视图
          $this->loadViewsFrom(__DIR__.'/../resources/views', 'statistics');
      }
      
      public function register()
      {
          $this->mergeConfigFrom(
              __DIR__.'/../config/statistics.php', 'statistics'
          );
          
          $this->app->singleton('statistics', function ($app) {
              return new Services\StatisticsService();
          });
      }
  }
  ```

  3. **统计服务 `src/Services/StatisticsService.php`**
  ```php
  namespace YourName\Statistics\Services;

  use YourName\Statistics\Models\PageView;
  use Illuminate\Support\Facades\Auth;

  class StatisticsService
  {
      public function trackPageView($request)
      {
          if (config('statistics.enabled')) {
              PageView::create([
                  'url' => $request->fullUrl(),
                  'ip' => $request->ip(),
                  'user_id' => Auth::id(),
                  'user_agent' => $request->userAgent(),
              ]);
          }
      }
      
      public function getPageViews()
      {
          return PageView::count();
      }
      
      public function getPopularPages()
      {
          return PageView::select('url')
              ->selectRaw('COUNT(*) as views')
              ->groupBy('url')
              ->orderByDesc('views')
              ->limit(10)
              ->get();
      }
  }
  ```

  4. **路由 `routes/web.php`**
  ```php
  use Illuminate\Support\Facades\Route;
  use YourName\Statistics\Facades\Statistics;

  // 跟踪页面访问的中间件
  Route::middleware('web')->group(function () {
      Route::get('statistics/track', function (\Illuminate\Http\Request $request) {
          Statistics::trackPageView($request);
          return response()->json(['status' => 'tracked']);
      });
      
      // 统计仪表盘
      Route::get('statistics/dashboard', function () {
          return view('statistics::dashboard', [
              'totalViews' => Statistics::getPageViews(),
              'popularPages' => Statistics::getPopularPages()
          ]);
      })->middleware('auth');
  });
  ```

  5. **在应用中使用包**
  ```php
  // 在AppServiceProvider中
  public function boot()
  {
      // 记录所有页面访问
      \Illuminate\Support\Facades\Event::listen('Illuminate\Routing\Events\RouteMatched', function ($event) {
          \YourName\Statistics\Facades\Statistics::trackPageView($event->request);
      });
  }
  ```

  6. **安装包**
  ```bash
  # 在Laravel项目中
  composer require your-name/statistics

  # 发布配置文件
  php artisan vendor:publish --provider="YourName\Statistics\StatisticsServiceProvider" --tag="config"

  # 发布迁移文件
  php artisan vendor:publish --provider="YourName\Statistics\StatisticsServiceProvider" --tag="migrations"

  # 运行迁移
  php artisan migrate
  ```
## 包开发最佳实践

  1. **版本控制**
  ```bash
  # 初始化Git仓库
  git init

  # 设置版本号
  git tag v1.0.0

  # 推送到远程仓库
  git push origin --tags
  ```

  2. **测试包**
  ```php
  // tests/StatisticsTest.php
  class StatisticsTest extends TestCase
  {
      public function test_tracks_page_view()
      {
          $request = Request::create('/test', 'GET');
          app(StatisticsService::class)->trackPageView($request);
          
          $this->assertDatabaseHas('page_views', [
              'url' => '/test'
          ]);
      }
  }
  ```

  运行测试：

  ```bash
  composer test
  ```

  3. **发布包到Packagist**
  - 在GitHub创建仓库
  - 在Packagist提交包
  - 配置GitHub Webhook自动更新

  4. **语义化版本控制**
  ```markdown
  版本号格式：MAJOR.MINOR.PATCH

  - MAJOR：不兼容的API修改
  - MINOR：向后兼容的功能新增
  - PATCH：向后兼容的问题修复
  ```

  5. **持续集成配置 `.github/workflows/tests.yml`**
  ```yaml
  name: Tests

  on: [push, pull_request]

  jobs:
    tests:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v2
        
        - name: Setup PHP
          uses: shivammathur/setup-php@v2
          with:
            php-version: 8.2
            extensions: dom, curl, libxml, mbstring, zip, pdo, sqlite
            coverage: xdebug
            
        - name: Install Dependencies
          run: composer install -n --prefer-dist
          
        - name: Generate .env
          run: cp .env.example .env
          
        - name: Create Database
          run: |
            touch database/database.sqlite
            php artisan migrate --database=sqlite --force
            
        - name: Run Tests
          run: php artisan test
  ```
## 常见问题解答

  **Q：如何本地测试包？**  
  A：使用Composer路径加载：

  ```bash
  # 在Laravel项目的composer.json中添加
  "repositories": [
      {
          "type": "path",
          "url": "../my-package"
      }
  ]

  # 然后安装
  composer require your-name/my-package:@dev
  ```

  **Q：如何更新包的迁移文件？**  
  A：

  - 更新包中的迁移文件
  - 重新发布迁移：

  ```bash
  php artisan vendor:publish --tag=migrations --force
  ```

  **Q：包中如何使用Eloquent模型？**  
  A：

  ```php
  namespace YourName\MyPackage\Models;

  use Illuminate\Database\Eloquent\Model;

  class PackageModel extends Model
  {
      protected $table = 'package_table';
  }
  ```

  **Q：如何创建包配置命令？**  
  A：

  ```php
  // 在服务提供者中
  public function boot()
  {
      if ($this->app->runningInConsole()) {
          $this->commands([
              Console\PackageCommand::class,
          ]);
      }
  }
  ```

  **Q：包如何依赖其他包？**  
  A：在composer.json中添加：

  ```json
  "require": {
      "guzzlehttp/guzzle": "^7.0"
  }
  ```

  **Q：如何处理包中的视图？**  
  A：

  ```php
  // 在服务提供者中
  public function boot()
  {
      $this->loadViewsFrom(__DIR__.'/../resources/views', 'mypackage');
  }

  // 在代码中使用
  return view('mypackage::view-name');
  ```

  **Q：如何发布包资源？**  
  A：

  ```bash
  # 发布配置文件
  php artisan vendor:publish --tag=config

  # 发布视图
  php artisan vendor:publish --tag=views

  # 发布迁移
  php artisan vendor:publish --tag=migrations

  # 发布所有
  php artisan vendor:publish --provider="YourName\MyPackage\MyPackageServiceProvider"
  ```
