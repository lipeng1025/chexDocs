# 高级认证
## 概念

  **什么是高级认证？**
  > - 高级认证就是在基本登录注册之外，提供更安全、更专业的身份验证方式。就像普通门锁升级为指纹锁，让应用更安全、更便捷。

  **有什么用？**
  - 实现API安全认证
  - 支持第三方登录（如微信、Google）
  - 提供无状态认证（适合移动App）
  - 实现单点登录（SSO）
  - 管理API访问权限

## 一、Passport (OAuth2)

  **是什么？**
  > - Laravel Passport是一个OAuth2服务器实现，让你的应用可以像微信、Google那样提供API授权服务。

  **有什么用？**
  - 为移动App提供认证支持
  - 实现第三方应用授权
  - 管理API访问令牌
  - 支持多种授权方式

  **怎么用？**

  1. **安装Passport**
  ```bash
  composer require laravel/passport
  ```

  2. **迁移数据库（创建Passport需要的数据表）**
  ```bash
  php artisan migrate
  ```

  3. **安装Passport**
  ```bash
  php artisan passport:install
  ```

  这个命令会生成加密密钥和客户端密钥（记录下这些值）

  4. **配置用户模型 `app/Models/User.php`**
  ```php
  use Laravel\Passport\HasApiTokens;

  class User extends Authenticatable
  {
      use HasApiTokens, HasFactory, Notifiable;
  }
  ```

  5. **配置Auth服务提供者 `app/Providers/AuthServiceProvider.php`**
  ```php
  public function boot()
  {
      $this->registerPolicies();
      Passport::routes(); // 注册Passport路由
      Passport::tokensExpireIn(now()->addDays(15)); // 设置令牌过期时间
  }
  ```

  6. **配置Auth驱动 `config/auth.php`**
  ```php
  'guards' => [
      'api' => [
          'driver' => 'passport',
          'provider' => 'users',
      ],
  ],
  ```

  7. **密码授权示例（适用于移动App）**
  ```http
  POST /oauth/token HTTP/1.1
  Host: your-app.com
  Content-Type: application/json

  {
      "grant_type": "password",
      "client_id": "your-client-id",
      "client_secret": "your-client-secret",
      "username": "user@example.com",
      "password": "password",
      "scope": ""
  }
  ```

  8. **使用令牌访问API**
  ```http
  GET /api/user HTTP/1.1
  Host: your-app.com
  Authorization: Bearer {access-token}
  ```

  9. **实际应用：创建API路由**
  ```php
  // routes/api.php
  Route::middleware('auth:api')->group(function () {
      Route::get('/user', function (Request $request) {
          return $request->user();
      });
      
      Route::get('/orders', 'OrderController@index');
  });
  ```

## 二、JWT集成

  **是什么？**
  > - **JWT（JSON Web Token）**是一种轻量级的认证方式，特别适合**API认证**，令牌中直接包含用户信息。

  **有什么用？**
  - 无状态认证（服务器不需要存储会话）
  - 适合移动App和前后端分离应用
  - 跨域认证支持
  - 自包含（令牌中携带用户信息）

  **怎么用？**
  这里使用`tymon/jwt-auth`包

  1. **安装JWT包**
  ```bash
  composer require tymon/jwt-auth
  ```

  2. **发布配置文件**
  ```bash
  php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\LaravelServiceProvider"
  ```

  3. **生成密钥**
  ```bash
  php artisan jwt:secret
  ```

  这将在`.env`文件中设置`JWT_SECRET`

  4. **配置Auth驱动 `config/auth.php`**
  ```php
  'guards' => [
      'api' => [
          'driver' => 'jwt',
          'provider' => 'users',
      ],
  ],
  ```

  5. **修改用户模型 `app/Models/User.php`**
  ```php
  use Tymon\JWTAuth\Contracts\JWTSubject;

  class User extends Authenticatable implements JWTSubject
  {
      // ...其他代码
      
      public function getJWTIdentifier()
      {
          return $this->getKey();
      }
      
      public function getJWTCustomClaims()
      {
          return [
              'role' => $this->role // 添加自定义声明
          ];
      }
  }
  ```

  6. **创建认证控制器**
  ```bash
  php artisan make:controller AuthController
  ```

  ```php
  // app/Http/Controllers/AuthController.php
  use Illuminate\Support\Facades\Auth;
  use App\Http\Controllers\Controller;

  class AuthController extends Controller
  {
      // 登录
      public function login(Request $request)
      {
          $credentials = $request->only('email', 'password');
          
          if (!$token = Auth::guard('api')->attempt($credentials)) {
              return response()->json(['error' => 'Unauthorized'], 401);
          }
          
          return $this->respondWithToken($token);
      }
      
      // 获取当前用户
      public function me()
      {
          return response()->json(Auth::guard('api')->user());
      }
      
      // 刷新令牌
      public function refresh()
      {
          return $this->respondWithToken(Auth::guard('api')->refresh());
      }
      
      // 退出
      public function logout()
      {
          Auth::guard('api')->logout();
          return response()->json(['message' => 'Successfully logged out']);
      }
      
      // 返回令牌结构
      protected function respondWithToken($token)
      {
          return response()->json([
              'access_token' => $token,
              'token_type' => 'bearer',
              'expires_in' => Auth::guard('api')->factory()->getTTL() * 60
          ]);
      }
  }
  ```

  7. **添加路由 `routes/api.php`**
  ```php
  Route::post('login', 'AuthController@login');
  Route::middleware('auth:api')->group(function () {
      Route::post('logout', 'AuthController@logout');
      Route::post('refresh', 'AuthController@refresh');
      Route::get('me', 'AuthController@me');
  });
  ```

  8. **使用令牌访问API**
  ```http
  GET /api/me HTTP/1.1
  Host: your-app.com
  Authorization: Bearer {jwt-token}
  ```
