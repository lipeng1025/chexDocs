# 队列系统

## 一、队列配置

  **是什么？**
  > - 队列配置是设置Laravel如何处理异步任务的底层机制

  **有什么用？**
  - 将耗时任务异步处理（如发送邮件、处理图片）
  - 提高应用响应速度
  - 平衡服务器负载
  - 重试失败任务
  - 支持大规模任务处理

  **怎么用？**

  **步骤1：配置队列驱动 (`.env`)**
  ```env
  # 使用数据库驱动
  QUEUE_CONNECTION=database

  # 使用Redis驱动
  QUEUE_CONNECTION=redis

  # 使用Amazon SQS
  QUEUE_CONNECTION=sqs

  # 使用同步驱动（开发用）
  QUEUE_CONNECTION=sync
  ```

  **步骤2：配置队列连接 (`config/queue.php`)**
  ```php
  'connections' => [
      'database' => [
          'driver' => 'database',
          'table' => 'jobs',
          'queue' => 'default',
          'retry_after' => 90,
      ],
      
      'redis' => [
          'driver' => 'redis',
          'connection' => 'default',
          'queue' => env('REDIS_QUEUE', 'default'),
          'retry_after' => 90,
          'block_for' => null,
      ],
      
      'sqs' => [
          'driver' => 'sqs',
          'key' => env('AWS_ACCESS_KEY_ID'),
          'secret' => env('AWS_SECRET_ACCESS_KEY'),
          'prefix' => env('SQS_PREFIX', 'https://sqs.us-east-1.amazonaws.com/your-account-id'),
          'queue' => env('SQS_QUEUE', 'default'),
          'suffix' => env('SQS_SUFFIX'),
          'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
      ],
  ],
  ```

  **步骤3：创建队列表（数据库驱动）**
  ```bash
  php artisan queue:table
  php artisan migrate
  ```

  **步骤4：启动队列工作者**
  ```bash
  # 基本启动
  php artisan queue:work

  # 使用特定队列
  php artisan queue:work --queue=high,default,low

  # 守护进程模式
  php artisan queue:work --daemon

  # 使用Redis
  php artisan queue:work redis --sleep=3 --tries=3

  # 生产环境推荐使用Supervisor管理进程
  ```

  步骤5：配置Supervisor
  ```ini
  # /etc/supervisor/conf.d/laravel-worker.conf
  [program:laravel-worker]
  process_name=%(program_name)s_%(process_num)02d
  command=php /var/www/your-project/artisan queue:work --sleep=3 --tries=3
  autostart=true
  autorestart=true
  user=forge
  numprocs=8
  redirect_stderr=true
  stdout_logfile=/var/www/your-project/storage/logs/worker.log
  stopwaitsecs=3600
  ```

## 二、任务创建

  **是什么？**
  > - 创建可放入队列中异步执行的任务类

  **有什么用？**
  - 封装耗时操作
  - 自动序列化任务数据
  - 支持任务重试
  - 控制任务延迟
  - 设置任务优先级

  **怎么用？**

  **步骤1：创建任务类**
  ```bash
  php artisan make:job ProcessPodcast
  php artisan make:job SendWelcomeEmail
  ```

  **步骤2：基本任务类结构**
  ```php
  namespace App\Jobs;

  use Illuminate\Bus\Queueable;
  use Illuminate\Contracts\Queue\ShouldQueue;
  use Illuminate\Foundation\Bus\Dispatchable;
  use Illuminate\Queue\InteractsWithQueue;
  use Illuminate\Queue\SerializesModels;

  class ProcessPodcast implements ShouldQueue
  {
      use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

      public $tries = 3; // 最大尝试次数
      public $timeout = 120; // 超时时间（秒）
      public $backoff = [10, 30, 60]; // 重试间隔

      protected $podcast;

      // 传入任务数据
      public function __construct($podcast)
      {
          $this->podcast = $podcast;
      }

      // 任务处理逻辑
      public function handle()
      {
          // 处理播客文件
          $this->processAudio($this->podcast);
          
          // 生成缩略图
          $this->generateThumbnail($this->podcast);
          
          // 通知用户
          $this->podcast->user->notify(new PodcastProcessed($this->podcast));
      }
  }
  ```

  **步骤3：调度任务**
  ```php
  // 立即调度
  ProcessPodcast::dispatch($podcast);

  // 延迟调度
  SendWelcomeEmail::dispatch($user)
      ->delay(now()->addMinutes(10));

  // 指定队列
  ProcessPodcast::dispatch($podcast)
      ->onQueue('audio-processing');

  // 链式调度
  ProcessPodcast::withChain([
      new OptimizePodcast($podcast),
      new ReleasePodcast($podcast)
  ])->dispatch($podcast);
  ```

  **步骤4：任务批处理**
  ```php
  use Illuminate\Bus\Batch;
  use Illuminate\Support\Facades\Bus;

  // 创建批处理
  $batch = Bus::batch([
      new ProcessPodcast(1),
      new ProcessPodcast(2),
      new ProcessPodcast(3),
  ])->then(function (Batch $batch) {
      // 所有任务成功完成
  })->catch(function (Batch $batch, Throwable $e) {
      // 有任务失败
  })->finally(function (Batch $batch) {
      // 批处理完成（无论成功失败）
  })->onQueue('podcasts')->dispatch();

  // 获取批处理信息
  $batchId = $batch->id;
  $progress = $batch->processedJobs();
  ```

