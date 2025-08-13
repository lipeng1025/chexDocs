# 控制器

## 一、 控制器创建

  **是什么？**
  > - 控制器是处理用户请求的"交通警察"，决定哪个请求执行什么操作。

  **有什么用？**
  - 组织业务逻辑
  - 分离路由和业务代码
  - 处理HTTP请求并返回响应

  **怎么创建？**

  **Artisan命令创建**：

  ```bash
  # 创建基本控制器
  php artisan make:controller UserController

  # 创建带方法的控制器
  php artisan make:controller ProductController --resource
  ```

  **生成的文件 (`app/Http/Controllers/ProductController.php`)**:

  ```php
  namespace App\Http\Controllers;

  use Illuminate\Http\Request;

  class ProductController extends Controller
  {
      // 这里添加你的方法
  }
  ```

  **基本控制器示例**：

  ```php
  class UserController extends Controller
  {
      public function index()
      {
          return "用户列表";
      }
      
      public function show($id)
      {
          return "用户ID: ".$id;
      }
  }
  ```

  **路由绑定**：

  ```php
  // routes/web.php
  Route::get('/users', [UserController::class, 'index']);
  Route::get('/users/{id}', [UserController::class, 'show']);
  ```
## 二、 资源控制器

  **是什么？**
  > - 预定义好RESTful操作的控制器，处理资源的CRUD操作。

  **有什么用？**
  - 快速实现标准资源操作
  - 统一路由和方法命名
  - 减少重复代码

  **7个标准方法**：
  |  **方法**  |  **路径**  |  **用途**  |  **示例路由**  |
  |  ---  |  ---  |  ---  |  ---  |
  |  index()  |  GET /photos  |  显示所有资源  |  /products  |
  |  create()  |  GET /photos/create  |  显示创建表单  |  /products/create  |
  |  store()  |  POST /photos  |  保存新资源  |  /products  |
  |  show()  |  GET /photos/{id}  |  显示单个资源  |  /products/1  |
  |  edit()  |  GET /photos/{id}/edit  |  显示编辑表单  |  /products/1/edit  |
  |  update()  |  PUT/PATCH /photos/{id}  |  更新资源  |  /products/1  |
  |  destroy()  |  DELETE /photos/{id}  |  删除资源  |  /products/1  |

  **怎么用？**

  **创建资源控制器**：

  ```bash
  php artisan make:controller ProductController --resource
  ```

  **控制器内容**：

  ```php
  class ProductController extends Controller
  {
      public function index()
      {
          // 获取所有产品
          $products = Product::all();
          return view('products.index', compact('products'));
      }
      
      public function create()
      {
          // 显示创建表单
          return view('products.create');
      }
      
      public function store(Request $request)
      {
          // 验证并保存数据
          $validated = $request->validate([
              'name' => 'required|max:> - 55',
              'price' => 'required|numeric'
          ]);
          
          Product::create($validated);
          
          return redirect()->route('products.index');
      }
      
      // 其他方法...
  }
  ```

  **路由绑定**：

  ```php
  // 单个资源路由
  Route::resource('products', ProductController::class);

  // 多个资源路由
  Route::resources([
      'products' => ProductController::class,
      'users' => UserController::class
  ]);

  // 排除某些方法
  Route::resource('products', ProductController::class)->except(['create', 'edit']);
  ```
## 三、 依赖注入

  **是什么？**
  > - 让Laravel自动把需要的服务"送"到控制器里。

  **有什么用？**
  - 自动解决依赖关系
  - 方便测试（可注入模拟对象）
  - 代码更简洁

  **怎么用？**

  **构造函数注入**：

  ```php
  use App\Services\PaymentGateway;

  class OrderController extends Controller
  {
      protected $payment;
      
      public function __construct(PaymentGateway $payment)
      {
          $this->payment = $payment;
      }
      
      public function checkout()
      {
          $this->payment->process();
          return "支付成功";
      }
  }
  ```

  **方法注入**：

  ```php
  use Illuminate\Http\Request;
  use App\Models\Order;

  class OrderController extends Controller
  {
      public function store(Request $request)
      {
          // 直接使用$request对象
          $order = Order::create($request->all());
          return response()->json($order);
      }
  }
  ```

  **接口绑定注入**：

  ```php
  // 在服务提供者中绑定
  app()->bind(
      \App\Contracts\PaymentGateway::class,
      \App\Services\StripeGateway::class
  );

  // 控制器中使用
  class PaymentController extends Controller
  {
      public function pay(\App\Contracts\PaymentGateway $gateway)
      {
          $gateway->charge(**00);
          return "支付完成";
      }
  }
  ```
