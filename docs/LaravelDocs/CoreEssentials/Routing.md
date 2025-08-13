# 路由

## 一、路由定义

  **是什么？**
  > - 定义用户访问的URL地址和对应的处理逻辑

  **有什么用？**
  - 决定哪个URL执行什么代码
  - 连接用户请求和控制器方法
  - 构建RESTful API的基础

  **怎么用？**

  **基本路由定义 (`routes/web.php`)**:

  ```php
  // GET请求
  Route::get('/hello', function () {
      return '你好，世界！';
  });

  // POST请求（表单提交）
  Route::post('/contact', function () {
      // 处理联系表单
  });

  // 匹配多种请求类型
  Route::match(['get', 'post'], '/profile', function () {
      // 显示或更新用户资料
  });

  // 匹配所有请求类型
  Route::any('/catch-all', function () {
      // 处理所有类型的请求
  });
  ```

  **控制器路由**：

  ```php
  // 单个方法
  Route::get('/products', [ProductController::class, 'index']);

  // 资源控制器（自动生成CRUD路由）
  Route::resource('products', ProductController::class);
  ```

## 二、路由参数

  **是什么？**
  - 从URL中获取动态值，如用户ID、产品名称等

  **有什么用？**
  - 创建动态URL
  - 获取用户输入
  - 实现个性化页面

  **怎么用？**

  **基本参数**：

  ```php
  // 必选参数
  Route::get('/user/{id}', function ($id) {
      return "用户ID: ".$id;
  });

  // 可选参数（带默认值）
  Route::get('/user/{name?}', function ($name = '游客') {
      return "你好, ".$name;
  });

  // 多个参数
  Route::get('/post/{post}/comment/{comment}', function ($postId, $commentId) {
      return "文章{$postId}的评论{$commentId}";
  });
  ```

  **参数约束**：

  ```php
  // 数字约束
  Route::get('/user/{id}', function ($id) {
      // ...
  })->where('id', '[0-9]+');

  // 字母约束
  Route::get('/category/{name}', function ($name) {
      // ...
  })->where('name', '[A-Za-z]+');

  // 多条件约束
  Route::get('/product/{id}/{slug}', function ($id, $slug) {
      // ...
  })->where(['id' => '[0-9]+', 'slug' => '[A-Za-z-]+']);
  ```

## 三、命名路由

  **是什么？**
  > - 给路由起个别名，方便在代码中引用

  **有什么用？**
  - 避免硬编码URL
  - 简化URL修改
  - 方便重定向和链接生成

  **怎么用？**

  **定义命名路由**：

  ```php
  Route::get('/user/profile', function () {
      // ...
  })->name('profile');

  Route::get('/products/{id}', [ProductController::class, 'show'])->name('products.show');
  ```

  **使用命名路由**：

  ```php
  // 生成URL
  $url = route('profile');

  // 带参数
  $url = route('products.show', ['id' => 123]);

  // 在控制器中重定向
  return redirect()->route('profile');

  // 在Blade模板中生成链接
  <a href="{{ route('products.show', ['id' => $product->id]) }}">
      {{ $product->name }}
  </a>
  ```

## 四、路由组

  **是什么？**
  > - 把多个路由打包成一个组，共享公共配置

  **有什么用？**
  - 减少重复代码
  - 统一添加中间件
  - 简化路由管理

  **怎么用？**

  **共享中间件**：

  ```php
  // 需要登录的页面
  Route::middleware(['auth'])->group(function () {
      Route::get('/dashboard', function () {
          // 仪表盘
      });
      
      Route::get('/account', function () {
          // 账户设置
      });
  });
  ```

  **共享前缀**：

  ```php
  // API路由组
  Route::prefix('api')->group(function () {
      Route::get('/users', function () {
          // 获取用户列表
      });
      
      Route::get('/products', function () {
          // 获取产品列表
      });
  });
  ```

  **共享命名空间**：

  ```php
  // 管理后台路由
  Route::namespace('Admin')->group(function () {
      // 对应 App\Http\Controllers\Admin\UserController
      Route::get('/admin/users', 'UserController@index');
  });
  ```

  **组合使用**：

  ```php
  Route::prefix('admin')->middleware('auth')->namespace('Admin')->group(function () {
      Route::get('/dashboard', 'DashboardController@index');
      Route::resource('users', 'UserController');
  });
  ```

