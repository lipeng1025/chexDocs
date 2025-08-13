# Eloquent ORM核心

## 一、 模型基础

  **是什么？**
  > - 模型是操作数据库表的工具，每个模型对应数据库中的一张表。比如 `User` 模型对应 `users` 表。

  **有什么用？**
  - 不用写复杂SQL就能操作数据库
  - 自动处理表名、主键等细节
  - 数据验证和转换更简单

  **怎么用？**

  **步骤1：创建模型**

  ```bash
  php artisan make:model Post
  ```

  **步骤2：基本模型文件 (`app/Models/Post.php`)**

  ```php
  namespace App\Models;

  use Illuminate\Database\Eloquent\Model;

  class Post extends Model
  {
      // 默认对应表名是模型名的复数形式 (posts)
      // 如果表名不同，可以指定：
      // protected $table = 'my_posts';
      
      // 默认主键是id，如果不同可以修改：
      // protected $primaryKey = 'post_id';
      
      // 定义可批量赋值的字段（安全）
      protected $fillable = ['title', 'content'];
      
      // 或者反向定义禁止赋值的字段
      // protected $guarded = ['id', 'password'];
  }
  ```
## 二、 CRUD 操作

  **是什么？**
  > - 数据库基本操作：创建(Create)、读取(Read)、更新(Update)、删除(Delete)

  **有什么用？**
  - 完成对数据的增删改查操作

  **具体操作**：

  创建数据
  ```php
  // 方式1：新建对象后保存
  $post = new Post();
  $post->title = '我的第一篇博客';
  $post->content = '这是内容...';
  $post->save();

  // 方式2：使用create方法（需在模型中设置fillable）
  Post::create([
      'title' => '第二篇博客',
      'content' => '更多内容...'
  ]);
  ```

  **读取数据**
  ```php
  // 获取所有记录
  $posts = Post::all();

  // 按主键查找
  $post = Post::find(1); // 找id=1的记录

  // 条件查询
  $popularPosts = Post::where('views', '>', 100)->get();

  // 获取第一条
  $firstPost = Post::first();
  ```

  **更新数据**
  ```php
  // 方式1：先查找再修改
  $post = Post::find(1);
  $post->title = '更新后的标题';
  $post->save();

  // 方式2：直接更新
  Post::where('views', '<', 10)->update(['status' => 'hidden']);
  ```

  **删除数据**
  ```php
  // 删除单条
  $post = Post::find(2);
  $post->delete();

  // 按条件删除
  Post::where('status', 'hidden')->delete();

  // 按主键删除
  Post::destroy(1); // 删除id=1
  Post::destroy([1, 2, 3]); // 删除多个
  ```
## 三、 查询构造器

  **是什么？**
  > - 用链式调用（像搭积木）的方式构建数据库查询的工具

  **有什么用？**
  > - 比写原生SQL更简单
  > - 防止SQL注入攻击
  > - 自动处理不同数据库的差异

  **常用方法**：
  ```php
  // 基础查询
  $posts = Post::where('status', 'published')->get();

  // 多条件查询
  $posts = Post::where('views', '>', 100)
              ->where('category', 'tech')
              ->get();

  // 排序
  $posts = Post::orderBy('created_at', 'desc')->get();

  // 限制数量
  $latestPosts = Post::latest()->take(5)->get();

  // 聚合函数
  $count = Post::where('category', 'news')->count();
  $maxViews = Post::max('views');

  // 选择特定字段
  $titles = Post::select('title', 'created_at')->get();

  // 分页
  $posts = Post::paginate(10); // 每页10条
  ```
## 四、 关系定义

  **是什么？**
  > - 定义表与表之间的关联关系（一对多、多对多等）

  **有什么用？**
  > - 轻松获取关联数据（如获取用户的所有文章）
  > - 自动处理关联表操作

  **常用关系类型**：

  一对多（用户 -> 文章）

  **用户模型 (User.php)**

  ```php
  public function posts()
  {
      return $this->hasMany(Post::class);
  }
  ```

  **文章模型 (Post.php)**

  ```php
  public function user()
  {
      return $this->belongsTo(User::class);
  }
  ```

  **使用示例**：

  ```php
  // 获取用户的所有文章
  $user = User::find(1);
  $posts = $user->posts;

  // 获取文章的作者
  $post = Post::find(1);
  $author = $post->user;
  ```
  ---
  多对多（文章 <-> 标签）

  **文章模型 (Post.php)**

  ```php
  public function tags()
  {
      return $this->belongsToMany(Tag::class);
  }
  ```

  **标签模型 (Tag.php)**

  ```php
  public function posts()
  {
      return $this->belongsToMany(Post::class);
  }
  ```

  **使用示例**：

  ```php
  // 给文章添加标签
  $post = Post::find(1);
  $post->tags()->attach([1, 2, 3]); // 添加标签ID

  // 获取文章的所有标签
  $tags = $post->tags;

  // 获取标签的所有文章
  $tag = Tag::find(1);
  $posts = $tag->posts;
  ```
## 五、集合

  **是什么？**
  > - 查询结果返回的特殊对象，类似增强版数组

  **有什么用？**
  - 提供强大的数据处理方法
  - 链式操作数据集合
  - 比数组操作更方便

  **常用方法**：
  ```php
  // 获取所有已发布的文章
  $posts = Post::where('status', 'published')->get();

  // 遍历集合
  $posts->each(function ($post) {
      echo $post->title;
  });

  // 过滤数据
  $popularPosts = $posts->filter(function ($post) {
      return $post->views > 100;
  });

  // 数据转换
  $titles = $posts->map(function ($post) {
      return $post->title;
  });

  // 排序
  $sortedPosts = $posts->sortBy('created_at');

  // 分页
  $chunks = $posts->chunk(10); // 每10条一组

  // 统计
  $totalViews = $posts->sum('views');
  ```

  **集合链式操作示例**
  ```php
  $topTitles = Post::all()
      ->filter(fn($post) => $post->views > 100)
      ->sortByDesc('created_at')
      ->take(5)
      ->pluck('title');
  ```
