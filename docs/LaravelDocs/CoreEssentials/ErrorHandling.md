# 错误处理

## 一、异常处理机制

  **是什么？**
  > - Laravel的异常处理机制是捕获和处理应用程序中发生的错误和异常的系统

  **有什么用？**
  - 防止应用因错误而崩溃
  - 提供友好的错误页面
  - 记录错误信息
  - 区分开发和生产环境处理
  - 自定义错误响应

  **怎么用？**

  1. **核心文件：`app/Exceptions/Handler.php`**
  ```php
  namespace App\Exceptions;

  use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
  use Throwable;

  class Handler extends ExceptionHandler
  {
      // 忽略的异常类
      protected $dontReport = [
          \Illuminate\Auth\AuthenticationException::class,
          \Illuminate\Validation\ValidationException::class,
      ];
      
      // 自定义错误报告
      public function report(Throwable $exception)
      {
          // 特殊异常发送到Slack
          if ($exception instanceof \App\Exceptions\CriticalException) {
              \Log::channel('slack')->critical($exception->getMessage());
          }
          
          parent::report($exception);
      }
      
      // 自定义错误响应
      public function render($request, Throwable $exception)
      {
          // API请求返回JSON错误
          if ($request->expectsJson()) {
              return $this->handleApiException($exception);
          }
          
          // 自定义视图处理404错误
          if ($exception instanceof \Symfony\Component\HttpKernel\Exception\NotFoundHttpException) {
              return response()->view('errors.404', [], 404);
          }
          
          return parent::render($request, $exception);
      }
      
      // 处理API异常
      protected function handleApiException($exception)
      {
          $statusCode = method_exists($exception, 'getStatusCode') 
              ? $exception->getStatusCode() 
              : 500;
          
          return response()->json([
              'error' => [
                  'message' => $exception->getMessage(),
                  'code' => $statusCode,
              ]
          ], $statusCode);
      }
  }
  ```

  2. **自定义错误视图**
  ```bash
  # 创建错误视图目录
  mkdir -p resources/views/errors

  # 创建404错误视图
  touch resources/views/errors/404.blade.php
  ```

  ```html
  <!-- resources/views/errors/404.blade.php -->
  @extends('layouts.app')

  @section('content')
  <div class="container">
      <div class="alert alert-danger">
          <h1>404 页面不存在</h1>
          <p>抱歉，您访问的页面不存在</p>
          <a href="/" class="btn btn-primary">返回首页</a>
      </div>
  </div>
  @endsection
  ```

  3. **常见异常处理示例**
  ```php
  // 处理模型找不到异常
  public function show($id)
  {
      try {
          $user = User::findOrFail($id);
      } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
          return redirect()->route('users.index')
                          ->with('error', '用户不存在');
      }
      
      return view('users.show', compact('user'));
  }

  // 处理验证异常
  public function store(Request $request)
  {
      try {
          $validated = $request->validate([
              'email' => 'required|email|unique:users',
              'password' => 'required|min:8',
          ]);
      } catch (\Illuminate\Validation\ValidationException $e) {
          // 返回自定义错误响应
          return response()->json([
              'errors' => $e->errors(),
              'message' => '验证失败'
          ], 422);
      }
      
      // 创建用户逻辑
  }
  ```

## 二、自定义异常

  **是什么？**
  > - 根据应用需求创建的特定异常类

  **有什么用？**
  - 处理特定业务错误
  - 提供更精确的错误信息
  - 统一错误响应格式
  - 分离错误处理逻辑

  **怎么用？**

  1. **创建自定义异常**
  ```bash
  php artisan make:exception PaymentFailedException
  php artisan make:exception InsufficientCreditsException
  ```

  2. **自定义异常类示例**
  ```php
  // app/Exceptions/PaymentFailedException.php
  namespace App\Exceptions;

  use Exception;

  class PaymentFailedException extends Exception
  {
      protected $orderId;
      protected $amount;
      
      public function __construct($orderId, $amount, $message = "支付失败")
      {
          parent::__construct($message);
          $this->orderId = $orderId;
          $this->amount = $amount;
      }
      
      // 自定义报告逻辑
      public function report()
      {
          \Log::channel('payment')->error($this->getMessage(), [
              'order_id' => $this->orderId,
              'amount' => $this->amount,
          ]);
      }
      
      // 自定义响应
      public function render($request)
      {
          if ($request->expectsJson()) {
              return response()->json([
                  'error' => 'payment_failed',
                  'message' => $this->getMessage(),
                  'order_id' => $this->orderId,
                  'amount' => $this->amount,
              ], 402); // 402 Payment Required
          }
          
          return redirect('/payments')
                ->with('error', $this->getMessage())
                ->with('order_id', $this->orderId);
      }
  }
  ```

  3. **使用自定义异常**
  ```php
  // 在支付逻辑中使用
  public function processPayment($order)
  {
      try {
          $result = $this->gateway->charge($order->amount, $order->user->card);
          
          if (!$result->success) {
              throw new PaymentFailedException($order->id, $order->amount, $result->message);
          }
          
          $order->markAsPaid();
          
      } catch (PaymentFailedException $e) {
          // 异常会自动处理报告和响应
          throw $e;
      } catch (\Exception $e) {
          // 处理其他异常
          throw new PaymentFailedException($order->id, $order->amount, '支付系统错误');
      }
  }

  // 在控制器中调用
  public function payOrder(Request $request, $orderId)
  {
      $order = Order::findOrFail($orderId);
      
      try {
          $this->paymentService->processPayment($order);
          return redirect('/orders')->with('success', '支付成功！');
      } catch (PaymentFailedException $e) {
          // 异常会自动处理，这里不需要额外操作
          // 或者可以添加额外处理逻辑
          return back()->with('retry', true);
      }
  }
  ```
