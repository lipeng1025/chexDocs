# 测试
## 概念

  **什么是测试？**
  > - 测试就像代码的"健康检查"，通过模拟各种场景来验证你的应用是否按预期工作，就像汽车出厂前的质量检测一样。

  **有什么用？**
  - 确保代码正确运行
  - 提前发现潜在问题
  - 避免修改代码后引入新问题
  - 提高代码质量和可维护性
  - 增强开发信心和交付可靠性

## 一、HTTP测试

  **是什么？**
  > - HTTP测试就是模拟用户访问网站的行为（如点击链接、提交表单），然后验证页面响应是否符合预期。

  **有什么用？**
  - 测试路由和控制器
  - 验证页面内容
  - 检查表单提交结果
  - 确保重定向正确
  - 测试API接口

  **怎么用？**

  1. **创建测试类**
  ```bash
  php artisan make:test UserRegistrationTest
  ```

  2. **编写测试 `tests/Feature/UserRegistrationTest.php`**
  ```php
  class UserRegistrationTest extends TestCase
  {
      // 测试用户注册成功
      public function test_user_can_register()
      {
          $response = $this->post('/register', [
              'name' => 'Test User',
              'email' => 'test@example.com',
              'password' => 'password',
              'password_confirmation' => 'password',
          ]);
          
          // 验证重定向到仪表盘
          $response->assertRedirect('/dashboard');
          
          // 验证用户已创建
          $this->assertDatabaseHas('users', [
              'email' => 'test@example.com'
          ]);
          
          // 验证用户已登录
          $this->assertAuthenticated();
      }
      
      // 测试无效注册
      public function test_invalid_registration()
      {
          $response = $this->post('/register', [
              'name' => '',
              'email' => 'invalid-email',
              'password' => 'short',
              'password_confirmation' => 'mismatch',
          ]);
          
          // 验证返回错误信息
          $response->assertSessionHasErrors([
              'name', 'email', 'password'
          ]);
      }
      
      // 测试登录状态
      public function test_authenticated_user_can_access_dashboard()
      {
          $user = User::factory()->create();
          
          $response = $this->actingAs($user)
                          ->get('/dashboard');
          
          $response->assertStatus(200);
          $response->assertSee('Welcome, '.$user->name);
      }
  }
  ```

  3. **运行测试**
  ```bash
  php artisan test
  # 或运行单个测试
  php artisan test --filter test_user_can_register
  ```

  4. **常用断言方法**
  ```php
  $response->assertStatus(200); // 状态码
  $response->assertOk();        // 200 OK
  $response->assertRedirect('/home'); // 重定向
  $response->assertSee('Welcome');    // 页面包含文本
  $response->assertDontSee('Error');  // 页面不包含文本
  $response->assertJson(['success' => true]); // JSON响应
  $response->assertSessionHas('message'); // 会话包含数据
  ```

  5. **实际应用：API测试**
  ```php
  public function test_api_product_list()
  {
      // 创建测试数据
      $products = Product::factory()->count(5)->create();
      
      $response = $this->getJson('/api/products');
      
      $response->assertOk();
      $response->assertJsonCount(5, 'data');
      $response->assertJsonStructure([
          'data' => [
              '*' => ['id', 'name', 'price']
          ]
      ]);
  }
  ```

## 二、数据库测试

  **是什么？**
  > - 数据库测试专门验证数据库操作是否正确，确保数据的增删改查符合预期。

  **有什么用？**
  - 测试模型操作
  - 验证数据库状态
  - 检查数据关系
  - 确保数据完整性
  - 测试数据工厂

  **怎么用？**

  1. **使用数据库迁移和填充**
  ```php
  // 在测试类中
  use Illuminate\Foundation\Testing\RefreshDatabase;

  class ExampleTest extends TestCase
  {
      use RefreshDatabase; // 每次测试后重置数据库
  }
  ```

  2. **创建模型工厂 `database/factories/UserFactory.php`**
  ```php
  class UserFactory extends Factory
  {
      public function definition()
      {
          return [
              'name' => $this->faker->name(),
              'email' => $this->faker->unique()->safeEmail(),
              'password' => bcrypt('password'),
          ];
      }
      
      // 自定义状态
      public function admin()
      {
          return $this->state([
              'is_admin' => true,
          ]);
      }
  }
  ```

  3. **数据库测试示例**
  ```php
  public function test_user_creation()
  {
      // 创建单个用户
      $user = User::factory()->create();
      
      // 验证用户存在
      $this->assertModelExists($user);
      
      // 验证数据库记录
      $this->assertDatabaseHas('users', [
          'email' => $user->email,
          'is_admin' => false,
      ]);
  }

  public function test_user_deletion()
  {
      $user = User::factory()->create();
      
      $user->delete();
      
      // 验证用户已删除
      $this->assertModelMissing($user);
      $this->assertDatabaseMissing('users', [
          'id' => $user->id
      ]);
  }

  public function test_admin_user()
  {
      // 使用自定义状态
      $admin = User::factory()->admin()->create();
      
      $this->assertTrue($admin->is_admin);
  }

  public function test_user_has_orders()
  {
      // 创建用户及其关联订单
      $user = User::factory()
                ->has(Order::factory()->count(3))
                ->create();
      
      $this->assertCount(3, $user->orders);
      $this->assertInstanceOf(Order::class, $user->orders->first());
  }
  ```

  4. **实际应用：订单处理测试**
  ```php
  public function test_order_processing()
  {
      $user = User::factory()->create();
      $product = Product::factory()->create(['stock' => 10]);
      
      // 创建订单
      $order = Order::create([
          'user_id' => $user->id,
          'total' => $product->price * 2,
      ]);
      
      // 添加订单项
      $order->items()->create([
          'product_id' => $product->id,
          'quantity' => 2,
          'price' => $product->price,
      ]);
      
      // 处理订单
      $order->process();
      
      // 验证库存减少
      $this->assertEquals(8, $product->fresh()->stock);
      
      // 验证订单状态
      $this->assertEquals('processed', $order->fresh()->status);
      
      // 验证事件触发
      Event::assertDispatched(OrderProcessed::class);
  }
  ```

