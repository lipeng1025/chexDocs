# 服务容器与DI

## 一、容器概念

  **是什么？**
  > - Laravel的服务容器就像一个"智能工具箱"，能自动创建和管理你需要的对象。

  **有什么用？**

  - 自动解决类依赖关系
  - 统一管理对象创建
  - 实现依赖解耦（类之间不直接依赖）

  **简单比喻**

  想象一个自动售货机：

  - 你需要饮料（类实例）
  - 投币（请求）
  - 机器（容器）自动制作并给你饮料
  - 你不需要知道怎么做饮料

  **基本使用**
  ```php
  // 告诉容器：有人要Coffee时，给这个牌子的
  app()->bind('Coffee', function () {
      return new StarbucksCoffee();
  });

  // 获取咖啡
  $coffee = app()->make('Coffee');
  $coffee->drink(); // 喝星巴克咖啡
  ```

## 二、依赖注入

  **是什么？**
  > - 让容器自动把依赖的"工具"送到你手里，而不是自己去找。

  **有什么用？**
  - 减少手动创建对象的麻烦
  - 方便替换实现（比如测试时用模拟对象）
  - 代码更简洁、可测试

  **怎么用？**

  方法1：构造函数注入
  ```php
  class CoffeeMaker
  {
      protected $coffeeBean;
      
      // 容器会自动注入需要的对象
      public function __construct(CoffeeBean $bean)
      {
          $this->coffeeBean = $bean;
      }
      
      public function make()
      {
          return $this->coffeeBean->grind()->brew();
      }
  }

  // 使用（不需要手动创建CoffeeBean）
  $maker = app()->make(CoffeeMaker::class);
  $coffee = $maker->make();
  ```

  方法2：方法注入
  ```php
  class OrderController
  {
      // 在方法中声明依赖
      public function placeOrder(Request $request, PaymentGateway $gateway)
      {
          $gateway->charge($request->amount);
          return "支付成功！";
      }
  }
  ```

  方法3：接口绑定
  ```php
  // 在服务提供者中注册
  app()->bind(PaymentGateway::class, StripeGateway::class);

  // 使用时会自动注入StripeGateway
  public function pay(PaymentGateway $gateway)
  {
      $gateway->process();
  }
  ```

## 三、服务提供者

  **是什么？**
  > - 服务提供者是容器的"配置说明书"，告诉容器如何创建各种服务。

  **有什么用？**
  - 统一管理服务注册
  - 启动时执行初始化代码
  - 延迟加载节省资源

  **怎么用？**

  创建提供者
  ```bash
  php artisan make:provider CoffeeServiceProvider
  ```

  编写提供者

  `app/Providers/CoffeeServiceProvider.php`:

  ```php
  namespace App\Providers;

  use Illuminate\Support\ServiceProvider;
  use App\Services\CoffeeMaker;
  use App\Services\ArabicaBean;

  class CoffeeServiceProvider extends ServiceProvider
  {
      // 注册绑定
      public function register()
      {
          // 简单绑定
          $this->app->bind('coffee.maker', function () {
              return new CoffeeMaker();
          });
          
          // 单例绑定（全局只创建一个实例）
          $this->app->singleton('premium.bean', function () {
              return new ArabicaBean();
          });
          
          // 接口绑定实现
          $this->app->bind(
              \App\Contracts\PaymentGateway::class,
              \App\Services\StripeGateway::class
          );
      }
      
      // 所有服务注册后执行
      public function boot()
      {
          // 初始化操作
          view()->share('coffeeTypes', ['Latte', 'Cappuccino', 'Espresso']);
      }
  }
  ```

  注册提供者

  在`config/app.php`中添加：

  ```php
  'providers' => [
      // 其他提供者...
      App\Providers\CoffeeServiceProvider::class,
  ],
  ```

## 实际案例：邮件服务

  步骤1：创建邮件服务

  `app/Services/OrderMailer.php`:

  ```php
  namespace App\Services;

  class OrderMailer
  {
      protected $mailer;
      
      public function __construct(\Illuminate\Mail\Mailer $mailer)
      {
          $this->mailer = $mailer;
      }
      
      public function sendConfirmation($order)
      {
          $this->mailer->send('emails.confirm', ['order' => $order], function ($message) use ($order) {
              $message->to($order->email)->subject('订单确认');
          });
      }
  }
  ```

  步骤2：绑定服务

  在服务提供者中注册：

  ```php
  public function register()
  {
      $this->app->bind('order.mailer', function ($app) {
          return new OrderMailer($app->make('mailer'));
      });
  }
  ```

  步骤3：使用服务

  ```php
  use App\Services\OrderMailer;

  class OrderController
  {
      public function complete(Request $request, OrderMailer $mailer)
      {
          $order = Order::create($request->all());
          $mailer->sendConfirmation($order);
          return "订单完成！";
      }
  }
  ```
## 最佳实践

  1.**依赖注入原则**：

  - 高层模块不依赖低层模块，两者都依赖抽象
  - 抽象不依赖细节，细节依赖抽象

  2.**服务提供者使用场景**：

  - 注册绑定
  - 数据库连接
  - 视图共享数据
  - 添加中间件

  3.**容器使用技巧**：

  ```php
  // 检查是否绑定
  if (app()->bound('coffee.maker')) {
      // 服务已注册
  }

  // 解析带参数的服务
  app()->makeWith(CoffeeMaker::class, ['bean' => 'Arabica']);

  // 单例别名
  app()->singleton('logger', function () {
      return new Logger();
  });
  ```

  4.**延迟提供者**：

  当服务很少使用时，可以延迟加载：

  ```php
  protected $defer = true; // 声明延迟加载

  public function provides()
  {
      return ['order.mailer'];
  }
  ```
## 常见问题
  ❓ Q：什么时候需要手动创建对象？  
  → 当对象不需要容器管理时（如简单的DTO对象）：  

  ```php
  $user = new User(); // 不需要容器
  ```

  ❓ Q：如何解决循环依赖？  
  → 重构代码避免循环，或使用回调：  

  ```php
  app()->bind('A', function ($app) {
      return new A($app->make('B'));
  });

  app()->bind('B', function ($app) {
      return new B($app->make('A')); // ❌ 循环依赖
  });

  // 解决方案：回调延迟加载
  app()->bind('B', function ($app) {
      return new B(function () use ($app) {
          return $app->make('A');
      });
  });
  ```

  ❓ Q：测试时如何替换实现？  
  → 使用容器绑定模拟对象：  

  ```php
  // 测试用例中
  public function testOrderProcess()
  {
      // 创建模拟对象
      $mockMailer = Mockery::mock(OrderMailer::class);
      $mockMailer->shouldReceive('sendConfirmation')->once();
      
      // 绑定到容器
      $this->app->instance(OrderMailer::class, $mockMailer);
      
      // 执行测试
      $response = $this->post('/order', [...]);
      $response->assertOk();
  }
  ```

  ❓ Q：服务提供者的register和boot方法有什么区别？  
  →

  - `register()`：只做绑定注册，不要调用其他服务
  - `boot()`：所有服务注册完成后执行，可以使用其他服务

  ```php
  public function register()
  {
      // 只做绑定
      $this->app->bind(...);
  }

  public function boot()
  {
      // 可以使用其他服务
      $router = $this->app->make('router');
      $router->pushMiddleware(...);
  }
  ```
