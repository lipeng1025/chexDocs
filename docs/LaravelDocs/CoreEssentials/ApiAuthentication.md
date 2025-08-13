# API认证

## 一、Sanctum配置

  **是什么？**
  > - Sanctum是Laravel官方提供的轻量级API认证系统，用于生成和管理API访问令牌

  **有什么用？**
  - 为用户生成API访问令牌
  - 保护API路由
  - 支持SPA（单页面应用）认证
  - 管理令牌权限
  - 替代Passport的轻量级方案

  **怎么用？**

  **步骤1：安装Sanctum**
  ```bash
  composer require laravel/sanctum

  # 发布配置文件
  php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

  # 运行数据库迁移
  php artisan migrate
  ```

  **步骤2：配置用户模型**
  ```php
  // app/Models/User.php
  use Laravel\Sanctum\HasApiTokens;

  class User extends Authenticatable
  {
      use HasApiTokens; // 添加这一行
      
      // ...其他代码
  }
  ```

  **步骤3：配置中间件**
  ```php
  // app/Http/Kernel.php
  'api' => [
      \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
      'throttle:api',
      \Illuminate\Routing\Middleware\SubstituteBindings::class,
  ],
  ```

  **步骤4：配置CORS（如果需要跨域）**
  ```php
  // config/cors.php
  'paths' => [
      'api/*',
      'login',
      'logout',
      'sanctum/csrf-cookie',
  ],
  ```

  **步骤5：配置.env文件**
  ```env
  SESSION_DRIVER=cookie
  SESSION_DOMAIN=.yourdomain.com # 设置顶级域名
  SANCTUM_STATEFUL_DOMAINS=localhost:3000,yourdomain.com
  ```

