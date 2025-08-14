# 服务容器进阶
## 概念

  **什么是服务容器进阶？**
  > - 服务容器进阶就是给你的应用依赖管理系统装上"智能大脑"，让它不仅能自动解决依赖关系，还能根据场景智能选择实现，甚至动态扩展功能。

  **有什么用？**
  - 根据上下文注入不同实现
  - 动态扩展服务功能
  - 实现更灵活的依赖管理
  - 解决复杂场景下的依赖问题
  - 提高代码的可测试性和可维护性

## 一、上下文绑定（Contextual Binding）

  **是什么？**
  > - 上下文绑定就是让容器根据使用场景（比如在哪个类中使用）来决定注入哪个具体的依赖实现。

  **有什么用？**
  - 同一个接口在不同地方注入不同实现
  - 根据业务逻辑动态选择依赖
  - 避免创建多个类似的服务
  - 提高代码的灵活性和可维护性

  **怎么用？**

  1. **基本使用**
  ```php
  // 定义接口
  interface PaymentGateway {
      public function charge($amount);
  }

  // 实现类1
  class StripeGateway implements PaymentGateway {
      public function charge($amount) {
          // Stripe支付逻辑
      }
  }

  // 实现类2
  class PayPalGateway implements PaymentGateway {
      public function charge($amount) {
          // PayPal支付逻辑
      }
  }

  // 在服务提供者中注册
  public function register()
  {
      // 默认绑定
      $this->app->bind(PaymentGateway::class, StripeGateway::class);
      
      // 上下文绑定：当在CheckoutController中使用时
      $this->app->when(CheckoutController::class)
                ->needs(PaymentGateway::class)
                ->give(PayPalGateway::class);
      
      // 上下文绑定：当在SubscriptionController中使用时
      $this->app->when(SubscriptionController::class)
                ->needs(PaymentGateway::class)
                ->give(StripeGateway::class);
  }
  ```

  2. **带参数的上下文绑定**
  ```php
  // 在服务提供者中
  public function register()
  {
      $this->app->when(PhotoController::class)
                ->needs('$maxSize')
                ->give(5000); // 注入值
      
      $this->app->when(ReportController::class)
                ->needs('$timezone')
                ->give(function () {
                    return config('app.timezone');
                }); // 注入闭包返回值
  }
  ```

  3. **实际应用：多语言处理**
  ```php
  // 定义翻译接口
  interface Translator {
      public function translate($text);
  }

  // 英文翻译
  class EnglishTranslator implements Translator {
      public function translate($text) {
          // 英文翻译逻辑
      }
  }

  // 中文翻译
  class ChineseTranslator implements Translator {
      public function translate($text) {
          // 中文翻译逻辑
      }
  }

  // 在服务提供者中根据用户语言绑定
  public function register()
  {
      $this->app->when(ContentController::class)
                ->needs(Translator::class)
                ->give(function ($app) {
                    $locale = $app['request']->getPreferredLanguage();
                    
                    if ($locale === 'zh-CN') {
                        return new ChineseTranslator;
                    }
                    
                    return new EnglishTranslator;
                });
  }
  ```

  4. **实际应用：不同环境使用不同服务**
  ```php
  // 在服务提供者中
  public function register()
  {
      $this->app->when(ImageUploader::class)
                ->needs(ImageStorage::class)
                ->give(function () {
                    if (config('filesystems.default') === 's3') {
                        return new S3Storage;
                    }
                    
                    return new LocalStorage;
                });
  }
  ```

