# Eloquent进阶

## 一、多态关联

  **是什么？**
  > - 多态关联允许一个模型关联到多个不同类型的模型

  **有什么用？**
  - 让评论可以属于文章或视频
  - 让图片可以属于用户或产品
  - 避免创建多个关联表
  - 简化数据结构

  **怎么用？**

  1. **数据库迁移**
  ```bash
  # 创建评论表
  php artisan make:migration create_comments_table

  # 迁移文件
  public function up()
  {
      Schema::create('comments', function (Blueprint $table) {
          $table->id();
          $table->text('content');
          $table->morphs('commentable'); // 自动生成 commentable_id 和 commentable_type
          $table->timestamps();
      });
  }
  ```

  2. **模型设置**
  ```php
  // 评论模型 (app/Models/Comment.php)
  class Comment extends Model
  {
      public function commentable()
      {
          return $this->morphTo();
      }
  }

  // 文章模型 (app/Models/Post.php)
  class Post extends Model
  {
      public function comments()
      {
          return $this->morphMany(Comment::class, 'commentable');
      }
  }

  // 视频模型 (app/Models/Video.php)
  class Video extends Model
  {
      public function comments()
      {
          return $this->morphMany(Comment::class, 'commentable');
      }
  }
  ```

  3. **使用示例**
  ```php
  // 创建文章评论
  $post = Post::find(1);
  $comment = $post->comments()->create([
      'content' => '很棒的文章！'
  ]);

  // 创建视频评论
  $video = Video::find(1);
  $video->comments()->create([
      'content' => '视频很精彩'
  ]);

  // 获取评论所属模型
  $comment = Comment::find(1);
  $model = $comment->commentable; // 返回 Post 或 Video 实例

  // 获取文章的所有评论
  $post = Post::find(1);
  $comments = $post->comments;
  ```

  4. **多态一对多（带额外属性）**
  ```php
  // 创建中间表迁移
  php artisan make:migration create_imageables_table

  // 迁移文件
  public function up()
  {
      Schema::create('imageables', function (Blueprint $table) {
          $table->id();
          $table->string('url');
          $table->morphs('imageable');
          $table->string('type')->default('thumbnail'); // 额外属性
          $table->timestamps();
      });
  }

  // 图片模型
  class Image extends Model
  {
      public function imageable()
      {
          return $this->morphTo();
      }
  }

  // 用户模型
  class User extends Model
  {
      public function images()
      {
          return $this->morphMany(Image::class, 'imageable');
      }
  }

  // 使用
  $user = User::find(1);
  $user->images()->create([
      'url' => 'avatar.jpg',
      'type' => 'avatar'
  ]);

  $post = Post::find(1);
  $post->images()->create([
      'url' => 'post-cover.jpg',
      'type' => 'cover'
  ]);
  ```

## 二、查询作用域

  **是什么？**
  > - 查询作用域是封装常用查询条件的可复用方法

  **有什么用？**
  - 避免重复编写相同查询
  - 保持代码整洁
  - 简化复杂查询
  - 提高代码可读性

  **怎么用？**

  1. **本地作用域（模型内）**
  ```php
  // 用户模型 (app/Models/User.php)
  class User extends Model
  {
      // 作用域：活跃用户
      public function scopeActive($query)
      {
          return $query->where('active', true);
      }
      
      // 作用域：注册时间范围
      public function scopeRegisteredBetween($query, $start, $end)
      {
          return $query->whereBetween('created_at', [$start, $end]);
      }
      
      // 作用域：管理员用户
      public function scopeAdmin($query)
      {
          return $query->where('role', 'admin');
      }
  }

  // 使用
  $activeUsers = User::active()->get();
  $recentUsers = User::registeredBetween(now()->subMonth(), now())->get();
  $adminUsers = User::admin()->active()->get();
  ```

  2. **动态作用域**
  ```php
  // 在用户模型中
  public function scopeRole($query, $role)
  {
      return $query->where('role', $role);
  }

  // 使用
  $editors = User::role('editor')->get();
  ```

  3. **全局作用域（自动应用到所有查询）**
  ```php
  // 创建作用域类
  php artisan make:scope ActiveScope

  // app/Models/Scopes/ActiveScope.php
  namespace App\Models\Scopes;

  use Illuminate\Database\Eloquent\Builder;
  use Illuminate\Database\Eloquent\Model;
  use Illuminate\Database\Eloquent\Scope;

  class ActiveScope implements Scope
  {
      public function apply(Builder $builder, Model $model)
      {
          $builder->where('active', true);
      }
  }

  // 在模型中注册
  class User extends Model
  {
      protected static function booted()
      {
          static::addGlobalScope(new ActiveScope);
      }
  }

  // 移除全局作用域
  User::withoutGlobalScope(ActiveScope::class)->get();
  ```