## 四、 单动作控制器

  **是什么？**
  > - 只有一个__invoke方法的控制器，处理单一操作。

  **有什么用？**
  - 处理简单任务
  - 减少控制器文件数量
  - 路由更简洁

  **怎么用？**

  **创建单动作控制器**：

  ```bash
  php artisan make:controller HomeController --invokable
  ```

  **控制器内容**：

  ```php
  class HomeController extends Controller
  {
      public function __invoke()
      {
          // 首页逻辑
          $featuredProducts = Product::where('featured', true)->get();
          return view('home', compact('featuredProducts'));
      }
  }
  ```

  **路由绑定**：

  ```php
  // 不需要指定方法名
  Route::get('/', HomeController::class);

  // 等同于
  Route::get('/', [HomeController::class, '__invoke']);
  ```

  **实际应用场景**：

  ```php
  // 联系表单提交
  php artisan make:controller ContactController --invokable

  // 控制器
  class ContactController extends Controller
  {
      public function __invoke(Request $request)
      {
          $request->validate(['email' => 'required|email']);
          
          // 发送邮件
          Mail::to($request->email)->send(new ContactFormSubmitted());
          
          return back()->with('success', '消息已发送！');
      }
  }

  // 路由
  Route::post('/contact', ContactController::class)->name('contact.submit');
  ```
## 实际案例：用户管理系统

  **控制器 (`app/Http/Controllers/UserController.php`)**
  ```php
  namespace App\Http\Controllers;

  use App\Models\User;
  use Illuminate\Http\Request;

  class UserController extends Controller
  {
      // 显示用户列表
      public function index()
      {
          $users = User::paginate(**0);
          return view('users.index', compact('users'));
      }

      // 显示创建表单
      public function create()
      {
          return view('users.create');
      }

      // 保存新用户
      public function store(Request $request)
      {
          $validated = $request->validate([
              'name' => 'required|max:> - 55',
              'email' => 'required|email|unique:users',
              'password' => 'required|min:8'
          ]);
          
          $validated['password'] = bcrypt($validated['password']);
          
          User::create($validated);
          
          return redirect()->route('users.index')->with('success', '用户创建成功');
      }

      // 显示用户详情
      public function show(User $user)
      {
          return view('users.show', compact('user'));
      }

      // 删除用户
      public function destroy(User $user)
      {
          $user->delete();
          return back()->with('success', '用户已删除');
      }
  }
  ```

  **路由 (`routes/web.php`)**
  ```php
  // 资源路由
  Route::resource('users', UserController::class)->except(['edit', 'update']);

  // 单动作控制器（用户统计）
  Route::get('/stats', UserStatsController::class);
  ```
## 最佳实践

  **瘦控制器原则**：

  ```php
  // 不推荐 ❌（业务逻辑在控制器）
  class OrderController extends Controller
  {
      public function store(Request $request)
      {
          // 验证
          // 计算价格
          // 创建订单
          // 扣减库存
          // 发送邮件
          // ...
      }
  }

  // 推荐 ✅（使用服务类）
  class OrderController extends Controller
  {
      public function store(OrderRequest $request, OrderService $service)
      {
          $service->createOrder($request->validated());
          return redirect()->route('orders.index');
      }
  }
  ```

  **路由缓存（生产环境）**：

  ```bash
  # 生成路由缓存
  php artisan route:cache

  # 清除缓存
  php artisan route:clear
  ```

  **方法类型提示**：

  ```php
  // 使用模型绑定
  public function show(Product $product)
  {
      // 自动注入$product实例
  }

  // 使用Form Request验证
  public function update(ProductRequest $request, Product $product)
  {
      $product->update($request->validated());
  }
  ```

  **单动作控制器命名规范**：

  ```bash
  # 统一使用Action后缀
  php artisan make:controller ProcessPaymentAction --invokable
  ```
## 常见问题
  ❓ **Q：控制器应该放在哪里？**  
  → 默认在 app/Http/Controllers，可以创建子目录：

  ```bash
  # 创建后台控制器
  php artisan make:controller Admin/UserController
  ```

  ❓ **Q：如何调用其他控制器方法？**  
  → 不推荐直接调用，应该：

  - 提取公共逻辑到Service类
  - 使用Trait共享代码
  - 通过路由重定向

  ❓ **Q：资源控制器可以自定义方法吗？**  
  → 可以，但需要添加额外路由：

  ```php
  // 控制器中添加新方法
  public function search(Request $request)
  {
      // 搜索逻辑
  }

  // 路由中注册
  Route::resource('products', ProductController::class);
  Route::get('/products/search', [ProductController::class, 'search']);
  ```

  ❓ **Q：单动作控制器能接受参数吗？**  
  → 可以，通过路由参数传递：

  ```php
  // 控制器
  public function __invoke($category)
  {
      // 使用$category
  }

  // 路由
  Route::get('/category/{category}', CategoryController::class);
  ```
