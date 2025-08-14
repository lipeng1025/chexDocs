# 队列进阶

## 一、任务链

  **是什么？**
  > - 任务链是将多个队列任务按顺序连接起来，形成有序执行序列的机制

  **有什么用？**
  - 确保任务按特定顺序执行
  - 自动处理任务依赖关系
  - 简化复杂工作流程
  - 提供任务链级别的错误处理

  **怎么用？**

  1. **基本任务链**
  ```php
  use App\Jobs\ProcessOrder;
  use App\Jobs\ChargePayment;
  use App\Jobs\SendConfirmation;
  use Illuminate\Support\Facades\Bus;

  // 创建任务链
  Bus::chain([
      new ProcessOrder($order),
      new ChargePayment($order),
      new SendConfirmation($order)
  ])->dispatch();

  // 闭包任务链
  Bus::chain([
      function () use ($order) {
          // 准备订单
          $order->prepare();
      },
      new ProcessOrder($order),
      function () use ($order) {
          // 记录日志
          Log::info('订单处理完成', $order->toArray());
      }
  ])->dispatch();
  ```

  2. **带连接的任务链**
  ```php
  // 指定队列连接
  Bus::chain([
      new ProcessImage($image),
      new GenerateThumbnail($image),
      new UploadToCloud($image)
  ])->onConnection('redis') // 指定连接
    ->onQueue('media')      // 指定队列
    ->dispatch();
  ```

  3. **错误处理**
  ```php
  Bus::chain([
      new ProcessVideo($video),
      new TranscodeVideo($video),
      new NotifyUser($video->user)
  ])->catch(function (Throwable $e) {
      // 整个链的错误处理
      Log::error('视频处理链失败: '.$e->getMessage());
      $video->update(['status' => 'failed']);
  })->dispatch();
  ```

  4. **实际应用：用户注册流程**
  ```php
  public function register(Request $request)
  {
      $user = User::create($request->validated());
      
      // 创建注册任务链
      Bus::chain([
          new SendWelcomeEmail($user),
          new ProcessUserAvatar($user, $request->file('avatar')),
          new InitializeUserSettings($user),
          new AddToNewsletter($user)
      ])->catch(function ($e) use ($user) {
          // 失败时删除用户
          $user->delete();
          Log::error('用户注册失败: '.$e->getMessage());
      })->dispatch();
      
      return redirect('/dashboard');
  }
  ```

## 二、批处理

  **是什么？**
  > - 批处理是将多个任务分组处理，并提供整体监控和管理机制

  **有什么用？**
  - 批量处理大量任务
  - 监控整体进度
  - 实现批处理级别的回调
  - 减少任务调度开销

  **怎么用？**

  1. **创建批处理**
  ```php
  use App\Jobs\GenerateReport;
  use Illuminate\Support\Facades\Bus;

  // 准备任务数组
  $jobs = [];
  foreach (User::all() as $user) {
      $jobs[] = new GenerateReport($user);
  }

  // 创建批处理
  $batch = Bus::batch($jobs)
      ->name('用户报告生成')
      ->onQueue('reports')
      ->allowFailures() // 允许部分失败
      ->dispatch();

  // 获取批处理ID
  $batchId = $batch->id;
  ```

  2. **批处理回调**
  ```php
  $batch = Bus::batch($jobs)
      ->then(function (Batch $batch) {
          // 所有任务成功完成
          Notification::send(Admin::all(), new BatchCompleted($batch));
      })
      ->catch(function (Batch $batch, Throwable $e) {
          // 批处理中有任务失败
          Log::error("批处理 {$batch->id} 失败: {$e->getMessage()}");
      })
      ->finally(function (Batch $batch) {
          // 无论成功失败都会执行
          Cache::forget('reports_running');
      })
      ->dispatch();
  ```

  3. **添加任务到现有批处理**
  ```php
  // 获取现有批处理
  $batch = Bus::findBatch($batchId);

  // 添加新任务
  $batch->add(new GenerateReport($newUser));
  ```

  4. **批处理状态监控**
  ```php
  // 获取批处理状态
  $batch = Bus::findBatch($batchId);

  // 前端显示进度
  public function batchProgress($batchId)
  {
      $batch = Bus::findBatch($batchId);
      
      return response()->json([
          'id' => $batch->id,
          'name' => $batch->name,
          'totalJobs' => $batch->totalJobs,
          'pendingJobs' => $batch->pendingJobs,
          'failedJobs' => $batch->failedJobs,
          'processedJobs' => $batch->processedJobs,
          'progress' => $batch->progress(),
          'finished' => $batch->finished(),
          'cancelled' => $batch->cancelled(),
      ]);
  }
  ```

  5. **取消批处理**
  ```php
  // 取消批处理
  $batch = Bus::findBatch($batchId);
  $batch->cancel();

  // 在任务中检查是否取消
  class GenerateReport implements ShouldQueue
  {
      public function handle()
      {
          if ($this->batch()->cancelled()) {
              // 终止任务执行
              return;
          }
          
          // 正常处理...
      }
  }
  ```