## 三、失败处理

  **是什么？**
  > - 处理队列任务执行失败时的机制

  **有什么用？**
  - 记录失败任务
  - 自动重试任务
  - 手动重试失败任务
  - 分析失败原因
  - 防止任务无限重试

  **怎么用？**

  1. **配置失败任务表**
  ```bash
  php artisan queue:failed-table
  php artisan migrate
  ```

  2. **任务失败处理**
  ```php
  class ProcessPodcast implements ShouldQueue
  {
      // 最大尝试次数
      public $tries = 5;
      
      // 超时时间
      public $timeout = 60;
      
      // 失败处理
      public function failed(Throwable $exception)
      {
          // 记录失败日志
          Log::error('处理播客失败', [
              'podcast' => $this->podcast->id,
              'error' => $exception->getMessage()
          ]);
          
          // 通知管理员
          Admin::notifyAll(new PodcastProcessingFailed(
              $this->podcast, 
              $exception
          ));
          
          // 标记播客为失败状态
          $this->podcast->update(['status' => 'failed']);
      }
  }
  ```

  3. **管理失败任务**
  ```bash
  # 查看失败任务
  php artisan queue:failed

  # 重试单个失败任务
  php artisan queue:retry 1

  # 重试所有失败任务
  php artisan queue:retry all

  # 删除失败任务
  php artisan queue:forget 1

  # 清空所有失败任务
  php artisan queue:flush
  ```

  4. **配置失败任务通知**
  ```php
  // 在AppServiceProvider中
  public function boot()
  {
      Queue::failing(function (JobFailed $event) {
          // $event->connectionName
          // $event->job
          // $event->exception
          
          // 发送全局失败通知
          Notification::route('slack', env('SLACK_WEBHOOK'))
              ->notify(new QueueJobFailed($event));
      });
  }
  ```