## 五、路由模型绑定

  **是什么？**
  > - 自动将URL参数转换为Eloquent模型实例

  **有什么用？**
  - 简化数据库查询
  - 自动处理模型查找
  - 减少重复代码

  **怎么用？**

  **隐式绑定（自动绑定）**：

  ```php
  // 路由定义
  Route::get('/products/{product}', [ProductController::class, 'show']);

  // 控制器方法
  public function show(Product $product)
  {
      // $product 会自动注入模型实例
      return view('products.show', compact('product'));
  }
  ```

  **自定义键名**：

  ```php
  // 使用slug代替ID
  Route::get('/products/{product:slug}', [ProductController::class, 'show']);

  // 在模型中指定
  class Product extends Model
  {
      public function getRouteKeyName()
      {
          return 'slug';
      }
  }
  ```

  **显式绑定（自定义解析逻辑）**：

  ```php
  // 在RouteServiceProvider中注册
  public function boot()
  {
      parent::boot();
      
      // 自定义解析逻辑
      Route::bind('product', function ($value) {
          return Product::where('slug', $value)->firstOrFail();
      });
  }
  ```

  **自定义缺失行为**：

  ```php
  Route::get('/products/{product}', function (Product $product) {
      // ...
  })->missing(function () {
      return redirect('/products')->with('error', '产品未找到');
  });
  ```
## 实际案例：博客系统路由

  路由文件 (`routes/web.php`)
  ```php
  // 首页
  Route::get('/', [HomeController::class, 'index'])->name('home');

  // 文章路由组
  Route::prefix('articles')->name('articles.')->group(function () {
      Route::get('/', [ArticleController::class, 'index'])->name('index');
      Route::get('/create', [ArticleController::class, 'create'])->name('create');
      Route::post('/', [ArticleController::class, 'store'])->name('store');
      Route::get('/{article:slug}', [ArticleController::class, 'show'])->name('show');
      Route::get('/{article}/edit', [ArticleController::class, 'edit'])->name('edit');
      Route::put('/{article}', [ArticleController::class, 'update'])->name('update');
      Route::delete('/{article}', [ArticleController::class, 'destroy'])->name('destroy');
  });

  // 评论路由（需要登录）
  Route::middleware('auth')->group(function () {
      Route::post('/articles/{article}/comments', [CommentController::class, 'store'])
          ->name('comments.store');
  });

  // 用户认证路由（Laravel Breeze自动生成）
  require __DIR__.'/auth.php';
  ```

  控制器方法示例
  ```php
  class ArticleController extends Controller
  {
      public function show(Article $article)
      {
          // 自动通过slug查找文章
          return view('articles.show', compact('article'));
      }
  }
  ```
## 最佳实践

  1.**路由命名规范**：

  ```php
  // 使用 资源.操作 格式
  Route::get('/products', [ProductController::class, 'index'])->name('products.index');
  Route::get('/products/create', [ProductController::class, 'create'])->name('products.create');
  Route::post('/products', [ProductController::class, 'store'])->name('products.store');
  ```

  2.**路由缓存（生产环境）**：

  ```bash
  # 生成路由缓存
  php artisan route:cache

  # 清除缓存
  php artisan route:clear
  ```

  3.**API路由分离**：

  创建单独的API路由文件 `routes/api.php`：

  ```php
  Route::prefix('v1')->group(function () {
      Route::apiResource('products', ProductController::class);
  });
  ```

  访问路径：`/api/v1/products`

  4.**路由模型绑定优化**：

  ```php
  // 减少SQL查询
  Route::get('/articles/{article}', function (Article $article) {
      // 默认只加载文章
  });

  Route::get('/articles/{article}', function (Article $article) {
      // 预加载评论
      $article->load('comments');
  });
  ```
## 常见问题

  ❓ **Q：路由定义顺序重要吗？**  
  → 非常重要！Laravel按顺序匹配路由，把具体路由放前面：

  ```php
  // 错误顺序 ❌
  Route::get('/user/{id}', ...);
  Route::get('/user/create', ...); // 永远匹配不到

  // 正确顺序 ✅
  Route::get('/user/create', ...);
  Route::get('/user/{id}', ...);
  ```

  ❓ **Q：如何查看所有路由？**  
  → 使用Artisan命令：

  ```bash
  php artisan route:list

  # 输出示例
  +--------+----------+-----------------+------+---------+--------------+
  | Method | URI      | Name            | Action | Middleware |
  +--------+----------+-----------------+------+---------+--------------+
  | GET    | /        | home            | ...   | web      |
  | GET    | /articles| articles.index  | ...   | web      |
  | POST   | /articles| articles.store  | ...   | web,auth |
  +--------+----------+-----------------+------+---------+--------------+
  ```

  ❓ **Q：路由模型绑定找不到记录怎么办？**  
  → 默认返回404，可自定义：

  ```php
  // 在App\Providers\RouteServiceProvider
  public function boot()
  {
      parent::boot();
      
      Route::bind('article', function ($value) {
          return Article::where('slug', $value)->firstOrFail();
      });
  }
  ```

  ❓ **Q：API路由和Web路由有什么区别？**  
  →

  1. API路由文件：`routes/api.php`
  2. 默认前缀：`/api`
  3. 无CSRF保护
  4. 默认返回JSON
  5. 使用api中间件组