## 三、速率限制

  **是什么？**
  > - 控制队列任务在指定时间内的最大执行次数

  **有什么用？**
  - 防止API调用频率超限
  - 避免资源耗尽
  - 平滑处理高峰流量
  - 遵守第三方服务限制

  **怎么用？**

  1. **全局速率限制**
  ```php
  // 在AppServiceProvider中定义速率限制器
  use Illuminate\Cache\RateLimiting\Limit;
  use Illuminate\Support\Facades\RateLimiter;

  public function boot()
  {
      // 定义邮件发送速率限制
      RateLimiter::for('emails', function ($job) {
          return Limit::perMinute(30); // 每分钟30封
      });
      
      // 定义API调用限制
      RateLimiter::for('api', function ($job) {
          return Limit::perMinute(100)
              ->by($job->accountId); // 按账户ID区分
      });
  }
  ```

  2. **在任务中使用速率限制**
  ```php
  use Illuminate\Queue\Middleware\RateLimited;

  class SendEmail implements ShouldQueue
  {
      public function middleware()
      {
          return [new RateLimited('emails')];
      }
      
      // 自定义释放时间
      public function middleware()
      {
          return [
              (new RateLimited('emails'))->releaseAfter(60), // 60秒后重试
          ];
      }
  }
  ```

  3. **动态速率限制**
  ```php
  class CallExternalApi implements ShouldQueue
  {
      public $account;
      
      public function __construct(Account $account)
      {
          $this->account = $account;
      }
      
      public function middleware()
      {
          return [
              new RateLimited('api:'.$this->account->tier),
          ];
      }
  }

  // 在AppServiceProvider中
  RateLimiter::for('api:premium', function ($job) {
      return Limit::perMinute(200); // 高级账户限制
  });

  RateLimiter::for('api:basic', function ($job) {
      return Limit::perMinute(50); // 基础账户限制
  });
  ```

  4. **自定义限制响应**
  ```php
  RateLimiter::for('critical-api', function ($job) {
      return Limit::perMinute(10)
          ->by($job->ip)
          ->response(function () {
              // 自定义释放时间（分钟）
              return 5;
          });
  });
  ```