## 三、Mocking（模拟）

  **是什么？**
  > - Mocking就是创建"假"对象来替代真实依赖（如邮件发送、支付接口），让你能隔离测试特定代码。

  **有什么用？**
  - 测试外部服务（无需真实调用）
  - 模拟复杂依赖
  - 加速测试执行
  - 测试异常场景
  - 验证方法调用

  **怎么用？**

  1. **模拟邮件发送**
  ```php
  public function test_welcome_email_sent()
  {
      // 模拟Mail门面
      Mail::fake();
      
      // 创建用户（会触发欢迎邮件）
      $user = User::factory()->create();
      
      // 断言邮件已发送
      Mail::assertSent(WelcomeEmail::class, function ($mail) use ($user) {
          return $mail->user->id === $user->id;
      });
      
      // 断言邮件未发送
      Mail::assertNotSent(AdminNotification::class);
  }
  ```

  2. **模拟事件**
  ```php
  public function test_order_created_event()
  {
      Event::fake();
      
      $order = Order::factory()->create();
      
      // 断言事件已分发
      Event::assertDispatched(OrderCreated::class, function ($event) use ($order) {
          return $event->order->id === $order->id;
      });
      
      // 断言事件未分发
      Event::assertNotDispatched(OrderCancelled::class);
  }
  ```

  3. **模拟HTTP请求**
  ```php
  public function test_external_api_call()
  {
      // 模拟HTTP客户端
      Http::fake([
          'api.weather.com/*' => Http::response([
              'temperature' => 25,
              'condition' => 'sunny'
          ], 200),
      ]);
      
      // 调用依赖外部API的服务
      $weather = WeatherService::getCurrent('Shanghai');
      
      // 验证响应
      $this->assertEquals(25, $weather['temperature']);
      
      // 验证请求
      Http::assertSent(function ($request) {
          return $request->url() === 'https://api.weather.com/shanghai' &&
                $request['units'] === 'metric';
      });
  }
  ```

  4. **模拟类方法**
  ```php
  public function test_payment_processing()
  {
      // 创建模拟支付服务
      $paymentMock = Mockery::mock(PaymentGateway::class);
      $paymentMock->shouldReceive('charge')
                  ->with(100, 'tok_visa')
                  ->andReturn(['success' => true, 'id' => 'ch_123']);
      
      // 绑定到容器
      $this->app->instance(PaymentGateway::class, $paymentMock);
      
      // 测试支付逻辑
      $order = Order::factory()->create(['total' => 100]);
      $result = $order->charge('tok_visa');
      
      $this->assertTrue($result['success']);
      $this->assertEquals('ch_123', $order->fresh()->transaction_id);
  }
  ```

  5. **实际应用：支付回调测试**
  ```php
  public function test_payment_webhook()
  {
      // 模拟支付网关
      $gatewayMock = $this->mock(PaymentGateway::class);
      $gatewayMock->shouldReceive('verifySignature')
                  ->andReturn(true);
      
      // 模拟HTTP请求
      $response = $this->post('/webhook/payment', [
          'event' => 'payment.succeeded',
          'data' => ['id' => 'txn_123', 'amount' => 10000]
      ]);
      
      $response->assertStatus(200);
      
      // 验证订单状态更新
      $this->assertDatabaseHas('orders', [
          'transaction_id' => 'txn_123',
          'status' => 'paid'
      ]);
  }
  ```