## 完整错误处理流程示例

  1. **全局异常处理配置**
  ```php
  // app/Exceptions/Handler.php
  public function render($request, Throwable $exception)
  {
      // API请求统一JSON响应
      if ($request->expectsJson()) {
          return response()->json([
              'success' => false,
              'error' => [
                  'code' => $this->getStatusCode($exception),
                  'message' => $this->getMessage($exception),
              ]
          ], $this->getStatusCode($exception));
      }
      
      // 自定义视图处理特定错误
      if ($exception instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
          return response()->view('errors.model-not-found', [], 404);
      }
      
      return parent::render($request, $exception);
  }

  private function getStatusCode($exception)
  {
      if (method_exists($exception, 'getStatusCode')) {
          return $exception->getStatusCode();
      }
      
      if ($exception instanceof \Illuminate\Validation\ValidationException) {
          return 422;
      }
      
      return 500;
  }

  private function getMessage($exception)
  {
      if ($exception instanceof \Illuminate\Validation\ValidationException) {
          return $exception->errors();
      }
      
      return config('app.debug') 
          ? $exception->getMessage() 
          : '服务器错误，请稍后再试';
  }
  ```

  2. **自定义API错误响应**
  ```php
  // 创建ApiException
  php artisan make:exception ApiException

  // app/Exceptions/ApiException.php
  namespace App\Exceptions;

  use Exception;

  class ApiException extends Exception
  {
      protected $data;
      protected $statusCode;
      
      public function __construct($message, $statusCode = 400, $data = [])
      {
          parent::__construct($message);
          $this->statusCode = $statusCode;
          $this->data = $data;
      }
      
      public function render()
      {
          return response()->json([
              'success' => false,
              'error' => $this->getMessage(),
              'data' => $this->data,
          ], $this->statusCode);
      }
  }

  // 使用示例
  public function getUser($id)
  {
      $user = User::find($id);
      
      if (!$user) {
          throw new ApiException('用户不存在', 404, ['id' => $id]);
      }
      
      if ($user->isBanned()) {
          throw new ApiException('用户已被封禁', 403, [
              'user_id' => $user->id,
              'banned_until' => $user->banned_until
          ]);
      }
      
      return new UserResource($user);
  }
  ```

  3. **错误通知系统**
  ```php
  // app/Exceptions/Handler.php
  public function report(Throwable $exception)
  {
      // 发送严重错误通知
      if ($this->shouldReport($exception) {
          $this->sendErrorNotification($exception);
      }
      
      parent::report($exception);
  }

  protected function sendErrorNotification(Throwable $exception)
  {
      // 排除特定异常
      if ($exception instanceof \Illuminate\Http\Exceptions\HttpResponseException) {
          return;
      }
      
      // 准备错误信息
      $message = "【严重错误】{$exception->getMessage()}";
      $context = [
          'exception' => get_class($exception),
          'file' => $exception->getFile(),
          'line' => $exception->getLine(),
          'url' => request()->fullUrl(),
          'method' => request()->method(),
          'ip' => request()->ip(),
          'user' => optional(auth()->user())->id,
      ];
      
      // 发送到不同渠道
      if ($exception instanceof \App\Exceptions\PaymentException) {
          \Log::channel('payment_slack')->critical($message, $context);
      } else {
          \Log::channel('slack')->critical($message, $context);
          \Mail::to('dev@example.com')->send(new ErrorReport($exception));
      }
  }
  ```

  4. **错误监控集成（Sentry）**
  ```bash
  composer require sentry/sentry-laravel
  ```

  ```php
  // config/sentry.php
  return [
      'dsn' => env('SENTRY_LARAVEL_DSN'),
      'environment' => env('APP_ENV'),
      'breadcrumbs' => [
          'logs' => true,
          'sql_queries' => true,
          'bindings' => true,
      ],
  ];

  // app/Exceptions/Handler.php
  public function register()
  {
      $this->reportable(function (Throwable $e) {
          if (app()->bound('sentry')) {
              app('sentry')->captureException($e);
          }
      });
  }
  ```
