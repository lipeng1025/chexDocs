# 缓存进阶
## 概念

  **什么是缓存进阶？**
  > - 缓存进阶就是给你的应用缓存系统装上"涡轮增压器"，让它在高并发、复杂业务场景下表现更出色，就像给普通汽车加装赛车级引擎一样。

  **有什么用？**
  - 批量管理相关缓存项
  - 防止缓存雪崩和击穿
  - 实现高性能的并发控制
  - 解决缓存一致性问题
  - 提升复杂缓存场景的处理能力

## 一、缓存标签（Cache Tags）

  **是什么？**
  > - 缓存标签就像给缓存项贴上"分类标签"，可以批量管理同一类别的缓存，比如把所有用户相关的缓存归为一组。

  **有什么用？**
  - 批量清除相关缓存
  - 按业务逻辑组织缓存
  - 避免手动维护缓存键列表
  - 提高缓存清理效率
  - 保持缓存数据一致性

  **怎么用？**

  1. **存储带标签的缓存**
  ```php
  // 存储用户相关缓存
  Cache::tags(['user', 'profile'])->put('user_1_profile', $profileData, 3600);

  // 存储文章相关缓存
  Cache::tags(['post', 'content'])->put('post_100_content', $postContent, 1800);
  ```

  2. **获取带标签的缓存**
  ```php
  $profile = Cache::tags(['user', 'profile'])->get('user_1_profile');
  ```

  3. **清除整个标签的缓存**
  ```php
  // 清除所有带'user'标签的缓存
  Cache::tags('user')->flush();

  // 清除多个标签的缓存
  Cache::tags(['post', 'content'])->flush();
  ```

  4. **实际应用：电商商品缓存管理**
  ```php
  // 存储商品详情
  Cache::tags(['products', 'product_123'])->put('product_123_details', $details, 3600);

  // 存储商品评论
  Cache::tags(['products', 'product_123', 'reviews'])->put('product_123_reviews', $reviews, 1800);

  // 当商品更新时
  public function updateProduct(Product $product, $data)
  {
      // 更新数据库
      $product->update($data);
      
      // 清除该商品所有相关缓存
      Cache::tags(['product_'.$product->id])->flush();
  }
  ```

  5. **注意事项**
  - 标签功能只支持：Redis, Memcached等驱动
  - 文件缓存等不支持标签
  - 标签嵌套最多2层（取决于驱动）

## 二、原子锁（Atomic Locks）

  **是什么？**
  > - 原子锁就像给缓存操作加上"安全锁"，防止多个进程同时修改同一资源，避免数据错乱。

  **有什么用？**
  - 防止缓存击穿（大量请求同时访问失效缓存）
  - 避免并发重复更新
  - 实现分布式锁
  - 确保操作原子性
  - 控制资源访问顺序

  **怎么用？**

  1. **基础锁使用**
  ```php
  // 获取锁（最多等待5秒，锁定10秒自动释放）
  $lock = Cache::lock('update_price', 10);

  if ($lock->get()) {
      try {
          // 执行需要加锁的操作
          $product->updatePrice();
      } finally {
          // 释放锁
          $lock->release();
      }
  } else {
      // 获取锁失败
      abort(423, 'Resource busy');
  }
  ```

  2. **阻塞锁（等待直到获取）**
  ```php
  Cache::lock('process_order')->block(10, function () {
      // 这个回调会一直等待直到获取锁（最多等10秒）
      // 执行需要加锁的操作
      processOrder();
  });
  ```

  3. **实际应用：防止缓存击穿**
  ```php
  public function getHotProductData($productId)
  {
      $key = "product_{$productId}_data";
      
      // 尝试获取缓存
      if (Cache::has($key)) {
          return Cache::get($key);
      }
      
      // 获取锁（最多等待1秒，锁定5秒）
      $lock = Cache::lock($key.'_lock', 5);
      
      try {
          // 尝试获取锁（最多等待1秒）
          if ($lock->get(1)) {
              // 再次检查缓存（可能其他进程已经更新）
              if (Cache::has($key)) {
                  return Cache::get($key);
              }
              
              // 从数据库获取数据
              $data = Product::find($productId)->load('details', 'reviews');
              
              // 存储缓存
              Cache::put($key, $data, 3600);
              
              return $data;
          }
          
          // 获取锁失败，等待并重试
          sleep(1);
          return $this->getHotProductData($productId);
      } finally {
          // 释放锁
          optional($lock)->release();
      }
  }
  ```

  4. **实际应用：秒杀库存控制**
  ```php
  public function seckill($productId)
  {
      $lock = Cache::lock("seckill_{$productId}", 3);
      
      if (!$lock->get()) {
          return response()->json(['error' => '系统繁忙，请重试'], 423);
      }
      
      try {
          $product = Product::find($productId);
          
          if ($product->stock <= 0) {
              return response()->json(['error' => '已售罄']);
          }
          
          // 减少库存
          $product->decrement('stock');
          
          // 创建订单
          $order = Order::create([
              'user_id' => auth()->id(),
              'product_id' => $productId,
              'status' => 'paid'
          ]);
          
          return response()->json(['order_id' => $order->id]);
      } finally {
          $lock->release();
      }
  }
  ```

  5. **锁的自动释放**
  ```php
  // 使用block方法会自动释放锁
  Cache::lock('process')->block(10, function () {
      // 执行任务...
      // 锁会在回调结束后自动释放
  });

  // 手动释放
  $lock->release();
  ```