## 完整示例：社交登录（微信登录）

  1. **安装社交登录包**
  ```bash
  composer require laravel/socialite
  composer require socialiteproviders/weixin
  ```

  2. **配置服务提供者 `config/app.php`**
  ```php
  'providers' => [
      // ...
      SocialiteProviders\Manager\ServiceProvider::class,
  ];
  ```

  3. **添加事件监听器 `app/Providers/EventServiceProvider.php`**
  ```php
  protected $listen = [
      \SocialiteProviders\Manager\SocialiteWasCalled::class => [
          'SocialiteProviders\\Weixin\\WeixinExtendSocialite@handle',
      ],
  ];
  ```

  4. **配置微信登录 `.env`**
  ```env
  WEIXIN_KEY=your-weixin-app-id
  WEIXIN_SECRET=your-weixin-app-secret
  WEIXIN_REDIRECT_URI=https://your-app.com/auth/weixin/callback
  ```

  5. **创建控制器方法**
  ```php
  public function redirectToWeixin()
  {
      return Socialite::driver('weixin')->redirect();
  }

  public function handleWeixinCallback()
  {
      $weixinUser = Socialite::driver('weixin')->user();
      
      // 查找或创建用户
      $user = User::firstOrCreate(
          ['weixin_id' => $weixinUser->getId()],
          [
              'name' => $weixinUser->getName(),
              'email' => $weixinUser->getEmail() ?? $weixinUser->getId().'@weixin.com',
              'avatar' => $weixinUser->getAvatar()
          ]
      );
      
      // 登录用户
      Auth::login($user);
      
      // 生成JWT令牌
      $token = Auth::guard('api')->login($user);
      
      return response()->json([
          'token' => $token,
          'user' => $user
      ]);
  }
  ```

  6. **添加路由**
  ```php
  Route::get('/auth/weixin', 'AuthController@redirectToWeixin');
  Route::get('/auth/weixin/callback', 'AuthController@handleWeixinCallback');
  ```
## 常见问题解答

  **Q：`Passport`和`JWT`如何选择？**  
  A：

  - `Passport`：功能全面，适合需要**OAuth2**服务的应用（如提供API给第三方）
  - `JWT`：轻量级，适合自己的应用前后端分离认证

  **Q：令牌过期后怎么办？**  
  A：

  - `Passport`：使用刷新令牌获取新令牌
  - `JWT`：客户端需要重新登录获取新令牌

  **Q：如何保护API路由？**  
  A：使用`auth:api`中间件：

  ```php
  Route::get('/profile', function () {
      // 只有认证用户可以访问
  })->middleware('auth:api');
  ```

  **Q：如何自定义JWT声明？**  
  A：在用户模型中修改`getJWTCustomClaims`：

  ```php
  public function getJWTCustomClaims()
  {
      return [
          'role' => $this->role,
          'foo' => 'bar'
      ];
  }
  ```

  **Q：如何撤销令牌？**
  A：

  - `Passport`：使用`/oauth/tokens`管理令牌
  - `JWT`：由于无状态，需在服务端维护黑名单（JWT包已支持）

  **Q：本地开发如何测试？**  
  A：

  - 使用Postman测试API
  - 前端应用测试：

  ```javascript
  // 登录获取令牌
  fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({email: 'test@test.com', password: 'password'})
  })
  .then(response => response.json())
  .then(data => {
      localStorage.setItem('token', data.access_token);
  });

  // 访问受保护API
  fetch('/api/protected', {
      headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
  })
  ```
