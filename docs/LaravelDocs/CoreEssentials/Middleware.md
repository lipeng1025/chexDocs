# 中间件

## 一、中间件创建

  **是什么？**
  > - 中间件是处理HTTP请求的"中间人"，可以在请求到达控制器前或响应返回给用户前进行处理

  **有什么用？**
  - 验证用户身份
  - 记录请求日志
  - 过滤恶意请求
  - 维护模式检查
  - 设置响应头

  **怎么用？**

  **步骤1：创建中间件**
  ```bash
  php artisan make:middleware CheckAge
  php artisan make:middleware LogRequests
  ```

  **步骤2：中间件基本结构 (`app/Http/Middleware/CheckAge.php`)**
  ```php
  namespace App\Http\Middleware;

  use Closure;
  use Illuminate\Http\Request;
  use Symfony\Component\HttpFoundation\Response;

  class CheckAge
  {
      /**
      * 处理传入的请求
      *
      * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
      */
      public function handle(Request $request, Closure $next): Response
      {
          // 在请求前执行的代码
          if ($request->age < 18) {
              return redirect('underage'); // 重定向
          }
          
          // 继续处理请求
          $response = $next($request);
          
          // 在响应后执行的代码
          // 可以修改响应内容或添加头信息
          
          return $response;
      }
  }
  ```

  **步骤3：使用中间件（简单示例）**
  ```php
  public function showDashboard(Request $request)
  {
      // 手动调用中间件
      $response = (new CheckAge)->handle($request, function ($request) {
          return view('dashboard');
      });
      
      return $response;
  }
  ```

## 二、注册

  **是什么？**
  > - 告诉Laravel在哪些地方使用中间件

  **有什么用？**
  - 全局应用（所有请求）
  - 路由组应用（一组路由）
  - 单个路由应用
  - 控制器应用

  **怎么用？**

  1. **全局中间件注册 (`app/Http/Kernel.php`)**
  ```php
  protected $middleware = [
      // 默认中间件...
      \App\Http\Middleware\TrustProxies::class,
      \Illuminate\Http\Middleware\HandleCors::class,
      // 添加自定义中间件
      \App\Http\Middleware\LogRequests::class,
  ];
  ```

  2. **路由中间件组注册 (`app/Http/Kernel.php`)**
  ```php
  protected $middlewareGroups = [
      'web' => [
          \App\Http\Middleware\EncryptCookies::class,
          \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
          // 添加自定义中间件
          \App\Http\Middleware\TrackUserActivity::class,
      ],
      
      'api' => [
          \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
          // 添加自定义中间件
          \App\Http\Middleware\ApiThrottle::class,
      ],
  ];
  ```

  3. **注册单个中间件别名 (`app/Http/Kernel.php`)**
  ```php
  protected $routeMiddleware = [
      'auth' => \App\Http\Middleware\Authenticate::class,
      'admin' => \App\Http\Middleware\CheckAdminRole::class, // 自定义中间件
      'age' => \App\Http\Middleware\CheckAge::class, // 自定义中间件
  ];
  ```

  4. **在路由中使用中间件**
  ```php
  // 单个路由使用
  Route::get('/adult-content', function () {
      // 仅限成人内容
  })->middleware('age');

  // 多个中间件
  Route::get('/admin/dashboard', function () {
      return view('admin.dashboard');
  })->middleware(['auth', 'admin']);

  // 路由组使用
  Route::middleware(['auth', 'verified'])->group(function () {
      Route::get('/profile', [ProfileController::class, 'show']);
      Route::put('/profile', [ProfileController::class, 'update']);
  });

  // 控制器中使用
  class UserController extends Controller
  {
      public function __construct()
      {
          // 应用到所有方法
          $this->middleware('auth');
          
          // 只应用到特定方法
          $this->middleware('log')->only('update');
          
          // 排除特定方法
          $this->middleware('subscribed')->except('show');
      }
  }
  ```