## 三、软删除

  **是什么？**
  > - 软删除是把数据标记为"已删除"而不实际删除记录

  **有什么用？**
  - 防止数据永久丢失
  - 恢复误删数据
  - 保留历史记录
  - 实现回收站功能

  **怎么用？**

  1. **启用软删除**
  ```php
  // 迁移文件：添加 deleted_at 字段
  public function up()
  {
      Schema::table('users', function (Blueprint $table) {
          $table->softDeletes(); // 添加 deleted_at 字段
      });
  }

  // 在模型中使用软删除
  use Illuminate\Database\Eloquent\SoftDeletes;

  class User extends Model
  {
      use SoftDeletes;
      
      protected $dates = ['deleted_at'];
  }
  ```

  2. **基本操作**
  ```php
  // 软删除用户
  $user = User::find(1);
  $user->delete(); // 设置 deleted_at 为当前时间

  // 查询包含已删除的用户
  $users = User::withTrashed()->get();

  // 只查询已删除的用户
  $deletedUsers = User::onlyTrashed()->get();

  // 恢复软删除
  $user = User::onlyTrashed()->find(1);
  $user->restore();

  // 永久删除
  $user->forceDelete();
  ```

  3. **关联操作**
  ```php
  // 级联软删除（当用户删除时，同时删除关联文章）
  class User extends Model
  {
      use SoftDeletes;
      
      public function posts()
      {
          return $this->hasMany(Post::class);
      }
      
      protected static function booted()
      {
          static::deleting(function ($user) {
              if ($user->isForceDeleting()) {
                  // 永久删除时级联删除文章
                  $user->posts()->forceDelete();
              } else {
                  // 软删除时级联软删除文章
                  $user->posts()->delete();
              }
          });
          
          static::restoring(function ($user) {
              $user->posts()->restore();
          });
      }
  }

  // 查询包含已删除关联
  $user = User::with(['posts' => function ($query) {
      $query->withTrashed();
  }])->find(1);
  ```

## 四、模型事件

  **是什么？**
  > - 模型事件是在模型操作（创建、更新、删除等）前后触发的钩子

  **有什么用？**
  - 自动生成Slug
  - 清理缓存
  - 发送通知
  - 记录变更历史
  - 数据验证

  **怎么用？**

  1. **基本事件类型**
  ```php
  // 事件列表：
  retrieved  // 获取模型后
  creating   // 创建前
  created    // 创建后
  updating   // 更新前
  updated    // 更新后
  saving     // 保存前（创建或更新）
  saved      // 保存后（创建或更新）
  deleting   // 删除前
  deleted    // 删除后
  restoring  // 恢复前
  restored   // 恢复后
  ```

  2. **使用闭包注册事件**
  ```php
  class User extends Model
  {
      protected static function booted()
      {
          // 创建前生成UUID
          static::creating(function ($user) {
              $user->uuid = Str::uuid();
          });
          
          // 保存前处理用户名
          static::saving(function ($user) {
              $user->name = ucwords($user->name);
          });
          
          // 删除后记录日志
          static::deleted(function ($user) {
              Log::info("用户删除: {$user->id}", $user->toArray());
          });
          
          // 更新后清除缓存
          static::updated(function ($user) {
              Cache::forget("user_{$user->id}");
          });
      }
  }
  ```

  3. **使用观察者类**
  ```bash
  # 创建观察者
  php artisan make:observer UserObserver --model=User
  ```

  ```php
  // app/Observers/UserObserver.php
  class UserObserver
  {
      // 创建前
      public function creating(User $user)
      {
          $user->api_token = Str::random(60);
      }
      
      // 保存前
      public function saving(User $user)
      {
          if ($user->isDirty('email')) {
              $user->email_verified_at = null;
          }
      }
      
      // 更新后
      public function updated(User $user)
      {
          if ($user->isDirty('role')) {
              // 发送角色变更通知
              $user->notify(new RoleChangedNotification($user->role));
          }
      }
      
      // 删除后
      public function deleted(User $user)
      {
          // 删除用户头像文件
          if ($user->avatar) {
              Storage::delete($user->avatar);
          }
      }
  }

  // 在AppServiceProvider中注册
  public function boot()
  {
      User::observe(UserObserver::class);
  }
  ```

  4. **实际应用示例**
  
  **自动生成Slug**

  ```php
  class Post extends Model
  {
      protected static function booted()
      {
          static::saving(function ($post) {
              if ($post->isDirty('title')) {
                  $post->slug = Str::slug($post->title);
              }
          });
      }
  }
  ```

  **记录模型变更历史**

  ```php
  class ProductObserver
  {
      public function updated(Product $product)
      {
          $changes = $product->getChanges();
          $original = $product->getOriginal();
          
          History::create([
              'model' => Product::class,
              'model_id' => $product->id,
              'user_id' => auth()->id(),
              'changes' => [
                  'old' => array_intersect_key($original, $changes),
                  'new' => $changes
              ]
          ]);
      }
  }
  ```

  **发送通知**

  ```php
  class OrderObserver
  {
      public function created(Order $order)
      {
          // 通知用户
          $order->user->notify(new OrderCreatedNotification($order));
          
          // 通知管理员
          User::admin()->each(function ($admin) use ($order) {
              $admin->notify(new NewOrderNotification($order));
          });
      }
      
      public function updated(Order $order)
      {
          if ($order->isDirty('status')) {
              $order->user->notify(new OrderStatusUpdatedNotification(
                  $order->status,
                  $order->getOriginal('status')
              ));
          }
      }
  }
  ```

