# 实时广播
## 概念

  **什么是实时广播？**
  > - 实时广播就像直播间的弹幕系统：当服务器发生事件时，能立即推送给所有在线的用户，让网页或应用实现"实时更新"效果。

  **有什么用？**
  - **实时聊天**：用户间即时通讯
  - **动态通知**：新消息实时提醒
  - **数据同步**：多设备状态同步
  - **协作编辑**：多人同时编辑文档
  - **实时监控**：数据看板实时更新

## 一、广播驱动

  **是什么？**
  > - 广播驱动是广播系统的"快递公司"，负责把事件从服务器推送到客户端。Laravel支持多种驱动：

  - `pusher`：第三方专业服务
  - `redis`：自建高性能方案
  - `log`：本地调试用（不真正广播）
  - `null`：完全禁用广播

  **有什么用？**
  - 选择适合的推送服务
  - 平衡成本与性能
  - 方便本地开发调试

  **怎么用？**

  1. **安装广播依赖**
  ```bash
  composer require pusher/pusher-php-server # 使用Pusher时
  composer require predis/predis # 使用Redis时
  ```

  2. **配置环境变量 `.env`**
  ```env
  BROADCAST_DRIVER=pusher # 或 redis

  # Pusher配置
  PUSHER_APP_ID=your_app_id
  PUSHER_APP_KEY=your_app_key
  PUSHER_APP_SECRET=your_app_secret
  PUSHER_APP_CLUSTER=mt1

  # Redis配置
  REDIS_HOST=127.0.0.1
  REDIS_PASSWORD=null
  REDIS_PORT=6379
  ```

  3. **配置广播服务 `config/broadcasting.php`**
  ```php
  'connections' => [
      'pusher' => [
          'driver' => 'pusher',
          'key' => env('PUSHER_APP_KEY'),
          'secret' => env('PUSHER_APP_SECRET'),
          'app_id' => env('PUSHER_APP_ID'),
          'options' => [
              'cluster' => env('PUSHER_APP_CLUSTER'),
              'encrypted' => true,
          ],
      ],
      
      'redis' => [
          'driver' => 'redis',
          'connection' => 'default',
      ],
  ],
  ```

  4. **实际应用：订单状态更新**
  ```php
  // 创建事件
  php artisan make:event OrderStatusUpdated
  ```

  ```php
  // app/Events/OrderStatusUpdated.php
  class OrderStatusUpdated implements ShouldBroadcast
  {
      use Dispatchable;
      
      public $order;
      
      public function __construct(Order $order)
      {
          $this->order = $order;
      }
      
      // 指定广播频道
      public function broadcastOn()
      {
          return new Channel('orders.'.$this->order->id);
      }
      
      // 自定义广播数据
      public function broadcastWith()
      {
          return [
              'status' => $this->order->status,
              'updated_at' => $this->order->updated_at->toDateTimeString()
          ];
      }
  }
  ```

  ```php
  // 在控制器中触发事件
  public function updateOrderStatus(Order $order)
  {
      $order->update(['status' => 'shipped']);
      
      // 广播事件
      event(new OrderStatusUpdated($order));
      
      return response()->json(['message' => '状态已更新']);
  }
  ```

## 二、频道定义

  **是什么？**
  > - 频道就像不同的电视频道，客户端可以选择订阅感兴趣的频道，只接收特定频道的广播。

  **有什么用？**
  - 隔离不同业务的消息
  - 控制消息接收范围
  - 实现私密通信
  - 按权限分配频道

  **怎么用？**

  1. **定义公共频道**
  ```php
  // 广播到公共频道
  public function broadcastOn()
  {
      return new Channel('public-orders');
  }
  ```

  2. **定义私有频道（需要认证）**
  ```php
  // 广播到私有频道
  public function broadcastOn()
  {
      return new PrivateChannel('user.'.$this->user->id);
  }
  ```

  3. **频道认证 `routes/channels.php`**
  ```php
  // 私有频道认证
  Broadcast::channel('user.{userId}', function ($user, $userId) {
      return (int) $user->id === (int) $userId;
  });

  // 复杂权限示例：订单频道
  Broadcast::channel('orders.{orderId}', function ($user, $orderId) {
      $order = Order::find($orderId);
      return $user->id === $order->user_id || $user->isAdmin();
  });
  ```

  4. **实际应用：聊天室**
  ```php
  // 事件：新消息
  class NewChatMessage implements ShouldBroadcast
  {
      public $message;
      
      public function __construct(Message $message)
      {
          $this->message = $message;
      }
      
      // 广播到聊天室频道
      public function broadcastOn()
      {
          return new PrivateChannel('chat.'.$this->message->room_id);
      }
  }

  // 频道认证
  Broadcast::channel('chat.{roomId}', function ($user, $roomId) {
      return $user->rooms()->where('id', $roomId)->exists();
  });
  ```