## 错误处理最佳实践

  1. **错误日志记录**
  ```php
  try {
      // 可能出错的代码
  } catch (\Exception $e) {
      \Log::error('操作失败', [
          'error' => $e->getMessage(),
          'file' => $e->getFile(),
          'line' => $e->getLine(),
          'request' => request()->all(),
          'user' => auth()->id(),
      ]);
      
      throw $e; // 重新抛出或处理
  }
  ```

  2. **用户友好错误信息**
  ```php
  // 在Handler.php中
  public function render($request, Throwable $e)
  {
      $userMessage = "操作失败，请稍后再试";
      
      if ($e instanceof \Illuminate\Database\QueryException) {
          $userMessage = "数据库错误，请联系管理员";
      }
      
      if ($e instanceof \App\Exceptions\BusinessLogicException) {
          $userMessage = $e->getUserMessage();
      }
      
      if ($request->expectsJson()) {
          return response()->json(['error' => $userMessage], 500);
      }
      
      return back()->with('error', $userMessage);
  }
  ```

  3. **错误页面定制**
  ```php
  // 创建500错误视图 resources/views/errors/500.blade.php
  @extends('layouts.app')

  @section('content')
  <div class="container text-center py-5">
      <h1 class="display-1">500</h1>
      <p class="lead">服务器内部错误</p>
      <p>我们的工程师已经收到通知，正在紧急修复</p>
      
      @if(config('app.debug'))
          <div class="alert alert-danger text-left mt-4">
              <strong>错误信息:</strong> {{ $exception->getMessage() }}
              <pre class="mt-2">{{ $exception->getTraceAsString() }}</pre>
          </div>
      @endif
      
      <a href="/" class="btn btn-primary mt-3">返回首页</a>
  </div>
  @endsection
  ```

  4. **异常辅助函数**
  ```php
  // 创建app/Helpers/ExceptionHelper.php
  if (!function_exists('throw_if')) {
      function throw_if($condition, $exception, ...$parameters)
      {
          if ($condition) {
              throw (is_string($exception) 
                  ? new $exception(...$parameters) 
                  : $exception;
          }
      }
  }

  // 使用示例
  public function transfer($amount)
  {
      throw_if($amount <= 0, 
          \App\Exceptions\InvalidAmountException::class,
          '转账金额必须大于0'
      );
      
      throw_if($this->balance < $amount, 
          new \App\Exceptions\InsufficientBalanceException($this->balance, $amount)
      );
      
      // 转账逻辑...
  }
  ```
## 测试错误处理

  1. **测试自定义异常**
  ```php
  public function test_payment_failed_exception()
  {
      $this->withoutExceptionHandling();
      
      try {
          // 触发支付失败
          $this->paymentService->processPayment(new Order(['amount' => 100]));
      } catch (PaymentFailedException $e) {
          $this->assertEquals('支付失败', $e->getMessage());
          $this->assertEquals(402, $e->render(request())->getStatusCode());
          return;
      }
      
      $this->fail('PaymentFailedException was not thrown');
  }
  ```

  2. **测试错误响应**
  ```php
  public function test_invalid_user_api_response()
  {
      $response = $this->getJson('/api/users/9999');
      
      $response->assertStatus(404);
      $response->assertJson([
          'success' => false,
          'error' => [
              'code' => 404,
              'message' => '用户不存在'
          ]
      ]);
  }
  ```
## 调试技巧

  1. **查看详细错误信息**
  ```php
  // 临时开启详细错误
  APP_DEBUG=true

  // 在代码中获取错误信息
  try {
      // 代码
  } catch (\Exception $e) {
      dd($e->getMessage(), $e->getTrace());
  }
  ```

  2. **记录最后SQL查询**
  ```php
  // 在Handler.php中
  public function render($request, Throwable $e)
  {
      if ($e instanceof \Illuminate\Database\QueryException) {
          \Log::error('SQL错误', [
              'sql' => $e->getSql(),
              'bindings' => $e->getBindings(),
              'message' => $e->getMessage()
          ]);
      }
      
      return parent::render($request, $e);
  }
  ```

  3. **错误追踪工具**
  ```bash
  # 安装调试工具
  composer require barryvdh/laravel-debugbar --dev
  php
  // 查看最近异常
  \Debugbar::addThrowable($exception);

  // 手动记录错误
  debugbar()->error('支付失败', $context);
  ```