## 二、容器扩展（Container Extension）

  **是什么？**
  > - 容器扩展就是给容器添加新功能或者修改容器行为，就像给你的"智能管家"安装新技能。

  **有什么用？**
  - 动态修改已绑定的服务
  - 在对象解析前后添加逻辑
  - 实现自定义解析策略
  - 扩展容器功能
  - 增强容器的灵活性

  **怎么用？**

  1. **扩展已绑定的服务**
  ```php
  // 在服务提供者中
  public function boot()
  {
      // 扩展日志服务
      $this->app->extend('log', function ($log, $app) {
          // 添加自定义日志处理器
          $log->pushHandler(new CustomLogHandler());
          return $log;
      });
      
      // 扩展缓存服务
      $this->app->extend('cache', function ($cache, $app) {
          $cache->setDefaultDriver('redis');
          return $cache;
      });
  }
  ```

  2. **修改解析过程（使用resolving方法）**
  ```php
  // 在服务提供者中
  public function register()
  {
      $this->app->resolving(Validator::class, function ($validator, $app) {
          // 添加自定义验证规则
          $validator->addExtension('custom_rule', function ($attribute, $value, $parameters) {
              // 验证逻辑
          });
      });
      
      // 所有对象解析时都会触发
      $this->app->resolving(function ($object, $app) {
          if (method_exists($object, 'initialize')) {
              $object->initialize();
          }
      });
  }
  ```

  3. **实际应用：为所有控制器添加中间件**
  ```php
  // 在AppServiceProvider中
  public function boot()
  {
      $this->app->resolving(Controller::class, function ($controller, $app) {
          // 给所有控制器添加一个中间件
          $controller->middleware(LogRequestMiddleware::class);
      });
  }
  ```

  4. **实际应用：自动注入当前用户**
  ```php
  // 在服务提供者中
  public function register()
  {
      $this->app->resolving(ReportGenerator::class, function ($generator, $app) {
          // 注入当前用户
          $generator->setUser($app['auth']->user());
      });
  }
  ```

  5. **自定义解析器**
  ```php
  // 在服务提供者中
  public function register()
  {
      $this->app->bind(Connection::class, function ($app, $parameters) {
          // 根据参数动态创建连接
          return new Connection($parameters['host']);
      });
  }

  // 使用
  $connection = app(Connection::class, ['host' => 'db.example.com']);
  ```
## 完整示例：电商支付系统

  1. **上下文绑定支付网关**
  ```php
  // 在PaymentServiceProvider中
  public function register()
  {
      // 普通用户使用Stripe
      $this->app->when(CheckoutController::class)
                ->needs(PaymentGateway::class)
                ->give(StripeGateway::class);
      
      // VIP用户使用PayPal
      $this->app->when(VipCheckoutController::class)
                ->needs(PaymentGateway::class)
                ->give(PayPalGateway::class);
      
      // 企业用户使用银行转账
      $this->app->when(EnterpriseCheckoutController::class)
                ->needs(PaymentGateway::class)
                ->give(BankTransferGateway::class);
  }
  ```

  2. **扩展支付网关**
  ```php
  // 在PaymentServiceProvider中
  public function boot()
  {
      // 扩展Stripe网关
      $this->app->extend(StripeGateway::class, function ($gateway, $app) {
          // 添加日志记录功能
          $gateway->setLogger($app->make(LoggerInterface::class));
          return $gateway;
      });
      
      // 在解析任何支付网关时添加监控
      $this->app->resolving(PaymentGateway::class, function ($gateway) {
          $gateway->setMonitor(new PaymentMonitor);
      });
  }
  ```

  3. **使用自定义解析参数**
  ```php
  // 创建支持多币种的支付网关
  $this->app->bind(MultiCurrencyGateway::class, function ($app, $parameters) {
      return new MultiCurrencyGateway(
          $parameters['currency'] ?? 'USD'
      );
  });

  // 在控制器中使用
  public function checkout()
  {
      // 根据用户选择币种
      $currency = session('currency', 'USD');
      $gateway = app(MultiCurrencyGateway::class, ['currency' => $currency]);
      
      $gateway->charge(100);
  }
  ```

  4. **解析过程添加日志**
  ```php
  // 在AppServiceProvider中
  public function boot()
  {
      // 记录所有支付网关的解析
      $this->app->resolving(PaymentGateway::class, function ($gateway, $app) {
          $app['log']->info("PaymentGateway resolved: ".get_class($gateway));
      });
  }
  ```
## 常见问题解答

  **Q：上下文绑定和普通绑定有什么区别？**  
  A：普通绑定是全局的，上下文绑定只在特定类中生效。

  **Q：extend和bind有什么区别？**  
  A：bind是定义绑定，extend是修改已经绑定的实例。

  **Q：resolving回调会执行多次吗？**  
  A：是的，每次解析实例时都会执行。

  **Q：如何绑定单例的上下文绑定？**  
  A：使用singleton方法：

  ```php
  $this->app->when(ReportGenerator::class)
            ->needs('$config')
            ->giveSingleton(ReportConfig::class);
  ```

  **Q：容器扩展会影响性能吗？**  
  A：合理使用影响很小，避免在扩展中做耗时操作。

  **Q：如何替换容器中的实例？**  
  A：使用instance方法：

  ```php
  $this->app->instance(Abstract::class, new Concrete);
  ```

  **Q：如何判断容器中是否有绑定？**
  A：使用bound方法：

  ```php
  if ($this->app->bound(Translator::class)) {
      // 有绑定
  }
  ```
