# 事件系统
## 概念

  **什么是事件系统？**
  > - 事件系统就像学校的广播通知：当某个事情发生时（如上课铃响），系统会"广播"这个消息，然后所有关心这个事件的"听众"（如老师和学生）就会自动做出反应。

  **有什么用？**

  - **解耦代码**：不同模块互不干扰
  - **响应式编程**：事件发生自动触发操作
  - **扩展性强**：轻松添加新功能
  - **异步处理**：耗时操作后台运行

## 一、事件分发

  **是什么？**
  > - 事件分发就是当某个动作发生时（如用户注册），系统发出通知告诉其他部分："这事发生了！"

  **有什么用？**
  - 通知系统特定事件已发生
  - 触发后续处理流程
  - 核心业务与辅助逻辑分离

  **怎么用？**

  1. **创建事件类**
  ```bash
  php artisan make:event UserRegistered
  ```

  2. **编辑事件类 `app/Events/UserRegistered.php`**
  ```php
  class UserRegistered
  {
      use Dispatchable;
      
      public $user; // 事件携带的数据

      public function __construct(User $user)
      {
          $this->user = $user;
      }
  }
  ```

  3. **在业务代码中触发事件**
  ```php
  use App\Events\UserRegistered;

  public function register(Request $request)
  {
      // 创建用户
      $user = User::create($request->all());
      
      // 分发事件
      event(new UserRegistered($user));
      
      return redirect('/dashboard');
  }
  ```

  4. **实际应用：订单创建后触发**
  ```php
  // 创建订单时触发事件
  public function createOrder(Request $request)
  {
      $order = Order::create($request->validated());
      
      // 分发订单创建事件
      event(new OrderCreated($order));
      
      return response()->json($order);
  }
  ```

## 二、监听器

  **是什么？**
  > - 监听器就像事件的"耳朵"，专门等待特定事件发生，然后执行相应的操作。

  **有什么用？**
  - 响应事件并执行具体操作
  - 将大任务拆分成小模块
  - 一个事件可以有多个监听器

  **怎么用？**

  1. **创建监听器**
  ```bash
  php artisan make:listener SendWelcomeEmail --event=UserRegistered
  ```

  2. **编辑监听器 `app/Listeners/SendWelcomeEmail.php`**
  ```php
  class SendWelcomeEmail
  {
      public function handle(UserRegistered $event)
      {
          // 获取事件中的用户
          $user = $event->user;
          
          // 发送欢迎邮件
          Mail::to($user->email)->send(new WelcomeMail($user));
      }
  }
  ```

  3. **注册事件和监听器 `app/Providers/EventServiceProvider.php`**
  ```php
  protected $listen = [
      UserRegistered::class => [
          SendWelcomeEmail::class,
          InitializeUserProfile::class, // 可以注册多个监听器
      ],
  ];
  ```

  4. **实际应用：订单创建后的操作**
  ```php
  // 监听器1：发送订单确认邮件
  class SendOrderConfirmation
  {
      public function handle(OrderCreated $event)
      {
          $order = $event->order;
          Mail::to($order->user->email)->send(new OrderConfirmation($order));
      }
  }

  // 监听器2：更新库存
  class UpdateInventory
  {
      public function handle(OrderCreated $event)
      {
          foreach ($event->order->items as $item) {
              $product = Product::find($item->product_id);
              $product->decrement('stock', $item->quantity);
          }
      }
  }

  // 监听器3：记录日志
  class LogOrderCreation
  {
      public function handle(OrderCreated $event)
      {
          Log::info('新订单创建', [
              'order_id' => $event->order->id,
              'amount' => $event->order->total
          ]);
      }
  }
  ```

