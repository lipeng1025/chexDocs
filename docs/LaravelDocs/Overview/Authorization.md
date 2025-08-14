# 授权策略
## 概念

  **什么是授权策略？**
  > - 授权策略就像公司的门禁系统：它规定哪些人（用户）可以进入哪些房间（资源）以及能做什么操作（动作）。

  **有什么用？**
  - 控制用户访问权限
  - 保护敏感数据安全
  - 实现复杂的业务权限规则
  - 集中管理权限逻辑

## 一、策略类

  **是什么？**
  > - 策略类是一个PHP类，专门用来定义对某个资源（如文章、订单）的操作权限规则。

  **有什么用？**
  - 将权限规则按资源分类管理
  - 每个资源对应一个策略类
  - 每个方法对应一个操作权限检查

  **怎么用？**

  1. **创建策略类**
  ```bash
  php artisan make:policy PostPolicy --model=Post
  ```

  2. **编辑策略类 `app/Policies/PostPolicy.php`**
  ```php
  class PostPolicy
  {
      // 查看权限
      public function view(User $user, Post $post)
      {
          // 只有公开文章或作者本人可以查看
          return $post->is_public || $user->id === $post->user_id;
      }

      // 更新权限
      public function update(User $user, Post $post)
      {
          // 只有作者可以更新
          return $user->id === $post->user_id;
      }

      // 删除权限
      public function delete(User $user, Post $post)
      {
          // 作者或管理员可以删除
          return $user->id === $post->user_id || $user->is_admin;
      }
  }
  ```

  3. **注册策略 `app/Providers/AuthServiceProvider.php`**
  ```php
  protected $policies = [
      Post::class => PostPolicy::class,
  ];
  ```

  4. **实际应用：订单策略**
  ```php
  // app/Policies/OrderPolicy.php
  class OrderPolicy
  {
      // 查看订单
      public function view(User $user, Order $order)
      {
          // 用户只能查看自己的订单，管理员可以查看所有
          return $user->is_admin || $user->id === $order->user_id;
      }

      // 取消订单
      public function cancel(User $user, Order $order)
      {
          // 只有未发货的订单才能取消
          return $user->id === $order->user_id 
              && $order->status === 'pending';
      }
  }
  ```


## 二、权限检查

  **是什么？**
  > - 权限检查就是在代码中判断当前用户是否有权执行某个操作。

  **有什么用？**
  - 在控制器中验证权限
  - 在Blade模板中控制元素显示
  - 在表单请求中自动授权

  **怎么用？**

  1. **在控制器中检查**
  ```php
  public function update(Request $request, Post $post)
  {
      // 手动检查权限
      $this->authorize('update', $post);
      
      // 更新文章
      $post->update($request->all());
      
      return redirect('/posts');
  }
  ```

  2. **在Blade模板中检查**
  ```blade
  @can('update', $post)
      <a href="/posts/{{ $post->id }}/edit">编辑文章</a>
  @endcan

  @can('delete', $post)
      <form action="/posts/{{ $post->id }}" method="POST">
          @csrf @method('DELETE')
          <button>删除</button>
      </form>
  @endcan
  ```

  3. **在表单请求中自动授权**
  ```php
  // app/Http/Requests/UpdatePostRequest.php
  public function authorize()
  {
      $post = $this->route('post'); // 获取路由绑定的文章
      return $post && $this->user()->can('update', $post);
  }
  ```

  4. **实际应用：订单控制器**
  ```php
  // 查看订单详情
  public function show(Order $order)
  {
      // 自动授权（根据OrderPolicy的view方法）
      $this->authorize('view', $order);
      
      return view('orders.show', compact('order'));
  }

  // 取消订单
  public function cancel(Order $order)
  {
      $this->authorize('cancel', $order);
      
      $order->update(['status' => 'cancelled']);
      
      return redirect()->back()->with('message', '订单已取消');
  }
  ```