## 完整队列系统示例

  1. **用户注册流程**
  ```php
  // 注册控制器
  public function register(Request $request)
  {
      // 验证数据
      $data = $request->validate([...]);
      
      // 创建用户
      $user = User::create($data);
      
      // 调度任务
      SendVerificationEmail::dispatch($user);
      ProcessUserAvatar::dispatch($user, $request->file('avatar'));
      GenerateUserReport::dispatch($user)->delay(now()->addDay());
      
      // 立即响应
      return response()->json(['message' => '注册成功']);
  }

  // 发送验证邮件任务
  class SendVerificationEmail implements ShouldQueue
  {
      use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
      
      public $user;
      public $tries = 3;
      
      public function __construct(User $user)
      {
          $this->user = $user;
      }
      
      public function handle()
      {
          $this->user->sendEmailVerificationNotification();
      }
      
      public function failed(Throwable $exception)
      {
          Log::error('发送验证邮件失败', [
              'user' => $this->user->id,
              'error' => $exception->getMessage()
          ]);
      }
  }

  // 处理用户头像任务
  class ProcessUserAvatar implements ShouldQueue
  {
      // ...
      
      public function handle()
      {
          // 存储原始图片
          $path = $request->file('avatar')->store('avatars');
          
          // 创建缩略图
          $image = Image::make($request->file('avatar'))
              ->resize(300, 300)
              ->encode();
          
          Storage::put("avatars/thumbs/{$user->id}.jpg", $image);
          
          // 更新用户记录
          $user->update(['avatar' => $path]);
      }
  }
  ```

  2. **电商订单处理**
  ```php
  // 创建订单后
  public function store(OrderRequest $request)
  {
      $order = Order::create($request->validated());
      
      // 调度订单处理任务链
      ProcessOrder::withChain([
          new ChargePayment($order),
          new GenerateInvoice($order),
          new SendOrderConfirmation($order),
          new UpdateInventory($order)
      ])->dispatch($order);
      
      return redirect('/orders')->with('success', '订单已创建');
  }

  // 订单处理任务
  class ProcessOrder implements ShouldQueue
  {
      public $order;
      public $tries = 3;
      
      public function __construct(Order $order)
      {
          $this->order = $order;
      }
      
      public function handle()
      {
          // 验证订单
          if ($this->order->isValid()) {
              $this->order->update(['status' => 'processing']);
          } else {
              $this->fail(new InvalidOrderException('无效订单'));
          }
      }
  }

  // 支付任务
  class ChargePayment implements ShouldQueue
  {
      public $order;
      public $tries = 5;
      public $backoff = [30, 60, 120];
      
      public function __construct(Order $order)
      {
          $this->order = $order;
      }
      
      public function handle()
      {
          try {
              $payment = PaymentGateway::charge(
                  $this->order->total,
                  $this->order->payment_token
              );
              
              $this->order->update([
                  'payment_status' => 'paid',
                  'transaction_id' => $payment->id
              ]);
          } catch (PaymentException $e) {
              $this->release(60); // 60秒后重试
          }
      }
  }
  ```
## 高级队列特性

  1. **速率限制**
  ```php
  // 限制任务速率
  ProcessPodcast::dispatch($podcast)
      ->onQueue('podcasts')
      ->through([
          new RateLimited(10) // 每秒最多10个任务
      ]);
  ```

  2. **任务中间件**
  ```php
  // 创建中间件
  php artisan make:middleware LogJobExecution

  // 中间件代码
  class LogJobExecution
  {
      public function handle($job, $next)
      {
          $start = microtime(true);
          
          Log::info("任务开始: ".get_class($job));
          $next($job);
          
          $time = microtime(true) - $start;
          Log::info("任务完成: ".get_class($job)." 耗时: {$time}秒");
      }
  }

  // 在任务中使用
  class ProcessPodcast implements ShouldQueue
  {
      public function middleware()
      {
          return [new LogJobExecution];
      }
  }
  ```

  3. **任务批处理监控**
  ```php
  // 创建批处理
  $batch = Bus::batch([
      // 任务列表...
  ])->then(function (Batch $batch) {
      // 所有任务成功完成
  })->catch(function (Batch $batch, Throwable $e) {
      // 有任务失败
  })->finally(function (Batch $batch) {
      // 批处理完成
  })->dispatch();

  // 前端监控进度
  Route::get('/batch/{batchId}', function ($batchId) {
      $batch = Bus::findBatch($batchId);
      
      return view('batch.progress', [
          'batch' => $batch
      ]);
  });
  ```

  ```html
  <!-- resources/views/batch/progress.blade.php -->
  <div class="batch-progress">
      <div class="progress-bar" style="width: {{ $batch->progress() }}%">
          {{ $batch->progress() }}%
      </div>
      <div>
          已处理: {{ $batch->processedJobs() }} / {{ $batch->totalJobs }}
      </div>
      @if($batch->finished())
          <div class="alert alert-success">
              批处理已完成！
          </div>
      @endif
  </div>

  <script>
  // 每5秒刷新进度
  setInterval(() => {
      fetch('/batch/{{ $batch->id }}')
          .then(response => response.text())
          .then(html => {
              document.querySelector('.batch-progress').outerHTML = 
                  (new DOMParser()).parseFromString(html, 'text/html')
                      .querySelector('.batch-progress').outerHTML;
          });
  }, 5000);
  </script>
  ```

  4. **队列优先级**
  ```php
  // 调度高优先级任务
  ProcessUrgentOrder::dispatch($order)
      ->onQueue('high');

  // 调度低优先级任务
  GenerateReport::dispatch($data)
      ->onQueue('low');

  // 工作者按优先级处理
  php artisan queue:work --queue=high,medium,low
  ```
