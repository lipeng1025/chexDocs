# 日志

## 一、日志通道配置

  **是什么？**
  > - 日志通道是Laravel用来记录应用日志的不同方式（文件、Slack、云服务等）

  **有什么用？**
  - 记录应用运行情况
  - 收集错误信息
  - 发送重要通知
  - 按需求存储日志

  **怎么用？**

  **步骤1：配置文件 (`config/logging.php`)**
  ```php
  return [
      'default' => env('LOG_CHANNEL', 'stack'),
      
      'channels' => [
          // 堆栈通道（组合多个通道）
          'stack' => [
              'driver' => 'stack',
              'channels' => ['single', 'slack'],
              'ignore_exceptions' => false,
          ],
          
          // 单一日志文件
          'single' => [
              'driver' => 'single',
              'path' => storage_path('logs/laravel.log'),
              'level' => env('LOG_LEVEL', 'debug'),
          ],
          
          // 每日日志文件（自动按日期分割）
          'daily' => [
              'driver' => 'daily',
              'path' => storage_path('logs/laravel.log'),
              'level' => env('LOG_LEVEL', 'debug'),
              'days' => 14, // 保留14天
          ],
          
          // Slack通知
          'slack' => [
              'driver' => 'slack',
              'url' => env('LOG_SLACK_WEBHOOK_URL'),
              'username' => 'Laravel Log',
              'emoji' => ':boom:',
              'level' => 'error', // 只发送错误及以上级别
          ],
          
          // 系统日志
          'syslog' => [
              'driver' => 'syslog',
              'level' => env('LOG_LEVEL', 'debug'),
          ],
          
          // 错误邮件
          'emergency' => [
              'driver' => 'single',
              'path' => storage_path('logs/laravel.log'),
              'level' => 'debug',
          ],
      ],
  ];
  ```

  **步骤2：环境变量配置 (.env)**
  ```env
  # 默认日志通道
  LOG_CHANNEL=stack

  # 日志级别
  LOG_LEVEL=debug

  # Slack Webhook URL
  LOG_SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
  ```

  **步骤3：使用不同通道**
  ```php
  // 使用默认通道
  Log::info('用户登录成功');

  // 使用特定通道
  Log::channel('slack')->alert('服务器负载过高！');
  ```

## 二、日志级别使用

  **是什么？**
  > - 日志级别表示日志信息的重要性，从低到高分为8个级别

  **有什么用？**
  - 过滤不重要的日志
  - 区分日志紧急程度
  - 按需处理不同级别日志
  - 减少日志存储量

  **日志级别说明**：
  - **debug** - 调试信息（最详细）
  - **info** - 普通信息（应用运行状态）
  - **notice** - 重要但非错误事件
  - **warning** - 警告（可能有问题）
  - **error** - 运行时错误（需要关注）
  - **critical** - 严重错误（立即处理）
  - **alert** - 需要立即行动的错误
  - **emergency** - 系统不可用（最高级别）

  **怎么用？**

  1. **记录不同级别日志**
  ```php
  use Illuminate\Support\Facades\Log;

  // 调试信息
  Log::debug('SQL查询:', ['query' => DB::getQueryLog()]);

  // 普通信息
  Log::info('用户登录', ['user_id' => auth()->id()]);

  // 警告
  Log::warning('磁盘空间不足', ['free' => disk_free_space('/')]);

  // 错误
  try {
      // 可能出错的代码
  } catch (Exception $e) {
      Log::error('处理订单失败', [
          'error' => $e->getMessage(),
          'order_id' => $order->id
      ]);
  }

  // 严重错误
  Log::critical('数据库连接失败', ['error' => $connectionError]);

  // 紧急情况
  Log::emergency('系统不可用', ['reason' => '服务器宕机']);
  ```

  2. **上下文信息**
  ```php
  // 添加额外上下文信息
  Log::withContext([
      'request_id' => uniqid(),
      'ip' => request()->ip(),
  ])->info('请求开始');

  // 所有后续日志都会包含这些上下文
  Log::info('处理请求');
  ```

  3. **格式化日志信息**
  ```php
  // 自定义日志格式
  'channels' => [
      'custom' => [
          'driver' => 'single',
          'path' => storage_path('logs/custom.log'),
          'formatter' => Monolog\Formatter\JsonFormatter::class,
      ],
  ],

  // 使用格式化器
  Log::channel('custom')->info('订单创建', [
      'order_id' => 123,
      'amount' => 99.99
  ]);

  // 输出结果（JSON格式）:
  // {"message":"订单创建","context":{"order_id":123,"amount":99.99},"level":200}
  ```