## 完整应用示例

  1. **电商订单处理系统**
  ```php
  // 订单处理任务链
  public function processOrder(Order $order)
  {
      Bus::chain([
          new ValidateOrder($order),
          new ReserveInventory($order),
          new ChargePayment($order),
          new GenerateInvoice($order),
          new SendOrderConfirmation($order),
          new UpdateAnalytics($order)
      ])
      ->onQueue('orders')
      ->catch(function ($e) use ($order) {
          $order->update(['status' => 'failed']);
          Notification::send($order->user, new OrderFailed($order, $e));
      })
      ->dispatch();
  }

  // 批处理生成报告
  public function generateMonthlyReports()
  {
      $jobs = [];
      foreach (Department::all() as $department) {
          $jobs[] = new GenerateDepartmentReport($department);
      }
      
      $batch = Bus::batch($jobs)
          ->name('月度部门报告')
          ->onQueue('reports')
          ->then(function (Batch $batch) {
              // 压缩所有报告
              ZipReports::dispatch($batch->id);
          })
          ->dispatch();
      
      return $batch->id;
  }

  // 带速率限制的API调用
  class SyncWithExternalApi implements ShouldQueue
  {
      public $user;
      
      public function __construct(User $user)
      {
          $this->user = $user;
      }
      
      public function middleware()
      {
          return [
              (new RateLimited('external-api:'.$this->user->plan))
                  ->releaseAfter(rand(30, 120)) // 随机延迟避免同步失败
          ];
      }
      
      public function handle()
      {
          // 调用外部API
          ExternalApiService::syncUser($this->user);
      }
  }
  ```

  2. **媒体处理管道**
  ```php
  // 视频处理任务链
  public function processVideo(Video $video)
  {
      Bus::chain([
          new ValidateVideo($video),
          new ExtractMetadata($video),
          new TranscodeVideo($video, '360p'),
          new TranscodeVideo($video, '720p'),
          new TranscodeVideo($video, '1080p'),
          new GenerateThumbnails($video),
          new NotifyUser($video->user, '视频处理完成')
      ])
      ->onQueue('video-processing')
      ->catch(function ($e) use ($video) {
          $video->update(['status' => 'failed']);
          Log::error("视频处理失败: {$video->id}", ['error' => $e]);
      })
      ->dispatch();
  }

  // 批处理视频转码
  public function batchTranscodeVideos($videos)
  {
      $jobs = [];
      foreach ($videos as $video) {
          $jobs[] = new TranscodeVideo($video);
      }
      
      $batch = Bus::batch($jobs)
          ->name('批量视频转码')
          ->onQueue('video-processing')
          ->then(function (Batch $batch) {
              Storage::disk('s3')->move(
                  'processing/videos', 
                  'processed/videos'
              );
          })
          ->dispatch();
      
      return $batch;
  }

  // 带速率限制的转码任务
  class TranscodeVideo implements ShouldQueue
  {
      use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
      
      public $video;
      public $resolution;
      public $tries = 3;
      
      public function __construct(Video $video, $resolution = '720p')
      {
          $this->video = $video;
          $this->resolution = $resolution;
      }
      
      public function middleware()
      {
          return [
              new RateLimited('transcoding'),
              (new RateLimited('transcoding:'.$this->resolution))
                  ->releaseAfter(30)
          ];
      }
      
      public function handle()
      {
          // 使用FFmpeg转码
          $ffmpeg = FFMpeg::open($this->video->path);
          $ffmpeg->export()
              ->inFormat(new X264)
              ->atResolution($this->resolution)
              ->save("transcoded/{$this->video->id}_{$this->resolution}.mp4");
      }
  }

  // 速率限制器配置
  RateLimiter::for('transcoding', function ($job) {
      return Limit::perMinute(10); // 全局限制
  });

  RateLimiter::for('transcoding:1080p', function ($job) {
      return Limit::perMinute(2); // 高清转码限制更严格
  });
  ```
## 高级技巧

  1. **链式批处理**
  ```php
  // 创建链式批处理
  Bus::chain([
      new ImportData,
      function () {
          // 处理导入的数据
          $jobs = [];
          foreach (DataChunk::all() as $chunk) {
              $jobs[] = new ProcessDataChunk($chunk);
          }
          
          return Bus::batch($jobs)
              ->then(function () {
                  CleanupTempFiles::dispatch();
              });
      },
      new GenerateSummaryReport
  ])->dispatch();
  ```

  2. **动态速率限制**
  ```php
  class DynamicRateLimited implements ShouldQueue
  {
      public $tries = 5;
      
      public function middleware()
      {
          // 根据当前负载动态调整
          $load = sys_getloadavg()[0];
          $delay = $load > 5 ? 120 : 30;
          
          return [
              (new RateLimited('dynamic'))
                  ->releaseAfter($delay)
          ];
      }
  }

  // 动态速率限制器
  RateLimiter::for('dynamic', function ($job) {
      // 根据时间调整限制
      $hour = now()->hour;
      $limit = ($hour >= 9 && $hour <= 17) ? 50 : 100;
      
      return Limit::perMinute($limit);
  });
  ```

  3. **优先级链**
  ```php
  Bus::chain([
      (new HighPriorityTask)->onQueue('high'),
      (new MediumPriorityTask)->onQueue('medium'),
      (new LowPriorityTask)->onQueue('low')
  ])->dispatch();

  // 启动工作者处理不同优先级
  php artisan queue:work --queue=high,medium,low
  ```