## 三、Gates

  **是什么？**
  > - Gates（门面）是更通用的权限检查方式，不绑定特定模型，适合系统级操作（如访问后台）。

  **有什么用？**
  - 定义与具体资源无关的权限
  - 检查用户全局权限
  - 实现简单权限检查

  **怎么用？**

  1. **定义Gate `app/Providers/AuthServiceProvider.php`**
  ```php
  public function boot()
  {
      $this->registerPolicies();
      
      // 定义管理后台访问权限
      Gate::define('access-admin', function (User $user) {
          return $user->is_admin;
      });
      
      // 定义VIP功能权限
      Gate::define('use-vip-feature', function (User $user) {
          return $user->is_vip && $user->vip_expires_at > now();
      });
  }
  ```

  2. **使用Gate检查权限**
  ```php
  // 在控制器中
  public function dashboard()
  {
      // 检查权限
      if (Gate::denies('access-admin')) {
          abort(403);
      }
      
      return view('admin.dashboard');
  }

  // 使用中间件
  Route::get('/admin', function () {
      // ...
  })->middleware('can:access-admin');
  ```

  3. **在Blade模板中使用**
  ```blade
  @can('access-admin')
      <a href="/admin">管理后台</a>
  @endcan

  @can('use-vip-feature')
      <button>VIP专属功能</button>
  @endcan
  ```

  4. **实际应用：多角色权限**
  ```php
  // 定义基于角色的Gate
  Gate::define('manage-users', function (User $user) {
      return $user->hasRole('admin') || $user->hasRole('manager');
  });

  // 使用
  public function userManagement()
  {
      Gate::authorize('manage-users');
      
      $users = User::all();
      return view('admin.users', compact('users'));
  }
  ```
## 完整示例：博客系统权限

  1. **策略类 `app/Policies/PostPolicy.php`**
  ```php
  class PostPolicy
  {
      // 创建权限（不需要模型实例）
      public function create(User $user)
      {
          return $user->is_author; // 只有作者可以写文章
      }

      public function update(User $user, Post $post)
      {
          // 作者可以编辑自己的文章，管理员可以编辑所有
          return $user->is_admin || $user->id === $post->user_id;
      }

      public function delete(User $user, Post $post)
      {
          // 只有管理员可以删除
          return $user->is_admin;
      }
  }
  ```

  2. **控制器中使用 `app/Http/Controllers/PostController.php`**
  ```php
  public function create()
  {
      $this->authorize('create', Post::class);
      return view('posts.create');
  }

  public function edit(Post $post)
  {
      $this->authorize('update', $post);
      return view('posts.edit', compact('post'));
  }

  public function destroy(Post $post)
  {
      $this->authorize('delete', $post);
      $post->delete();
      return redirect('/posts');
  }
  ```

  3. **前端模板 resources/views/posts/show.blade.php**
  ```blade
  <h1>{{ $post->title }}</h1>

  @can('update', $post)
      <a href="{{ route('posts.edit', $post) }}">编辑</a>
  @endcan

  @can('delete', $post)
      <form action="{{ route('posts.destroy', $post) }}" method="POST">
          @csrf @method('DELETE')
          <button>删除</button>
      </form>
  @endcan
  ```

  4. **管理员Gate `app/Providers/AuthServiceProvider.php`**
  ```php
  Gate::define('manage-settings', function (User $user) {
      return $user->is_admin;
  });

  // 在路由中使用
  Route::get('/settings', 'SettingsController@index')
      ->middleware('can:manage-settings');
  ```
## 常见问题解答

  **Q：策略和Gate有什么区别？**  
  A：

  - 策略：绑定特定模型，适合资源操作（如文章更新）
  - Gate：不绑定模型，适合系统操作（如访问后台）

  **Q：如何跳过权限检查？**  
  A：在策略类中使用before方法：

  ```php
  public function before(User $user, $ability)
  {
      if ($user->is_super_admin) {
          return true; // 超级管理员拥有所有权限
      }
  }
  ```

  **Q：如何检查多个权限？**  
  A：

  ```php
  // 同时满足
  if (Gate::allows('access-admin') && Gate::allows('manage-users')) {
      // ...
  }

  // 满足任意一个
  if (Gate::any(['access-admin', 'manage-users'])) {
      // ...
  }
  ```

  **Q：如何获取当前用户实例？**  
  A：在策略类中会自动注入，其他地方使用：

  ```php
  $user = auth()->user();
  ```

  **Q：如何测试授权策略？**  
  A：使用Laravel测试助手：

  ```php
  public function test_admin_can_delete_post()
  {
      $admin = User::factory()->admin()->create();
      $post = Post::factory()->create();
      
      $this->actingAs($admin)
          ->delete("/posts/{$post->id}")
          ->assertStatus(200);
  }
  ```


