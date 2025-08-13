# 缓存基础

## 一、缓存驱动

  **是什么？**
  > - 缓存驱动是Laravel用来存储和获取缓存数据的底层实现方式

  **有什么用？**
  - 提高应用性能（减少数据库查询）
  - 减轻服务器负载
  - 存储临时数据（如API令牌）
  - 加速页面渲染

  **怎么用？**

  **步骤1：配置缓存驱动 (`.env`)**
  ```env
  # 使用文件缓存（默认）
  CACHE_DRIVER=file

  # 使用Redis缓存
  CACHE_DRIVER=redis

  # 使用Memcached缓存
  CACHE_DRIVER=memcached

  # 使用数据库缓存
  CACHE_DRIVER=database

  # 使用数组缓存（仅当前请求有效）
  CACHE_DRIVER=array
  ```

  **步骤2：配置文件 (`config/cache.php`)**
  ```php
  return [
      'default' => env('CACHE_DRIVER', 'file'),
      
      'stores' => [
          'file' => [
              'driver' => 'file',
              'path' => storage_path('framework/cache/data'),
          ],
          
          'redis' => [
              'driver' => 'redis',
              'connection' => 'cache',
          ],
          
          'memcached' => [
              'driver' => 'memcached',
              'servers' => [
                  [
                      'host' => env('MEMCACHED_HOST', '127.0.0.1'),
                      'port' => env('MEMCACHED_PORT', 11211),
                      'weight' => 100,
                  ],
              ],
          ],
          
          'database' => [
              'driver' => 'database',
              'table' => 'cache',
              'connection' => null,
          ],
      ],
      
      'prefix' => env('CACHE_PREFIX', 'laravel_cache'),
  ];
  ```

  **步骤3：创建缓存表（数据库驱动）**
  ```bash
  php artisan cache:table
  php artisan migrate
  ```

  **步骤4：使用特定驱动**
  ```php
  use Illuminate\Support\Facades\Cache;

  // 使用默认驱动
  Cache::put('key', 'value');

  // 使用特定驱动
  Cache::store('redis')->put('key', 'value');
  ```