## 监控与调试

  1. **Horizon 监控**
  ```php
  // config/horizon.php
  'environments' => [
      'production' => [
          'supervisor-1' => [
              'connection' => 'redis',
              'queue' => ['high', 'default', 'low'],
              'balance' => 'auto',
              'minProcesses' => 1,
              'maxProcesses' => 10,
              'balanceMaxShift' => 1,
              'balanceCooldown' => 3,
          ],
      ],
  ],
  ```

  2. **批处理进度API**
  ```php
  // routes/api.php
  Route::get('/batch/{id}/progress', function ($batchId) {
      $batch = Bus::findBatch($batchId);
      
      if (!$batch) {
          return response()->json(['error' => '批处理不存在'], 404);
      }
      
      return response()->json([
          'id' => $batch->id,
          'name' => $batch->name,
          'totalJobs' => $batch->totalJobs,
          'pendingJobs' => $batch->pendingJobs,
          'failedJobs' => $batch->failedJobs,
          'processedJobs' => $batch->processedJobs,
          'progress' => $batch->progress(),
          'finished' => $batch->finished(),
          'cancelled' => $batch->cancelled(),
          'createdAt' => $batch->createdAt,
          'cancelledAt' => $batch->cancelledAt,
          'finishedAt' => $batch->finishedAt,
      ]);
  });
  ```

  3. **速率限制监控**
  ```php
  // 记录速率限制事件
  Queue::looping(function () {
      // 记录队列工作者启动
  });

  RateLimiter::attempted('emails', function ($job, $key) {
      // 记录尝试
      Log::debug("任务尝试: {$job->id}，键: {$key}");
  });

  RateLimiter::limited('emails', function ($job, $key) {
      // 记录被限制
      Log::warning("任务被限制: {$job->id}，键: {$key}");
  });
  ```
## 最佳实践

  1. **任务设计原则**
  ```php
  // 保持任务原子性
  class ProcessOrderTask {
      // 只处理一个订单
  }

  // 避免大任务
  class GenerateReport {
      public function handle() {
          // 分块处理数据
          User::chunk(200, function ($users) {
              foreach ($users as $user) {
                  $this->generateUserReport($user);
              }
          });
      }
  }
  ```

  2. **错误处理策略**
  ```php
  class CriticalTask implements ShouldQueue
  {
      public $backoff = [30, 60, 120]; // 重试间隔
      public $maxExceptions = 3; // 最大异常次数
      
      public function failed(Throwable $e)
      {
          // 通知管理员
          Admin::notify(new CriticalTaskFailed($this, $e));
          
          // 回滚操作
          $this->rollback();
      }
  }
  ```

  3. **性能优化**
  ```php
  // 使用批处理减少数据库查询
  class ProcessDataBatch implements ShouldQueue
  {
      public function handle()
      {
          // 一次加载所有数据
          $allData = Data::all();
          
          // 分块处理
          foreach (array_chunk($allData, 1000) as $chunk) {
              ProcessDataChunk::dispatch($chunk);
          }
      }
  }

  // 使用内存缓存
  class GenerateReport {
      protected $cache = [];
      
      public function handle() {
          // 缓存常用数据
          $this->cache['products'] = Product::all()->keyBy('id');
          
          // 处理逻辑...
      }
  }
  ```