## 二、令牌管理

  **是什么？**
  > - 创建、管理和撤销用户API访问令牌

  **有什么用？**
  - 控制API访问权限
  - 限制令牌能力
  - 管理多个设备登录
  - 增强API安全性

  **怎么用？**

  1. **创建令牌（登录）**
  ```php
  // routes/api.php
  use Illuminate\Http\Request;
  use Illuminate\Support\Facades\Route;

  Route::post('/login', function (Request $request) {
      // 验证用户凭证
      $credentials = $request->validate([
          'email' => 'required|email',
          'password' => 'required',
      ]);
      
      // 尝试登录
      if (!auth()->attempt($credentials)) {
          return response()->json(['message' => '无效凭证'], 401);
      }
      
      // 创建令牌
      $token = auth()->user()->createToken('api-token', [
          'posts:create',
          'posts:update'
      ])->plainTextToken;
      
      // 返回令牌
      return response()->json([
          'token' => $token,
          'user' => auth()->user()
      ]);
  });
  ```

  2. **保护API路由**
  ```php
  // 使用中间件保护路由
  Route::middleware('auth:sanctum')->group(function () {
      // 需要认证的路由
      Route::get('/user', function (Request $request) {
          return $request->user();
      });
      
      Route::post('/posts', [PostController::class, 'store']);
      Route::put('/posts/{post}', [PostController::class, 'update']);
  });
  ```

  3. **在请求中使用令牌**
  ```javascript
  // JavaScript示例（前端应用）
  // 登录后存储令牌
  localStorage.setItem('token', response.data.token);

  // 发送API请求
  fetch('/api/user', {
      headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
  })
  .then(response => response.json())
  .then(data => console.log(data));
  ```

  4. **令牌管理方法**
  ```php
  // 获取当前用户所有令牌
  $tokens = auth()->user()->tokens;

  // 撤销特定令牌
  auth()->user()->tokens()->where('id', $tokenId)->delete();

  // 撤销所有令牌（用户退出所有设备）
  auth()->user()->tokens()->delete();

  // 检查令牌权限
  if ($request->user()->tokenCan('posts:create')) {
      // 允许创建文章
  }
  ```

  5. **退出登录（撤销令牌）**
  ```php
  // routes/api.php
  Route::post('/logout', function (Request $request) {
      // 撤销当前令牌
      $request->user()->currentAccessToken()->delete();
      
      return response()->json(['message' => '已退出登录']);
  })->middleware('auth:sanctum');
  ```
  ---
  **完整API认证流程示例**

  1. **获取CSRF Cookie（仅SPA需要）**
  ```javascript
  // 前端应用初始化时
  axios.get('/sanctum/csrf-cookie');
  ```

  2. **登录请求**
  ```javascript
  // 前端发送登录请求
  axios.post('/login', {
      email: 'user@example.com',
      password: 'password'
  })
  .then(response => {
      // 保存令牌
      localStorage.setItem('token', response.data.token);
  })
  .catch(error => {
      console.error('登录失败', error);
  });
  ```

  3. **访问受保护API**
  ```javascript
  // 发送带令牌的请求
  axios.get('/api/user', {
      headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
  })
  .then(response => {
      console.log('用户数据:', response.data);
  });
  ```
  4. **退出登录**
  ```javascript
  // 发送退出请求
  axios.post('/api/logout', {}, {
      headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
  })
  .then(() => {
      // 移除令牌
      localStorage.removeItem('token');
  });
  ```
  ---
  **令牌能力（权限）管理**

  1. **定义令牌能力**
  ```php
  // 创建令牌时指定能力
  $token = $user->createToken('api-token', [
      'posts:view',
      'posts:create',
      'posts:update',
      'posts:delete'
  ])->plainTextToken;
  ```

  2. **检查令牌能力**
  ```php
  // 在控制器中检查
  public function store(Request $request)
  {
      if (!$request->user()->tokenCan('posts:create')) {
          return response()->json(['error' => '无权操作'], 403);
      }
      
      // 创建文章逻辑
  }

  // 在中间件中检查（推荐）
  // 创建中间件
  php artisan make:middleware CheckTokenAbility

  // app/Http/Middleware/CheckTokenAbility.php
  public function handle($request, Closure $next, ...$abilities)
  {
      foreach ($abilities as $ability) {
          if (!$request->user()->tokenCan($ability)) {
              abort(403, '无权访问');
          }
      }
      
      return $next($request);
  }

  // 注册中间件 (app/Http/Kernel.php)
  protected $routeMiddleware = [
      'abilities' => \App\Http\Middleware\CheckTokenAbility::class,
  ];

  // 在路由中使用
  Route::post('/posts', [PostController::class, 'store'])
      ->middleware(['auth:sanctum', 'abilities:posts:create']);
  ```
  ---
  **令牌过期与刷新**

  1. **设置令牌过期时间**
  ```php
  // 在 .env 中设置
  SANCTUM_EXPIRATION=1440  // 分钟（默认24小时）

  // 或者在 config/sanctum.php 中
  'expiration' => 60 * 24 * 7, // 设置7天过期
  ```

  2. **令牌刷新机制**
  ```php
  // 创建刷新令牌路由
  Route::post('/refresh-token', function (Request $request) {
      // 获取当前令牌
      $currentToken = $request->user()->currentAccessToken();
      
      // 撤销旧令牌
      $currentToken->delete();
      
      // 创建新令牌
      $newToken = $request->user()->createToken('api-token')->plainTextToken;
      
      return response()->json(['token' => $newToken]);
  })->middleware('auth:sanctum');
  ```

  3. **前端刷新令牌逻辑**
  ```javascript
  // 请求拦截器（自动处理令牌刷新）
  axios.interceptors.response.use(response => {
      return response;
  }, error => {
      const originalRequest = error.config;
      
      // 如果是401错误且不是刷新请求
      if (error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          // 发送刷新令牌请求
          return axios.post('/api/refresh-token', {}, {
              headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
          })
          .then(res => {
              // 保存新令牌
              localStorage.setItem('token', res.data.token);
              
              // 重试原始请求
              originalRequest.headers['Authorization'] = 'Bearer ' + res.data.token;
              return axios(originalRequest);
          });
      }
      
      return Promise.reject(error);
  });
  ```
  ---
  **多设备管理**

  1. **获取所有设备**
  ```php
  // 获取用户所有活动设备
  public function devices(Request $request)
  {
      $devices = $request->user()->tokens()->get()->map(function ($token) {
          return [
              'id' => $token->id,
              'name' => $token->name,
              'last_used' => $token->last_used_at,
              'abilities' => $token->abilities,
          ];
      });
      
      return response()->json($devices);
  }
  ```

  2. **撤销其他设备**
  ```php
  // 撤销除当前设备外的所有令牌
  public function logoutOtherDevices(Request $request)
  {
      $request->user()->tokens()
          ->where('id', '!=', $request->user()->currentAccessToken()->id)
          ->delete();
      
      return response()->json(['message' => '其他设备已退出']);
  }
  ```
  ---
  **测试API认证**

  1. **创建测试用户**
  ```bash
  php artisan make:test ApiAuthTest
  ```

  2. **编写测试用例**
  ```php
  // tests/Feature/ApiAuthTest.php
  public function test_api_authentication()
  {
      // 创建用户
      $user = User::factory()->create([
          'email' => 'test@example.com',
          'password' => bcrypt('password123')
      ]);
      
      // 测试登录失败
      $response = $this->postJson('/api/login', [
          'email' => 'test@example.com',
          'password' => 'wrong-password'
      ]);
      $response->assertStatus(401);
      
      // 测试登录成功
      $response = $this->postJson('/api/login', [
          'email' => 'test@example.com',
          'password' => 'password123'
      ]);
      $response->assertOk();
      $response->assertJsonStructure(['token']);
      
      $token = $response->json('token');
      
      // 使用令牌访问受保护路由
      $response = $this->withHeaders([
          'Authorization' => 'Bearer ' . $token
      ])->getJson('/api/user');
      
      $response->assertOk();
      $response->assertJson(['email' => 'test@example.com']);
      
      // 测试退出
      $response = $this->withHeaders([
          'Authorization' => 'Bearer ' . $token
      ])->postJson('/api/logout');
      
      $response->assertJson(['message' => '已退出登录']);
      
      // 验证令牌已撤销
      $response = $this->withHeaders([
          'Authorization' => 'Bearer ' . $token
      ])->getJson('/api/user');
      
      $response->assertStatus(401);
  }
  ```
## 小贴士

  - **安全最佳实践**：

      - 使用HTTPS传输令牌
      - 设置合理的令牌过期时间
      - 限制令牌权限（最小权限原则）
      - 定期轮换令牌密钥（如果需要）

  - **性能优化**：

      - 使用缓存存储令牌信息
      - 避免在每个请求中查询数据库
      - 对频繁访问的API进行速率限制

  - **SPA集成技巧**：

  ```javascript
  // 自动附加令牌的Axios实例
  const api = axios.create({
      baseURL: '/api',
      withCredentials: true,
  });

  // 请求拦截器
  api.interceptors.request.use(config => {
      const token = localStorage.getItem('token');
      if (token) {
          config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
  });
  ```
  - **移动应用集成**：

      - 使用安全存储保存令牌
      - 实现自动刷新令牌逻辑
      - 处理网络断开时的令牌管理