## 完整示例：博客系统模型

  1. **用户模型**
  ```php
  class User extends Model
  {
      use SoftDeletes, Notifiable;
      
      protected $dates = ['deleted_at'];
      
      protected static function booted()
      {
          // 创建时设置默认头像
          static::creating(function ($user) {
              $user->avatar = $user->avatar ?? 'default-avatar.jpg';
          });
          
          // 删除时软删除关联文章
          static::deleting(function ($user) {
              if (!$user->isForceDeleting()) {
                  $user->posts()->delete();
              }
          });
          
          // 恢复时恢复关联文章
          static::restoring(function ($user) {
              $user->posts()->restore();
          });
      }
      
      public function posts()
      {
          return $this->hasMany(Post::class);
      }
      
      // 作用域：活跃用户
      public function scopeActive($query)
      {
          return $query->where('active', true);
      }
  }
  ```

  2. **文章模型**
  ```php
  class Post extends Model
  {
      use SoftDeletes;
      
      protected $dates = ['deleted_at', 'published_at'];
      
      protected static function booted()
      {
          // 保存前生成slug
          static::saving(function ($post) {
              if ($post->isDirty('title')) {
                  $post->slug = Str::slug($post->title);
              }
          });
          
          // 发布时发送通知
          static::updated(function ($post) {
              if ($post->wasChanged('published_at') && $post->published_at) {
                  $post->user->notify(new PostPublishedNotification($post));
              }
          });
      }
      
      public function user()
      {
          return $this->belongsTo(User::class);
      }
      
      public function comments()
      {
          return $this->morphMany(Comment::class, 'commentable');
      }
      
      // 作用域：已发布文章
      public function scopePublished($query)
      {
          return $query->whereNotNull('published_at')
                      ->where('published_at', '<=', now());
      }
      
      // 作用域：热门文章
      public function scopePopular($query, $minViews = 100)
      {
          return $query->where('views', '>=', $minViews);
      }
  }
  ```

  3. **评论模型**
  ```php
  class Comment extends Model
  {
      public function commentable()
      {
          return $this->morphTo();
      }
      
      public function user()
      {
          return $this->belongsTo(User::class);
      }
      
      // 作用域：最新评论
      public function scopeLatest($query)
      {
          return $query->orderByDesc('created_at');
      }
  }
  ```
## 最佳实践

  1. **多态关联优化**
  ```php
  // 预加载多态关联
  $comments = Comment::with('commentable')->get();

  // 避免N+1问题
  $posts = Post::with('comments.user')->get();
  ```

  2. **作用域复用**
  ```php
  // 创建可复用作用域类
  class ActiveScope implements Scope
  {
      public function apply(Builder $builder, Model $model)
      {
          $builder->where('active', true);
      }
  }

  // 在多个模型中使用
  class User extends Model
  {
      protected static function booted()
      {
          static::addGlobalScope(new ActiveScope);
      }
  }

  class Product extends Model
  {
      protected static function booted()
      {
          static::addGlobalScope(new ActiveScope);
      }
  }
  ```

  3. **软删除恢复确认**
  ```php
  // 添加确认时间戳
  class User extends Model
  {
      use SoftDeletes;
      
      public function restore()
      {
          if ($this->trashed() && !$this->restore_confirmed_at) {
              throw new \Exception('请先确认恢复操作');
          }
          
          return parent::restore();
      }
  }
  ```

  4. **事件性能优化**
  ```php
  // 避免在事件中执行耗时操作
  class OrderObserver
  {
      public function created(Order $order)
      {
          // 使用队列处理耗时任务
          ProcessOrder::dispatch($order);
      }
  }

  // 使用事件监听器
  class SendOrderNotification implements ShouldQueue
  {
      public function handle(OrderCreated $event)
      {
          // 异步发送通知
          $event->order->user->notify(new OrderCreatedNotification($event->order));
      }
  }
  ```