## 完整日志应用示例

  1. **记录用户活动**
  ```php
  class UserController extends Controller
  {
      public function updateProfile(Request $request)
      {
          try {
              $user = auth()->user();
              $user->update($request->all());
              
              Log::info('用户资料更新', [
                  'user_id' => $user->id,
                  'changes' => $request->all()
              ]);
              
              return redirect('/profile')->with('success', '资料已更新');
          } catch (Exception $e) {
              Log::error('更新用户资料失败', [
                  'user_id' => auth()->id(),
                  'error' => $e->getMessage(),
                  'request' => $request->all()
              ]);
              
              return back()->with('error', '更新失败');
          }
      }
  }
  ```

  2. **监控任务运行**
  ```php
  class ProcessPodcast implements ShouldQueue
  {
      use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
      
      public function handle()
      {
          Log::info('开始处理播客', ['podcast_id' => $this->podcast->id]);
          
          try {
              // 处理逻辑...
              $this->process();
              
              Log::info('播客处理完成', [
                  'podcast_id' => $this->podcast->id,
                  'duration' => $duration
              ]);
          } catch (Exception $e) {
              Log::error('处理播客失败', [
                  'podcast_id' => $this->podcast->id,
                  'error' => $e->getMessage(),
                  'trace' => $e->getTraceAsString()
              ]);
              
              // 重试任务
              $this->release(60); // 60秒后重试
          }
      }
  }
  ```

  3. **自定义日志通道**
  ```php
  // 创建Telegram日志通道
  'channels' => [
      'telegram' => [
          'driver' => 'monolog',
          'handler' => Monolog\Handler\TelegramBotHandler::class,
          'handler_with' => [
              'apiKey' => env('TELEGRAM_BOT_TOKEN'),
              'channel' => env('TELEGRAM_CHAT_ID'),
          ],
          'level' => 'critical',
          'formatter' => Monolog\Formatter\LineFormatter::class,
          'formatter_with' => [
              'format' => "%message%\n%context%"
          ],
      ],
  ],

  // 使用Telegram通道
  Log::channel('telegram')->critical('数据库宕机！');
  ```
  ---
  **高级日志技巧**

  1. **日志文件分割**
  ```php
  'channels' => [
      'app' => [
          'driver' => 'daily',
          'path' => storage_path('logs/app.log'),
          'level' => 'debug',
          'days' => 30, // 保留30天日志
          'permission' => 0644,
      ],
      
      'request' => [
          'driver' => 'daily',
          'path' => storage_path('logs/request.log'),
          'level' => 'info',
          'days' => 7,
      ],
  ],
  ```

  2. **日志过滤**
  ```php
  // 创建日志处理器
  class SensitiveDataProcessor
  {
      public function __invoke($record)
      {
          // 过滤密码字段
          if (isset($record['context']['password'])) {
              $record['context']['password'] = '***';
          }
          
          // 过滤信用卡号
          if (isset($record['context']['credit_card'])) {
              $record['context']['credit_card'] = substr_replace(
                  $record['context']['credit_card'], 
                  '****-****-****-', 
                  0, 
                  15
              );
          }
          
          return $record;
      }
  }

  // 在通道中使用
  'channels' => [
      'secure' => [
          'driver' => 'single',
          'path' => storage_path('logs/secure.log'),
          'tap' => [App\Logging\SensitiveDataProcessor::class],
      ],
  ],
  ```

  3. **日志分析**
  ```php
  // 分析错误日志
  public function analyzeLogs()
  {
      $logPath = storage_path('logs/laravel.log');
      $errors = [];
      
      // 读取日志文件
      $handle = fopen($logPath, 'r');
      if ($handle) {
          while (($line = fgets($handle)) !== false) {
              // 查找错误行
              if (strpos($line, 'local.ERROR') !== false) {
                  // 提取错误信息
                  preg_match('/message: (.+?) /', $line, $matches);
                  if (!empty($matches[1])) {
                      $error = $matches[1];
                      $errors[$error] = ($errors[$error] ?? 0) + 1;
                  }
              }
          }
          fclose($handle);
      }
      
      // 按频率排序
      arsort($errors);
      
      return $errors;
  }
  ```
  ---
  **日志最佳实践**

  1. **日志内容规范**
  ```php
  // 好的日志
  Log::info('用户注册成功', [
      'user_id' => $user->id,
      'email' => $user->email
  ]);

  // 不好的日志
  Log::info('用户注册'); // 缺少上下文
  Log::info('用户注册 - ID: '.$user->id.' Email: '.$user->email); // 未结构化
  ```

  2. **日志级别选择**
  ```php
  // 适当选择级别
  if ($errorCount > 100) {
      Log::emergency('错误数量超过阈值', ['count' => $errorCount]);
  } elseif ($errorCount > 50) {
      Log::critical('高错误率', ['count' => $errorCount]);
  } else {
      Log::warning('错误数量增加', ['count' => $errorCount]);
  }
  ```

  3. **敏感信息处理**
  ```php
  // 不要记录敏感信息
  Log::info('用户登录', [
      'user_id' => $user->id,
      // 'password' => $request->password, // 禁止！
  ]);

  // 使用处理器过滤敏感数据
  Log::channel('secure')->info('支付处理', [
      'card_number' => '4111111111111111',
      'cvv' => '123'
  ]);
  ```

  4. **性能优化**
  ```php
  // 避免在高频循环中记录详细日志
  foreach ($users as $user) {
      // 不要这样写！
      // Log::debug('处理用户', ['user' => $user]);
      
      // 改为汇总记录
      $processed++;
  }
  Log::info('批量处理完成', ['total' => count($users), 'processed' => $processed]);
  ```
  ---
  **日志工具与集成**

  1. **使用Log Viewer包**
  ```bash
  # 安装日志查看器
  composer require arcanedev/log-viewer

  # 发布资源
  php artisan log-viewer:publish

  # 访问日志面板
  http://your-app/log-viewer
  ```

  2. **集成Sentry错误监控**
  ```bash
  # 安装Sentry SDK
  composer require sentry/sentry-laravel

  # 配置Sentry
  SENTRY_LARAVEL_DSN=https://yourkey@sentry.io/yourproject

  # 在App/Exceptions/Handler.php中
  public function register()
  {
      $this->reportable(function (Throwable $e) {
          if (app()->bound('sentry')) {
              app('sentry')->captureException($e);
          }
      });
  }
  ```

  3. **集成ELK Stack**
  ```php
  // 配置Logstash通道
  'logstash' => [
      'driver' => 'monolog',
      'handler' => Monolog\Handler\SocketHandler::class,
      'handler_with' => [
          'connectionString' => 'tcp://logstash:5000',
      ],
      'formatter' => Monolog\Formatter\LogstashFormatter::class,
      'formatter_with' => [
          'applicationName' => 'laravel-app',
      ],
  ],

  // 使用
  Log::channel('logstash')->info('应用事件', ['event' => 'user_login']);
  ```
  ---
  **日志测试**

  1. **测试日志记录**
  ```php
  public function testLoginLogging()
  {
      Log::shouldReceive('info')
          ->once()
          ->with('用户登录', ['user_id' => 1, 'email' => 'test@example.com']);
      
      $user = User::factory()->create(['email' => 'test@example.com']);
      $this->post('/login', [
          'email' => 'test@example.com',
          'password' => 'password'
      ]);
  }
  ```

  2. **模拟日志异常**
  ```php
  public function testErrorLogging()
  {
      Log::shouldReceive('error')
          ->once()
          ->withArgs(function ($message, $context) {
              return str_contains($message, '支付失败') &&
                    $context['order_id'] === 123;
          });
      
      $this->post('/pay', ['order_id' => 123]);
  }
  ```
  ---
  **日志调试技巧**

  1. **临时增加日志详细程度**
  ```bash
  # 临时设置更高日志级别
  php artisan config:set app.log_level=debug
  ```

  2. **查看实时日志**
  ```bash
  # 查看最新日志
  tail -f storage/logs/laravel.log

  # 过滤错误日志
  tail -f storage/logs/laravel.log | grep "ERROR"
  ```

  3. **日志文件管理**
  ```bash
  # 清空日志文件
  echo "" > storage/logs/laravel.log

  # 压缩旧日志
  tar -czvf logs-$(date +%F).tar.gz storage/logs/laravel-*
  ```