## 三、Laravel Echo

  **是什么？**
  > - Laravel Echo是前端的"收音机"，用于接收服务器广播的事件，并在浏览器中处理。

  **有什么用？**
  - 简化前端事件监听
  - 自动处理认证
  - 支持多种驱动
  - 提供优雅的API

  **怎么用？**

  1. **安装前端依赖**
  ```bash
  npm install --save pusher-js laravel-echo
  ```

  2. **配置Echo `resources/js/bootstrap.js`**
  ```javascript
  import Echo from 'laravel-echo';
  import Pusher from 'pusher-js';

  window.Echo = new Echo({
      broadcaster: 'pusher',
      key: process.env.MIX_PUSHER_APP_KEY,
      cluster: process.env.MIX_PUSHER_APP_CLUSTER,
      encrypted: true,
      auth: {
          headers: {
              'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
          }
      }
  });
  ```

  3. **监听公共频道**
  ```javascript
  // 监听公共订单频道
  Echo.channel('public-orders')
      .listen('OrderStatusUpdated', (e) => {
          console.log('订单状态更新:', e.order);
          // 更新页面显示
          document.getElementById(`order-${e.order.id}-status`).innerText = e.order.status;
      });
  ```

  4. **监听私有频道**
  ```javascript
  // 监听私有用户频道
  Echo.private(`user.${userId}`)
      .listen('NotificationSent', (e) => {
          alert(`新通知: ${e.notification.title}`);
          // 显示通知
          showNotification(e.notification);
      });
  ```

  5. **实际应用：实时聊天**
  ```html
  <!-- 聊天界面 -->
  <div id="chat">
      <div id="messages"></div>
      <input type="text" id="message-input">
      <button onclick="sendMessage()">发送</button>
  </div>

  <script>
  // 发送消息
  function sendMessage() {
      const input = document.getElementById('message-input');
      axios.post('/chat/send', {
          message: input.value,
          room_id: currentRoomId
      });
      input.value = '';
  }

  // 监听新消息
  Echo.private(`chat.${currentRoomId}`)
      .listen('NewChatMessage', (e) => {
          const messages = document.getElementById('messages');
          messages.innerHTML += `<div class="message">${e.message.content}</div>`;
          messages.scrollTop = messages.scrollHeight;
      });
  </script>
  ```
## 完整示例：实时订单追踪系统

  1. **后端设置**
  ```php
  // app/Events/OrderLocationUpdated.php
  class OrderLocationUpdated implements ShouldBroadcast
  {
      public $order;
      public $location;

      public function __construct(Order $order, array $location)
      {
          $this->order = $order;
          $this->location = $location;
      }

      public function broadcastOn()
      {
          return new PrivateChannel('orders.'.$this->order->id);
      }
  }

  // routes/channels.php
  Broadcast::channel('orders.{orderId}', function ($user, $orderId) {
      return Order::where('id', $orderId)->where('user_id', $user->id)->exists();
  });
  ```

  2. **前端监听**
  ```javascript
  // resources/js/order-tracking.js
  const orderId = 123; // 实际从页面获取

  Echo.private(`orders.${orderId}`)
      .listen('OrderLocationUpdated', (e) => {
          updateMapMarker(e.location);
          updateStatusBar(`配送中: ${e.location.lat}, ${e.location.lng}`);
      });

  function updateMapMarker(location) {
      // 更新地图标记
      console.log('更新位置:', location);
  }
  ```

  3. **模拟配送更新（测试用）**
  ```php
  // 测试路由
  Route::get('/test-delivery/{order}', function (Order $order) {
      $locations = [
          ['lat' => 31.2304, 'lng' => 121.4737], // 上海
          ['lat' => 31.2243, 'lng' => 121.4755],
          ['lat' => 31.2200, 'lng' => 121.4800]
      ];
      
      foreach ($locations as $location) {
          event(new OrderLocationUpdated($order, $location));
          sleep(5); // 5秒更新一次位置
      }
  });
  ```
## 常见问题解答

  **Q：本地开发如何测试广播？**  
  A：使用 laravel-websockets 包：  

  ```bash
  composer require beyondcode/laravel-websockets
  php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider"
  php artisan websockets:serve
  ```

  **Q：如何限制广播事件？**  
  A：使用 broadcastWhen 方法：  

  ```php
  public function broadcastWhen()
  {
      return $this->order->status !== 'cancelled';
  }
  ```

  **Q：前端如何取消订阅？**
  A：

  ```javascript
  // 取消特定监听
  const listener = Echo.private('chat.1').listen(...);
  listener.stop();

  // 取消整个频道
  Echo.leave('chat.1');
  ```

  **Q：如何广播给指定用户？**  
  A：使用私有频道 + 认证：  

  ```php
  // 事件
  public function broadcastOn()
  {
      return new PrivateChannel('App.Models.User.'.$this->user->id);
  }

  // 认证
  Broadcast::channel('App.Models.User.{userId}', function ($user, $userId) {
      return (int) $user->id === (int) $userId;
  });
  ```

  **Q：广播数据太大怎么办？**  
  A：精简广播数据：  

  ```php
  public function broadcastWith()
  {
      return [
          'id' => $this->order->id,
          'status' => $this->order->status,
          // 只发送必要数据
      ];
  }
  ```

  **Q：如何调试广播？**  
  A：

  - 查看WebSocket控制台
  - 使用Laravel日志：

  ```php
  // 在事件中添加
  Log::debug('广播事件: '.get_class($this), $this->broadcastWith());
  ```
