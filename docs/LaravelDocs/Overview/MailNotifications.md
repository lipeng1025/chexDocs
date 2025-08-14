# 邮件与通知
## 概念

  **什么是邮件与通知系统？**
  > - 邮件与通知系统就像应用的"信使"，负责将重要信息（如订单确认、密码重置）通过不同渠道（邮件、短信、App推送等）发送给用户。

  **有什么用？**
  - 及时通知用户重要事件
  - 通过多种渠道触达用户
  - 提升用户体验和参与度
  - 自动化关键业务流程
  - 统一管理所有通知渠道

## 一、邮件模板

  **是什么？**
  > - 邮件模板就是预先设计好的邮件格式和内容，让邮件发送更专业、更美观。

  **有什么用？**
  - 保持品牌一致性
  - 提高邮件专业度
  - 减少重复工作
  - 支持动态内容

  **怎么用？**

  1. **创建邮件类**
  ```bash
  php artisan make:mail OrderShipped
  ```

  2. **编辑邮件类 `app/Mail/OrderShipped.php`**
  ```php
  class OrderShipped extends Mailable
  {
      use Queueable, SerializesModels;

      public $order; // 公共属性会自动传递给视图

      public function __construct(Order $order)
      {
          $this->order = $order;
      }

      public function build()
      {
          return $this->subject('您的订单已发货') // 邮件主题
                      ->view('emails.orders.shipped') // 邮件视图
                      ->attach(storage_path('app/invoices/'.$this->order->invoice)); // 附件
      }
  }
  ```

  3. **创建邮件视图 `resources/views/emails/orders/shipped.blade.php`**
  ```blade
  <!DOCTYPE html>
  <html>
  <head>
      <title>订单发货通知</title>
  </head>
  <body>
      <h1>您好, {{ $order->user->name }}!</h1>
      <p>您的订单 #{{ $order->id }} 已发货</p>
      
      <h2>订单详情</h2>
      <ul>
          @foreach($order->items as $item)
              <li>{{ $item->name }} - {{ $item->quantity }} × ¥{{ $item->price }}</li>
          @endforeach
      </ul>
      
      <p>总金额: <strong>¥{{ $order->total }}</strong></p>
      <p>物流公司: {{ $order->shipping->company }}</p>
      <p>运单号: {{ $order->shipping->tracking_number }}</p>
      
      <a href="{{ route('orders.track', $order) }}">跟踪订单</a>
      
      <footer>
          <p>感谢您的惠顾！</p>
          <p>{{ config('app.name') }}</p>
      </footer>
  </body>
  </html>
  ```

  4. **发送邮件**
  ```php
  use App\Mail\OrderShipped;
  use Illuminate\Support\Facades\Mail;

  // 发送给单个用户
  Mail::to($user->email)->send(new OrderShipped($order));

  // 发送给多个用户
  Mail::to($user1)->cc($user2)->bcc($admin)->send(new OrderShipped($order));
  ```

  5. **实际应用：密码重置邮件**
  ```php
  // 创建邮件类
  php artisan make:mail PasswordReset
  ```

  ```php
  // app/Mail/PasswordReset.php
  class PasswordReset extends Mailable
  {
      public $resetLink;
      
      public function __construct($token)
      {
          $this->resetLink = url('/password/reset/'.$token);
      }
      
      public function build()
      {
          return $this->subject('重置您的密码')
                    ->view('emails.auth.password-reset');
      }
  }
  ```

  ```blade
  <!-- resources/views/emails/auth/password-reset.blade.php -->
  <p>您收到此邮件是因为我们收到了您账户的密码重置请求。</p>
  <p>请点击以下链接重置密码：</p>
  <a href="{{ $resetLink }}">{{ $resetLink }}</a>
  <p>如果您没有请求重置密码，请忽略此邮件。</p>
  ```