## 三、内置中间件

  **是什么？**
  > - Laravel自带的核心中间件，解决常见需求

  **有什么用？**
  - 身份验证
  - CSRF保护
  - 跨域资源共享(CORS)
  - 请求频率限制
  - 数据加密

  **常用内置中间件：**

  1. **身份验证 (auth)**
  ```php
  // 路由中使用
  Route::get('/profile', function () {
      // 只有登录用户可访问
  })->middleware('auth');

  // 控制器中使用
  public function __construct()
  {
      $this->middleware('auth');
  }
  ```

  2. **CSRF保护 (verifyCsrfToken)**
  ```php
  // 自动应用到所有web路由
  // 在表单中添加CSRF令牌
  <form method="POST" action="/profile">
      @csrf
      <!-- 表单内容 -->
  </form>

  // 排除特定URL
  class VerifyCsrfToken extends Middleware
  {
      protected $except = [
          'stripe/*',
          'api/webhook',
      ];
  }
  ```

  3. **CORS跨域 (HandleCors)**
  ```php
  // 配置跨域 (config/cors.php)
  return [
      'paths' => ['api/*'],
      'allowed_methods' => ['*'],
      'allowed_origins' => ['https://example.com'],
      'allowed_headers' => ['*'],
      'exposed_headers' => [],
      'max_age' => 0,
      'supports_credentials' => false,
  ];
  ```

  4. **请求频率限制 (throttle)**
  ```php
  // 每分钟最多60次请求
  Route::middleware('throttle:60,1')->group(function () {
      Route::get('/api/users', [UserController::class, 'index']);
  });

  // 动态速率限制（根据用户）
  Route::middleware('throttle:rate_limit,1')->group(function () {
      // rate_limit是用户模型中的字段
  });

  // 自定义限制器 (app/Providers/RouteServiceProvider.php)
  protected function configureRateLimiting()
  {
      RateLimiter::for('api', function (Request $request) {
          return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
      });
      
      RateLimiter::for('downloads', function (Request $request) {
          return $request->user()->vip_member
              ? Limit::none()
              : Limit::perMinute(3);
      });
  }

  // 在路由中使用自定义限制器
  Route::get('/download', [DownloadController::class, 'download'])
      ->middleware('throttle:downloads');
  ```

  5. **维护模式 (CheckForMaintenanceMode)**
  ```php
  // 开启维护模式
  php artisan down

  // 开启维护模式并设置重定向
  php artisan down --redirect=/maintenance

  // 允许特定IP访问
  php artisan down --allow=192.168.1.1 --allow=192.168.1.2

  // 关闭维护模式
  php artisan up

  // 自定义维护页面 (resources/views/errors/503.blade.php)
  <!DOCTYPE html>
  <html>
  <head>
      <title>维护中</title>
  </head>
  <body>
      <h1>网站维护中，请稍后再访问</h1>
      <p>预计恢复时间: {{ $retryAfter }}分钟</p>
  </body>
  </html>
  ```
## 自定义中间件示例

  1. **记录请求日志中间件**
  ```php
  namespace App\Http\Middleware;

  use Closure;
  use Illuminate\Support\Facades\Log;

  class LogRequests
  {
      public function handle($request, Closure $next)
      {
          // 记录请求信息
          Log::info('Request:', [
              'method' => $request->method(),
              'url' => $request->fullUrl(),
              'ip' => $request->ip(),
              'user_agent' => $request->header('User-Agent'),
          ]);
          
          // 继续处理请求
          $response = $next($request);
          
          // 记录响应信息
          Log::info('Response:', [
              'status' => $response->status(),
              'content_type' => $response->headers->get('Content-Type'),
          ]);
          
          return $response;
      }
  }
  ```

  2. **管理员检查中间件**
  ```php
  namespace App\Http\Middleware;

  use Closure;
  use Illuminate\Http\Request;
  use Symfony\Component\HttpFoundation\Response;

  class CheckAdminRole
  {
      public function handle(Request $request, Closure $next): Response
      {
          // 检查用户是否登录且是管理员
          if (!auth()->check() || !auth()->user()->isAdmin()) {
              // 如果是API请求，返回JSON错误
              if ($request->expectsJson()) {
                  return response()->json(['error' => '无权访问'], 403);
              }
              
              // 否则重定向到首页
              return redirect('/')->with('error', '您不是管理员！');
          }
          
          return $next($request);
      }
  }
  ```

  3. **响应头设置中间件**
  ```php
  namespace App\Http\Middleware;

  use Closure;
  use Illuminate\Http\Request;
  use Symfony\Component\HttpFoundation\Response;

  class SecurityHeaders
  {
      public function handle(Request $request, Closure $next): Response
      {
          $response = $next($request);
          
          // 添加安全相关的HTTP头
          $response->headers->set('X-Content-Type-Options', 'nosniff');
          $response->headers->set('X-Frame-Options', 'DENY');
          $response->headers->set('X-XSS-Protection', '1; mode=block');
          $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
          
          // 添加自定义头
          $response->headers->set('X-App-Version', config('app.version'));
          
          return $response;
      }
  }
  ```