## 二、基本缓存操作

  **是什么？**
  > - 对缓存数据进行增删改查的基本操作

  **有什么用？**
  - 存储和获取数据
  - 检查数据是否存在
  - 设置过期时间
  - 永久存储或自动删除

  **怎么用？**

  1. **存储数据**
  ```php
  use Illuminate\Support\Facades\Cache;

  // 基本存储（10分钟）
  Cache::put('user_1', $user, 600);

  // 存储永久数据（需手动删除）
  Cache::forever('site_settings', $settings);

  // 如果不存在则存储
  Cache::add('new_user', $user, 60); // 60秒

  // 使用时间对象
  Cache::put('weekly_report', $report, now()->addDays(7));
  ```

  2. **获取数据**
  ```php
  // 获取数据
  $user = Cache::get('user_1');

  // 获取数据或返回默认值
  $value = Cache::get('key', 'default');

  // 获取数据或执行回调
  $posts = Cache::get('latest_posts', function () {
      return Post::latest()->take(10)->get();
  });

  // 获取并删除
  $value = Cache::pull('temp_token');

  // 检查是否存在
  if (Cache::has('api_token')) {
      // 执行操作
  }
  ```

  3. **删除数据**
  ```php
  // 删除单个
  Cache::forget('user_1');

  // 删除多个
  Cache::forget(['key1', 'key2']);

  // 清空整个缓存
  Cache::flush();
  ```

  4. **递增/递减**
  ```php
  // 递增
  Cache::increment('page_views');
  Cache::increment('user_1_views', 5); // 增加5

  // 递减
  Cache::decrement('credits');
  Cache::decrement('user_1_credits', 10); // 减少10
  ```
  ---
  **完整缓存使用示例**

  1. **缓存数据库查询结果**
  ```php
  public function getPopularPosts()
  {
      return Cache::remember('popular_posts', 3600, function () {
          return Post::withCount('comments')
                    ->orderByDesc('comments_count')
                    ->take(10)
                    ->get();
      });
  }
  ```

  2. **缓存API响应**
  ```php
  public function getWeatherData($city)
  {
      $key = "weather_{$city}";
      
      if (Cache::has($key)) {
          return Cache::get($key);
      }
      
      $response = Http::get("https://api.weather.com/{$city}");
      $data = $response->json();
      
      Cache::put($key, $data, now()->addHour());
      
      return $data;
  }
  ```

  3. **缓存用户操作频率**
  ```php
  public function sendMessage(Request $request)
  {
      $user = $request->user();
      $key = "user_{$user->id}_message_count";
      
      // 检查1分钟内发送次数
      $count = Cache::get($key, 0);
      if ($count >= 5) {
          return response()->json(['error' => '操作过于频繁'], 429);
      }
      
      // 发送消息逻辑...
      $this->send($request->message);
      
      // 更新计数器
      Cache::put($key, $count + 1, now()->addMinute());
      
      return response()->json(['success' => true]);
  }
  ```
  ---
  **缓存标签（高级用法）**

  1. **使用标签**
  ```php
  // 存储带标签的数据
  Cache::tags(['posts', 'popular'])->put('post_1', $post, 3600);
  Cache::tags(['posts', 'popular'])->put('post_2', $post, 3600);

  // 获取带标签的数据
  $post = Cache::tags(['posts', 'popular'])->get('post_1');

  // 清除特定标签的所有缓存
  Cache::tags('posts')->flush(); // 清除所有posts标签的缓存
  ```

  2. **配置支持标签的驱动**
  ```php
  // 在config/cache.php中
  'stores' => [
      'redis' => [
          'driver' => 'redis',
          'connection' => 'cache',
          'options' => [
              'prefix' => 'laravel_cache:',
              'tags' => true, // 启用标签支持
          ],
      ],
  ],
  ```
  ---
  **缓存事件**

  1. **监听缓存事件**
  ```php
  // 在EventServiceProvider中注册
  protected $listen = [
      'Illuminate\Cache\Events\CacheHit' => [
          'App\Listeners\LogCacheHit',
      ],
      'Illuminate\Cache\Events\CacheMissed' => [
          'App\Listeners\LogCacheMiss',
      ],
      'Illuminate\Cache\Events\KeyForgotten' => [
          'App\Listeners\LogKeyForgotten',
      ],
      'Illuminate\Cache\Events\KeyWritten' => [
          'App\Listeners\LogKeyWritten',
      ],
  ];
  ```

  2. **创建事件监听器**
  ```bash
  php artisan make:listener LogCacheHit
  ```

  ```php
  namespace App\Listeners;

  use Illuminate\Cache\Events\CacheHit;

  class LogCacheHit
  {
      public function handle(CacheHit $event)
      {
          \Log::info("缓存命中: {$event->key}", [
              'tags' => $event->tags,
          ]);
      }
  }
  ```
  ---
  **缓存最佳实践**

  1. **缓存策略选择**
  ```php
  // 适合缓存的数据：
  // - 频繁读取但很少修改的数据
  // - 计算复杂的操作结果
  // - 第三方API响应

  // 不适合缓存的数据：
  // - 用户特定且经常变化的数据
  // - 需要实时更新的数据
  // - 敏感数据（除非加密）
  ```

  2. **缓存键命名规范**
  ```php
  // 好的缓存键
  Cache::put('user_1_profile', $data); // 清晰明确
  Cache::put('posts:popular:2023-10', $data); // 使用分隔符

  // 不好的缓存键
  Cache::put('data', $data); // 太通用
  Cache::put('user_data_' . $id, $data); // 缺少上下文
  ```

  3. **缓存失效策略**
  ```php
  // 时间过期
  Cache::put('key', $value, 3600); // 1小时后过期

  // 事件驱动失效
  // 当用户更新资料时清除缓存
  User::updated(function ($user) {
      Cache::forget("user_{$user->id}_profile");
  });

  // 手动失效
  public function updateProfile(Request $request)
  {
      // 更新逻辑...
      $user->update($request->all());
      
      // 清除缓存
      Cache::forget("user_{$user->id}_profile");
      
      return redirect('/profile');
  }
  ```

  4. **缓存预热**
  ```php
  // 在Artisan命令中预热缓存
  protected $signature = 'cache:warmup';

  public function handle()
  {
      // 预热热门数据
      Cache::remember('popular_posts', 3600, function () {
          return Post::popular()->get();
      });
      
      // 预热配置数据
      Cache::remember('site_settings', 86400, function () {
          return Setting::all()->pluck('value', 'key');
      });
      
      $this->info('缓存预热完成！');
  }
  ```
  ---
  **缓存测试**

  1. **测试缓存操作**
  ```php
  public function testCacheUsage()
  {
      // 测试数据存储
      Cache::put('test_key', 'test_value', 10);
      $this->assertEquals('test_value', Cache::get('test_key'));
      
      // 测试数据过期
      Cache::put('temp_key', 'temp_value', 1);
      sleep(2);
      $this->assertNull(Cache::get('temp_key'));
      
      // 测试缓存回调
      $value = Cache::remember('callback_key', 10, function () {
          return 'callback_value';
      });
      $this->assertEquals('callback_value', $value);
  }
  ```

  2. **模拟缓存**
  ```php
  public function testWithMockedCache()
  {
      Cache::shouldReceive('get')
          ->once()
          ->with('key')
          ->andReturn('value');
      
      $result = Cache::get('key');
      $this->assertEquals('value', $result);
  }
  ```
  ---
  **缓存调试技巧**

  1. **查看缓存内容**
  ```bash
  # 文件缓存
  ls storage/framework/cache/data/

  # Redis缓存
  redis-cli
  KEYS laravel_cache:*
  GET laravel_cache:popular_posts
  ```

  2. **清除缓存**
  ```bash
  # 清除应用缓存
  php artisan cache:clear

  # 清除路由缓存
  php artisan route:clear

  # 清除配置缓存
  php artisan config:clear

  # 清除所有缓存
  php artisan optimize:clear
  ```

  3. **缓存性能监控**
  ```php
  // 记录缓存命中率
  $start = microtime(true);
  $data = Cache::remember('expensive_data', 3600, function () {
      // 耗时操作...
  });
  $time = microtime(true) - $start;

  Log::debug("缓存操作耗时: {$time}秒", [
      'key' => 'expensive_data',
      'hit' => Cache::has('expensive_data') ? 'hit' : 'miss'
  ]);
  ```