## 二、通知渠道

  **是什么？**
  > - 通知渠道是消息传递的不同方式，Laravel支持邮件、短信、数据库存储、App推送等多种渠道。

  **有什么用？**
  - 通过用户偏好的渠道触达
  - 多平台消息同步
  - 灵活配置通知方式
  - 统一管理所有通知

  **怎么用？**

  1. **创建通知类**
  ```bash
  php artisan make:notification InvoicePaid
  ```

  2. **编辑通知类 `app/Notifications/InvoicePaid.php`**
  ```php
  class InvoicePaid extends Notification
  {
      use Queueable;

      public $invoice;

      public function __construct(Invoice $invoice)
      {
          $this->invoice = $invoice;
      }

      // 指定通知渠道
      public function via($notifiable)
      {
          // 返回用户偏好的渠道
          return $notifiable->preferred_channels;
      }

      // 邮件通知格式
      public function toMail($notifiable)
      {
          return (new MailMessage)
                      ->subject('发票已支付')
                      ->line('您的发票 #'.$this->invoice->id.' 已成功支付。')
                      ->action('查看发票', url('/invoices/'.$this->invoice->id))
                      ->line('感谢您使用我们的服务！');
      }

      // 数据库通知格式
      public function toDatabase($notifiable)
      {
          return [
              'invoice_id' => $this->invoice->id,
              'amount' => $this->invoice->amount,
              'message' => '发票 #'.$this->invoice->id.' 已支付'
          ];
      }

      // 短信通知格式 (使用Nexmo)
      public function toNexmo($notifiable)
      {
          return (new NexmoMessage)
                      ->content('您的发票 #'.$this->invoice->id.' 已支付。金额: $'.$this->invoice->amount);
      }
  }
  ```

  3. **发送通知**
  ```php
  // 发送给单个用户
  $user->notify(new InvoicePaid($invoice));

  // 发送给多个用户
  Notification::send($users, new InvoicePaid($invoice));
  ```

  4. **实际应用：新订单通知**
  ```php
  class NewOrderNotification extends Notification
  {
      use Queueable;

      public $order;

      public function __construct(Order $order)
      {
          $this->order = $order;
      }

      public function via($notifiable)
      {
          return ['database', 'mail', 'broadcast'];
      }

      public function toDatabase($notifiable)
      {
          return [
              'order_id' => $this->order->id,
              'customer' => $this->order->user->name,
              'amount' => $this->order->total,
              'message' => '新订单 #'.$this->order->id
          ];
      }

      public function toMail($notifiable)
      {
          return (new MailMessage)
                      ->subject('新订单通知')
                      ->line('您有一个新订单 #'.$this->order->id)
                      ->action('查看订单', route('admin.orders.show', $this->order))
                      ->line('客户: '.$this->order->user->name)
                      ->line('金额: $'.$this->order->total);
      }

      public function toBroadcast($notifiable)
      {
          return new BroadcastMessage([
              'order_id' => $this->order->id,
              'amount' => $this->order->total
          ]);
      }
  }
  ```