## 队列监控与管理

  1. **Horizon仪表板**
  ```bash
  composer require laravel/horizon
  php artisan horizon:install
  php artisan horizon
  ```

  ```php
  // config/horizon.php
  'environments' => [
      'production' => [
          'supervisor-1' => [
              'connection' => 'redis',
              'queue' => ['high', 'default'],
              'balance' => 'auto',
              'processes' => 10,
              'tries' => 3,
          ],
      ],
  ],
  ```

  访问 `/horizon` 查看队列仪表板

  2. **自定义监控**
  ```php
  // 记录队列指标
  Queue::looping(function () {
      Metrics::increment('queue.jobs.started');
  });

  Queue::after(function (JobProcessed $event) {
      Metrics::increment('queue.jobs.processed');
      Metrics::gauge('queue.job.time', $event->job->resolve('time'));
  });

  Queue::failing(function (JobFailed $event) {
      Metrics::increment('queue.jobs.failed');
  });
  ```

  3. **队列健康检查**
  ```php
  Route::get('/health/queue', function () {
      // 检查数据库队列是否有积压
      if (Queue::connection('database')->size('default') > 100) {
          return response()->json(['status' => 'overloaded'], 500);
      }
      
      // 检查是否有长时间运行的工作者
      $threshold = now()->subMinutes(10);
      $inactive = DB::table('jobs')
          ->where('available_at', '<', $threshold->timestamp)
          ->exists();
          
      if ($inactive) {
          return response()->json(['status' => 'stalled'], 500);
      }
      
      return response()->json(['status' => 'ok']);
  });
  ```
## 最佳实践

  1. **任务设计原则**
  ```php
  // 保持任务小而专注
  class ProcessOrder {
      public function handle() {
          // 只处理订单核心逻辑
          $this->validateOrder();
          $this->calculateTotal();
          $this->reserveInventory();
      }
  }

  // 避免在任务中处理太多逻辑
  class SendOrderNotifications {
      public function handle() {
          // 发送通知
          $this->sendEmail();
          $this->sendSms();
          $this->sendPushNotification();
      }
  }
  ```

  2. **性能优化**
  ```php
  // 预加载关联数据
  class GenerateUserReport implements ShouldQueue
  {
      public function handle()
      {
          // 避免N+1查询
          User::with('orders', 'payments')->chunk(100, function ($users) {
              foreach ($users as $user) {
                  $this->generateReport($user);
              }
          });
      }
  }

  // 使用内存缓存
  class ProcessLargeDataset implements ShouldQueue
  {
      public function handle()
      {
          $data = []; // 大数据集
          
          // 分块处理
          foreach (array_chunk($data, 1000) as $chunk) {
              ProcessDataChunk::dispatch($chunk);
          }
      }
  }
  ```

  3. **安全注意事项**
  ```php
  // 不要序列化敏感数据
  class ProcessPayment implements ShouldQueue
  {
      protected $paymentToken; // 安全风险！
      
      // 改为存储ID
      protected $paymentId;
      
      public function __construct($paymentId)
      {
          $this->paymentId = $paymentId;
      }
      
      public function handle()
      {
          $payment = Payment::find($this->paymentId);
          // 处理支付...
      }
  }

  // 加密敏感数据
  class HandleUserData implements ShouldQueue
  {
      protected $encryptedData;
      
      public function __construct($data)
      {
          $this->encryptedData = encrypt($data);
      }
      
      public function handle()
      {
          $data = decrypt($this->encryptedData);
          // 处理数据...
      }
  }
  ```