## 完整测试示例：用户注册流程

  1. **创建测试**
  ```bash
  php artisan make:test UserRegistrationTest
  ```

  2. **编写完整测试 `tests/Feature/UserRegistrationTest.php`**
  ```php
  class UserRegistrationTest extends TestCase
  {
      use RefreshDatabase;
      
      public function test_user_registration_flow()
      {
          // 模拟邮件发送
          Mail::fake();
          Notification::fake();
          
          // 访问注册页面
          $response = $this->get('/register');
          $response->assertOk();
          $response->assertSee('Register');
          
          // 提交注册表单
          $response = $this->post('/register', [
              'name' => 'John Doe',
              'email' => 'john@example.com',
              'password' => 'Password123!',
              'password_confirmation' => 'Password123!',
          ]);
          
          // 验证重定向
          $response->assertRedirect('/dashboard');
          
          // 验证用户创建
          $this->assertDatabaseCount('users', 1);
          $user = User::first();
          $this->assertEquals('John Doe', $user->name);
          
          // 验证登录状态
          $this->assertAuthenticatedAs($user);
          
          // 验证欢迎邮件已发送
          Mail::assertSent(WelcomeEmail::class, function ($mail) use ($user) {
              return $mail->user->id === $user->id;
          });
          
          // 验证通知已发送
          Notification::assertSentTo(
              $user,
              VerifyEmail::class
          );
          
          // 验证仪表盘访问
          $dashboard = $this->get('/dashboard');
          $dashboard->assertSee('Welcome, John');
          
          // 验证未验证用户不能访问敏感页面
          $this->post('/logout');
          $sensitivePage = $this->actingAs($user)->get('/billing');
          $sensitivePage->assertRedirect('/email/verify');
      }
      
      public function test_invalid_registration_attempts()
      {
          // 测试短密码
          $response = $this->post('/register', [
              'name' => 'John',
              'email' => 'john@example.com',
              'password' => 'short',
              'password_confirmation' => 'short',
          ]);
          $response->assertSessionHasErrors('password');
          
          // 测试邮箱已存在
          User::factory()->create(['email' => 'john@example.com']);
          $response = $this->post('/register', [
              'name' => 'John',
              'email' => 'john@example.com',
              'password' => 'Password123!',
              'password_confirmation' => 'Password123!',
          ]);
          $response->assertSessionHasErrors('email');
      }
  }
  ```

  3. **运行测试**
  ```bash
  php artisan test tests/Feature/UserRegistrationTest.php
  ```
## 测试最佳实践

  1. **测试金字塔**
  
  | 数量 | 测试类型       | 示例                     |
  |------|----------------|--------------------------|
  | 最多 | Unit Tests     | 测试模型方法、工具类     |
  | 中等 | Feature Tests  | 测试用户注册流程         |
  | 最少 | Browser Tests  | 测试完整用户交互         |
  

  2. **测试命名规范**
  ```php
  // 测试方法名应该描述行为
  public function test_user_can_update_profile() {}
  public function test_admin_can_delete_users() {}
  public function test_guest_cannot_access_dashboard() {}
  ```

  3. **测试数据准备**
  ```php
  // 使用工厂创建必要数据
  $user = User::factory()->create();

  // 使用状态创建特殊数据
  $admin = User::factory()->admin()->create();

  // 使用序列创建关联数据
  $post = Post::factory()
              ->has(Comment::factory()->count(3))
              ->create();
  ```

  4. **测试覆盖率**
  ```bash
  # 生成测试覆盖率报告
  php artisan test --coverage

  # 最低覆盖率要求
  php artisan test --coverage --min=80
  ```

  5. **持续集成配置示例 `.github/workflows/tests.yml`**
  ```yaml
  name: Run Tests

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
          run: cp .env.example .env && php artisan key:generate
          
        - name: Create Database
          run: |
            touch database/database.sqlite
            php artisan migrate --database=sqlite --force
            
        - name: Run Tests
          run: php artisan test --coverage --min=70
  ```
## 常见问题解答

  **Q：如何测试需要认证的路由？**  
  A：使用actingAs方法：

  ```php
  $user = User::factory()->create();
  $response = $this->actingAs($user)
                  ->get('/profile');
  ```

  **Q：如何测试文件上传？**  
  A：

  ```php
  $file = UploadedFile::fake()->image('avatar.jpg');
  $response = $this->post('/profile', [
      'avatar' => $file,
  ]);
  ```

  **Q：如何测试队列任务？**  
  A：使用Queue::fake()：

  ```php
  Queue::fake();

  // 执行应触发队列的操作

  Queue::assertPushed(SendEmail::class);
  ```

  **Q：如何测试定时任务？**  
  A：使用时间旅行：

  ```php
  // 设置当前时间
  $this->travelTo(now()->addDay());

  // 执行定时任务
  $this->artisan('schedule:run');

  // 断言任务执行结果
  ```

  **Q：如何测试异常？**  
  A：

  ```php
  $this->expectException(InvalidOrderException::class);
  $this->expectExceptionMessage('Order is already paid');

  // 执行应抛出异常的代码
  $order->charge();
  ```

  **Q：如何加速数据库测试？**  
  A：

  - 使用SQLite内存数据库

  ```env
  DB_CONNECTION=sqlite
  DB_DATABASE=:memory:
  ```

  - 避免不必要的迁移

  ```php
  protected function setUp(): void
  {
      parent::setUp();
      $this->seed(OnlyNecessarySeeder::class);
  }
  ```

  **Q：如何测试Blade组件？**  
  A：

  ```php
  public function test_alert_component()
  {
      $view = $this->blade(
          '<x-alert type="error">Message</x-alert>'
      );
      
      $view->assertSee('Message')
          ->assertSee('alert-error');
  }
  ```