## 三、队列化监听

  **是什么？**
  > - 队列化监听就是把监听器的执行放到后台队列中，不阻塞主流程（如耗时操作：发邮件、处理图片等）。

  **有什么用？**
  - 提升响应速度：耗时操作后台运行
  - 防止请求超时：不影响主流程
  - 失败重试：自动处理失败任务

  **怎么用？**

  1. **使监听器可队列化**
  ```php
  class SendWelcomeEmail implements ShouldQueue
  {
      use InteractsWithQueue; // 可队列化
      
      public function handle(UserRegistered $event)
      {
          // 邮件发送逻辑...
      }
  }
  ```

  2. **配置队列驱动 `.env`**
  ```env
  QUEUE_CONNECTION=database # 可选 database, redis, sqs 等
  ```

  3. **创建队列表（如使用数据库驱动）**
  ```bash
  php artisan queue:table
  php artisan migrate
  ```

  4. **启动队列处理器**
  ```bash
  php artisan queue:work
  ```

  5. **实际应用：队列化处理图片上传**
  ```php
  // 事件：图片上传完成
  class ImageUploaded
  {
      use Dispatchable;
      
      public $image;
      
      public function __construct(Image $image)
      {
          $this->image = $image;
      }
  }

  // 监听器：处理图片（队列化）
  class ProcessUploadedImage implements ShouldQueue
  {
      use InteractsWithQueue;
      
      public function handle(ImageUploaded $event)
      {
          $image = $event->image;
          
          // 生成缩略图
          $this->generateThumbnails($image);
          
          // 添加水印
          $this->addWatermark($image);
          
          // 上传到云存储
          $this->uploadToCloud($image);
      }
  }

  // 控制器中使用
  public function uploadImage(Request $request)
  {
      $image = Image::createFromRequest($request);
      
      // 触发事件（监听器会自动在队列中处理）
      event(new ImageUploaded($image));
      
      return response()->json(['status' => 'processing']);
  }
  ```
## 完整示例：用户注册流程

  1. **创建事件和监听器**
  ```bash
  php artisan make:event UserRegistered
  php artisan make:listener SendWelcomeEmail --event=UserRegistered
  php artisan make:listener CreateUserProfile --event=UserRegistered
  php artisan make:listener AddToNewsletter --event=UserRegistered
  ```

  2. **注册事件 `app/Providers/EventServiceProvider.php`**
  ```php
  protected $listen = [
      UserRegistered::class => [
          SendWelcomeEmail::class,
          CreateUserProfile::class,
          AddToNewsletter::class,
      ],
  ];
  ```

  3. **实现监听器逻辑**
  ```php
  // 发送欢迎邮件（队列化）
  class SendWelcomeEmail implements ShouldQueue
  {
      public function handle(UserRegistered $event)
      {
          Mail::to($event->user->email)->send(new WelcomeMail($event->user));
      }
  }

  // 创建用户资料（立即执行）
  class CreateUserProfile
  {
      public function handle(UserRegistered $event)
      {
          Profile::create([
              'user_id' => $event->user->id,
              'bio' => '欢迎新用户！'
          ]);
      }
  }

  // 添加到通讯录（队列化）
  class AddToNewsletter implements ShouldQueue
  {
      public $delay = 600; // 延迟10分钟执行
      
      public function handle(UserRegistered $event)
      {
          Newsletter::addSubscriber($event->user->email, [
              'name' => $event->user->name
          ]);
      }
  }
  ```

  4. **在注册控制器中触发事件**
  ```php
  public function register(Request $request)
  {
      $user = User::create($request->validated());
      
      // 触发注册事件
      event(new UserRegistered($user));
      
      return redirect('/dashboard');
  }
  ```
## 常见问题解答

  **Q：如何查看队列中的事件任务？**  
  A：使用数据库驱动时可查看 jobs 表：  

  ```sql
  SELECT * FROM jobs;
  ```

  **Q：事件处理失败了怎么办？**  
  A：队列任务会自动重试，可在监听器中设置：  

  ```php
  class SendWelcomeEmail implements ShouldQueue
  {
      public $tries = 3; // 最大尝试次数
      
      public $backoff = [60, 180]; // 重试间隔（秒）
      
      public function failed(UserRegistered $event, Throwable $exception)
      {
          // 失败处理逻辑
          Log::error("发送欢迎邮件失败: {$exception->getMessage()}");
      }
  }
  ```

  **Q：如何手动触发事件监听器？**  
  A：使用事件门面：  

  ```php
  use Illuminate\Support\Facades\Event;

  Event::dispatch(new UserRegistered($user));
  ```

  **Q：如何限制事件监听器只运行一次？**  
  A：使用 withoutOverlapping 方法：****

  ```php
  class GenerateReport implements ShouldQueue
  {
      public function __construct()
      {
          $this->withoutOverlapping()->expireAfter(1800); // 30分钟过期
      }
  }
  ```

  **Q：如何调试事件系统？**  
  A：在 EventServiceProvider 中添加：  

  ```php
  public function boot()
  {
      parent::boot();
      
      // 监听所有事件
      Event::listen('*', function ($eventName, array $data) {
          Log::debug("事件触发: $eventName", $data);
      });
  }
  ```