## 完整示例：电商系统缓存优化

  1. **商品详情页缓存策略**
  ```php
  public function showProduct($id)
  {
      $cacheKey = "product_{$id}_full";
      $lockKey = "product_{$id}_lock";
      
      // 尝试获取缓存
      if ($data = Cache::tags(["product_{$id}"])->get($cacheKey)) {
          return view('product.show', $data);
      }
      
      // 获取锁（最多等待500毫秒）
      $lock = Cache::lock($lockKey, 5);
      
      if ($lock->get(0.5)) {
          try {
              // 再次检查缓存
              if ($data = Cache::tags(["product_{$id}"])->get($cacheKey)) {
                  return view('product.show', $data);
              }
              
              // 从数据库获取
              $product = Product::with('details', 'reviews', 'images')->find($id);
              
              if (!$product) {
                  abort(404);
              }
              
              // 处理数据
              $data = [
                  'product' => $product,
                  'related' => Product::where('category_id', $product->category_id)
                                      ->limit(6)
                                      ->get()
              ];
              
              // 存储缓存（带标签）
              Cache::tags(["product_{$id}", 'products'])
                  ->put($cacheKey, $data, 3600);
              
              return view('product.show', $data);
          } finally {
              $lock->release();
          }
      }
      
      // 获取锁失败时直接查询数据库
      $product = Product::find($id);
      return view('product.show', ['product' => $product]);
  }
  ```

  2. **缓存清理策略**
  ```php
  // 当商品更新时
  public function update(Product $product, Request $request)
  {
      // 更新数据库
      $product->update($request->validated());
      
      // 清除该商品所有缓存
      Cache::tags(["product_{$product->id}"])->flush();
      
      // 清除相关分类缓存
      Cache::tags(['category_'.$product->category_id])->flush();
  }

  // 定时清理过期缓存
  // app/Console/Kernel.php
  protected function schedule(Schedule $schedule)
  {
      $schedule->command('cache:prune-tags')->daily();
  }
  ```

  3. **批量缓存预热**
  ```php
  // 预热热门商品缓存
  public function warmUpCache()
  {
      $hotProducts = Product::where('views', '>', 1000)->get();
      
      foreach ($hotProducts as $product) {
          // 使用锁防止并发预热
          Cache::lock("warm_up_{$product->id}", 10)->block(5, function () use ($product) {
              $this->getProductData($product->id);
          });
      }
  }
  ```
## 高级技巧：多级缓存策略

  1. **内存缓存 + Redis 二级缓存**
  ```php
  public function getProductData($id)
  {
      // 第一层：内存缓存（当前请求有效）
      static $localCache = [];
      
      if (isset($localCache[$id])) {
          return $localCache[$id];
      }
      
      // 第二层：Redis缓存
      $cacheKey = "product_{$id}";
      if ($data = Cache::get($cacheKey)) {
          $localCache[$id] = $data;
          return $data;
      }
      
      // 第三层：数据库 + 原子锁
      $lock = Cache::lock("lock_{$id}", 5);
      if ($lock->get()) {
          try {
              // 再次检查缓存
              if ($data = Cache::get($cacheKey)) {
                  return $data;
              }
              
              // 数据库查询
              $data = Product::find($id);
              
              // 写入缓存
              Cache::put($cacheKey, $data, 3600);
              
              return $data;
          } finally {
              $lock->release();
          }
      }
      
      // 降级：直接查询数据库
      return Product::find($id);
  }
  ```

  2. **缓存分区策略**
  ```php
  // 根据用户类型分区缓存
  public function getDashboardData(User $user)
  {
      $cacheKey = "dashboard_{$user->id}";
      $cacheTags = ["user_{$user->id}"];
      
      // 添加用户角色标签
      if ($user->isAdmin()) {
          $cacheTags[] = 'admin_dashboards';
      } else {
          $cacheTags[] = 'user_dashboards';
      }
      
      return Cache::tags($cacheTags)->remember($cacheKey, 60, function () use ($user) {
          // 复杂的数据查询逻辑
          return $this->generateDashboardData($user);
      });
  }

  // 管理员清理所有仪表盘缓存
  public function clearAllDashboards()
  {
      Cache::tags('admin_dashboards')->flush();
      Cache::tags('user_dashboards')->flush();
  }
  ```
## 常见问题解答

  **Q：哪些缓存驱动支持标签？**  
  A：Redis、Memcached等支持，文件、数据库驱动不支持。

  **Q：锁会不会永久锁死？**  
  A：不会，锁有超时时间，到期自动释放。

  **Q：原子锁适合什么场景？**  
  A：

  - 防止缓存击穿
  - 秒杀类库存控制
  - 定时任务防并发执行
  - 分布式环境下的排他操作

  **Q：如何查看锁的状态？**  
  A：

  ```php
  $lock = Cache::lock('my_lock');
  $isAcquired = $lock->get(); // 尝试获取（非阻塞）
  $isOwned = $lock->isOwned(); // 当前进程是否持有锁
  ```

  **Q：锁超时时间怎么设置？**  
  A：根据业务操作时间合理设置，一般比平均操作时间稍长。

  **Q：如何手动释放锁？**  
  A：调用release()方法：

  ```php
  $lock->release();
  ```

  **Q：多个标签如何清除？**  
  A：可以传递数组：

  ```php
  Cache::tags(['tag1', 'tag2'])->flush();
  ```

  **Q：缓存标签的性能影响？**  
  A：使用标签会略微增加存储开销，但清除效率远高于遍历键名。