## 中间件参数传递

  1. **创建带参数的中间件**
  ```php
  namespace App\Http\Middleware;

  use Closure;
  use Illuminate\Http\Request;
  use Symfony\Component\HttpFoundation\Response;

  class CheckRole
  {
      public function handle(Request $request, Closure $next, string $role): Response
      {
          if (!auth()->check() || !auth()->user()->hasRole($role)) {
              abort(403, '无权访问');
          }
          
          return $next($request);
      }
  }
  ```

  2. **注册中间件别名**
  ```php
  // app/Http/Kernel.php
  protected $routeMiddleware = [
      'role' => \App\Http\Middleware\CheckRole::class,
  ];
  ```

  3. **使用带参数的中间件**
  ```php
  // 在路由中使用
  Route::get('/admin', function () {
      // 管理员面板
  })->middleware('role:admin');

  Route::get('/editor', function () {
      // 编辑面板
  })->middleware('role:editor');
  ```
## 中间件组应用示例

  **API速率限制组**
  ```php
  // app/Http/Kernel.php
  protected $middlewareGroups = [
      'api' => [
          'throttle:api',
          \Illuminate\Routing\Middleware\SubstituteBindings::class,
      ],
      
      'api:60' => [
          'throttle:60,1', // 每分钟60次
          \Illuminate\Routing\Middleware\SubstituteBindings::class,
      ],
      
      'api:300' => [
          'throttle:300,1', // 每分钟300次
          \Illuminate\Routing\Middleware\SubstituteBindings::class,
      ],
  ];

  // 在路由中使用
  Route::middleware('api:300')->group(function () {
      // 高频API端点
      Route::get('/public-data', [DataController::class, 'publicData']);
  });

  Route::middleware('api:60')->group(function () {
      // 中频API端点
      Route::get('/user-data', [DataController::class, 'userData']);
  });

  Route::middleware('api')->group(function () {
      // 低频API端点
      Route::post('/process-data', [DataController::class, 'processData']);
  });
  ```
## 小贴士

  - **中间件执行顺序**：

      - 全局中间件最先执行
      - 中间件组按定义顺序执行
      - 路由中间件按定义顺序执行

  - **终止中间件**：

  ```php
  class TerminateMiddleware
  {
      public function handle($request, Closure $next)
      {
          return $next($request);
      }
      
      public function terminate($request, $response)
      {
          // 在响应发送给浏览器后执行
          Log::info('Request completed');
      }
  }
  ```
  - **中间件测试**：

  ```php
  public function testAdminMiddleware()
  {
      // 普通用户应被重定向
      $user = User::factory()->create();
      $this->actingAs($user)
          ->get('/admin')
          ->assertRedirect('/');
      
      // 管理员用户应能访问
      $admin = User::factory()->admin()->create();
      $this->actingAs($admin)
          ->get('/admin')
          ->assertOk();
  }
  ```
  - **中间件性能优化**：

      - 避免在全局中间件中执行耗时操作
      - 使用缓存减少数据库查询
      - 对中间件进行基准测试