## 三、队列发送

  **是什么？**
  > - 队列发送就是将耗时的通知任务放入后台队列处理，避免阻塞主程序。

  **有什么用？**
  - 提升用户体验（页面响应更快）
  - 防止邮件发送超时
  - 支持重试失败任务
  - 处理大量通知更高效

  **怎么用？**

  1. **使通知可队列化**
  ```php
  class InvoicePaid extends Notification implements ShouldQueue
  {
      // 自动加入队列
  }
  ```

  2. **配置队列驱动 `.env`**
  ```env
  QUEUE_CONNECTION=database # 可选 redis, sqs, beanstalkd
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

  5. **设置队列延迟**
  ```php
  // 延迟10分钟发送
  $delay = now()->addMinutes(10);
  $user->notify((new InvoicePaid($invoice))->delay($delay));
  ```

  6. **实际应用：批量发送促销邮件**
  ```php
  // 创建促销通知
  class PromotionNotification extends Notification implements ShouldQueue
  {
      public $promotion;
      
      public function __construct(Promotion $promotion)
      {
          $this->promotion = $promotion;
      }
      
      public function via($notifiable)
      {
          return ['mail'];
      }
      
      public function toMail($notifiable)
      {
          return (new MailMessage)
                      ->subject($this->promotion->title)
                      ->view('emails.promotions.offer', [
                          'promotion' => $this->promotion
                      ]);
      }
  }

  // 控制器中发送
  public function sendPromotion(Promotion $promotion)
  {
      $users = User::where('subscribed', true)->chunk(200, function ($users) use ($promotion) {
          foreach ($users as $user) {
              $user->notify(new PromotionNotification($promotion));
          }
      });
      
      return redirect()->back()->with('message', '促销邮件已加入发送队列');
  }
  ```
## 完整示例：用户注册流程

  1. **创建通知类**
  ```bash
  php artisan make:notification UserRegistered
  ```

  2. **实现通知逻辑 `app/Notifications/UserRegistered.php`**
  ```php
  class UserRegistered extends Notification implements ShouldQueue
  {
      use Queueable;

      public $user;

      public function __construct(User $user)
      {
          $this->user = $user;
      }

      public function via($notifiable)
      {
          return ['mail', 'database'];
      }

      public function toMail($notifiable)
      {
          return (new MailMessage)
                      ->subject('欢迎加入' . config('app.name'))
                      ->greeting('您好 ' . $this->user->name . '!')
                      ->line('感谢您注册我们的服务。')
                      ->action('激活账户', url('/activate/' . $this->user->activation_code))
                      ->line('如果您没有创建账户，请忽略此邮件。');
      }

      public function toDatabase($notifiable)
      {
          return [
              'user_id' => $this->user->id,
              'name' => $this->user->name,
              'message' => '新用户注册',
              'link' => route('admin.users.show', $this->user)
          ];
      }
  }
  ```

  3. **在用户注册后发送通知**
  ```php
  public function register(Request $request)
  {
      $user = User::create($request->validated());
      
      // 发送欢迎通知（自动加入队列）
      $user->notify(new UserRegistered($user));
      
      // 同时通知管理员
      $admin = User::where('is_admin', true)->first();
      $admin->notify(new NewUserNotification($user));
      
      return redirect('/dashboard');
  }
  ```

  4. **邮件模板 `resources/views/emails/user-registered.blade.php`**
  ```blade
  @component('mail::message')
  # 欢迎加入 {{ config('app.name') }}

  感谢您注册我们的服务！请点击下方按钮激活您的账户：

  @component('mail::button', ['url' => $activationUrl])
  激活账户
  @endcomponent

  如果按钮无效，请复制以下链接到浏览器：  
  {{ $activationUrl }}

  感谢，  
  {{ config('app.name') }} 团队
  @endcomponent
  ```
## 常见问题解答

  **Q：如何预览邮件？**  
  A：使用Mailtrap或创建路由：

  ```php
  Route::get('/preview-email', function () {
      $order = Order::first();
      return new App\Mail\OrderShipped($order);
  });
  ```

  **Q：如何自定义邮件主题？**  
  A：在build方法中设置：

  ```php
  public function build()
  {
      return $this->subject('您的自定义主题')->view(...);
  }
  ```

  **Q：如何添加附件？**  
  A：

  ```php
  ->attach('/path/to/file.pdf', [
      'as' => 'invoice.pdf',
      'mime' => 'application/pdf',
  ])
  ```

  **Q：如何设置通知优先级？**  
  A：

  ```php
  public function via($notifiable)
  {
      return ['mail', 'database'];
  }

  public function routesForMail()
  {
      return ['mail@example.com' => 'high']; // 高优先级
  }
  ```

  **Q：如何重试失败的任务？**  
  A：

  ```bash
  # 重试所有失败任务
  php artisan queue:retry all

  # 重试特定任务
  php artisan queue:retry 5
  ```

  **Q：如何测试通知？**  
  A：使用Notification Facade的fake方法：

  ```php
  public function test_welcome_notification_sent()
  {
      Notification::fake();
      
      $user = User::factory()->create();
      
      // 断言通知已发送
      Notification::assertSentTo(
          $user,
          UserRegistered::class
      );
      
      // 断言通知未发送
      Notification::assertNotSentTo(
          [$admin],
          NewUserNotification::class
      );
  }
  ```

  **Q：如何自定义队列连接？**  
  A：

  ```php
  // 在通知类中添加
  public $connection = 'redis';

  // 或者在发送时指定
  $user->notify((new InvoicePaid($invoice))->onConnection('redis'));
  ```

