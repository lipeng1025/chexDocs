# API资源

## 一、资源类创建

  **是什么？**
  > - API资源类是把数据库模型转换成API友好JSON格式的工具

  **有什么用？**
  - 控制API返回的数据结构
  - 隐藏敏感字段（如密码）
  - 添加计算字段（如完整URL）
  - 格式化日期等数据
  - 统一API响应格式

  **怎么用？**

  **步骤1：创建资源类**
  ```bash
  php artisan make:resource UserResource
  php artisan make:resource PostResource
  ```

  **步骤2：基本资源类结构 (`app/Http/Resources/UserResource.php`)**
  ```php
  namespace App\Http\Resources;

  use Illuminate\Http\Request;
  use Illuminate\Http\Resources\Json\JsonResource;

  class UserResource extends JsonResource
  {
      /**
      * 将资源转换成数组
      *
      * @return array<string, mixed>
      */
      public function toArray(Request $request): array
      {
          // 返回需要暴露的字段
          return [
              'id' => $this->id,
              'name' => $this->name,
              'email' => $this->email,
              // 添加计算字段
              'avatar_url' => $this->avatar 
                  ? asset('storage/'.$this->avatar) 
                  : null,
              // 格式化日期
              'created_at' => $this->created_at->format('Y-m-d H:i'),
          ];
      }
  }
  ```

  **步骤3：在控制器中使用**
  ```php
  use App\Http\Resources\UserResource;
  use App\Models\User;

  class UserController extends Controller
  {
      // 返回单个用户
      public function show(User $user)
      {
          return new UserResource($user);
      }

      // 返回用户集合
      public function index()
      {
          return UserResource::collection(User::all());
      }
  }
  ```

## 二、数据转换

  **是什么？**
  > - 将模型数据转换成适合API的格式

  **有什么用？**
  - 自定义返回字段
  - 转换数据类型
  - 添加额外信息
  - 嵌套关联资源

  **具体操作**：

  1. **基础转换**
  ```php
  // app/Http/Resources/PostResource.php
  public function toArray(Request $request): array
  {
      return [
          'id' => $this->id,
          'title' => $this->title,
          'content' => $this->content,
          // 计算阅读时间
          'read_time' => ceil(str_word_count($this->content) / 200) . '分钟',
          // 格式化日期
          'published_at' => $this->published_at?->format('Y年m月d日'),
      ];
  }
  ```

  2. **隐藏敏感字段**
  ```php
  public function toArray(Request $request): array
  {
      return [
          'id' => $this->id,
          'name' => $this->name,
          'email' => $this->email,
          // 不返回密码字段
      ];
  }

  // 或者在整个资源类中定义隐藏字段
  protected $hidden = ['password', 'remember_token'];
  ```

  3. **条件字段显示**
  ```php
  public function toArray(Request $request): array
  {
      return [
          'id' => $this->id,
          'title' => $this->title,
          // 只有管理员才返回作者信息
          'author' => $this->when(
              $request->user()?->isAdmin(), 
              $this->user->name
          ),
      ];
  }
  ```

  4. **添加元数据**
  ```php
  public function with(Request $request): array
  {
      return [
          'meta' => [
              'version' => '1.0',
              'api_docs' => url('/api/docs'),
              'copyright' => now()->year . ' 我的公司',
          ]
      ];
  }
  ```

  5. **嵌套关联资源**
  ```php
  public function toArray(Request $request): array
  {
      return [
          'id' => $this->id,
          'title' => $this->title,
          // 嵌套用户资源
          'author' => new UserResource($this->user),
          // 嵌套标签集合
          'tags' => TagResource::collection($this->tags),
      ];
  }
  ```

## 三、集合资源

  **是什么？**
  > - 处理多个资源的集合，统一包装响应格式

  **有什么用？**
  - 批量处理资源转换
  - 添加分页信息
  - 统一集合数据结构
  - 添加集合级别元数据

  **怎么用？**

  1. **创建集合资源类**
  ```bash
  php artisan make:resource PostCollection
  ```

  2. **集合资源类示例 (`app/Http/Resources/PostCollection.php`)**
  ```php
  namespace App\Http\Resources;

  use Illuminate\Http\Request;
  use Illuminate\Http\Resources\Json\ResourceCollection;

  class PostCollection extends ResourceCollection
  {
      /**
      * 将资源集合转换成数组
      *
      * @return array<int|string, mixed>
      */
      public function toArray(Request $request): array
      {
          // 返回集合数据
          return [
              'data' => $this->collection,
              // 添加分页信息
              'pagination' => [
                  'total' => $this->total(),
                  'per_page' => $this->perPage(),
                  'current_page' => $this->currentPage(),
                  'last_page' => $this->lastPage(),
              ],
              // 集合级别元数据
              'meta' => [
                  'api_version' => 'v1.2',
                  'generated_at' => now()->toDateTimeString(),
              ]
          ];
      }
      
      // 可选：自定义响应头
      public function withResponse($request, $response)
      {
          $response->header('X-Custom-Header', 'PostCollection');
      }
  }
  ```

  3. **在控制器中使用**
  ```php
  use App\Http\Resources\PostCollection;
  use App\Models\Post;

  class PostController extends Controller
  {
      // 返回文章集合（无分页）
      public function index()
      {
          return new PostCollection(Post::all());
      }
      
      // 返回分页集合
      public function paginated()
      {
          $posts = Post::paginate(10);
          return new PostCollection($posts);
      }
  }
  ```

  4. **集合资源响应示例**
  ```json
  {
    "data": [
      {
        "id": 1,
        "title": "第一篇文章",
        "content": "内容...",
        "read_time": "2分钟"
      },
      {
        "id": 2,
        "title": "第二篇文章",
        "content": "内容...",
        "read_time": "3分钟"
      }
    ],
    "pagination": {
      "total": 15,
      "per_page": 10,
      "current_page": 1,
      "last_page": 2
    },
    "meta": {
      "api_version": "v1.2",
      "generated_at": "2023-10-25 14:30:45"
    }
  }
  ```

## 高级技巧：资源响应包装

  1. **移除顶层包装**
  ```php
  // 在资源类中添加
  public static $wrap = null;

  // 或者在AppServiceProvider中全局设置
  JsonResource::withoutWrapping();
  ```

  2. **自定义顶层键名**
  ```php
  // 在资源类中
  public static $wrap = 'post';

  // 响应会变成
  {
    "post": {
      "id": 1,
      "title": "..."
    }
  }
  ```

  3. **集合资源自定义**
  ```php
  public function toArray(Request $request): array
  {
      return [
          // 自定义数据结构
          'posts' => $this->collection,
          'total_count' => $this->count(),
          
          // 添加状态信息
          'success' => true,
          'message' => 'Posts retrieved successfully',
      ];
  }
  ```
## 实际使用案例：带过滤的API端点

  ```php
  // 控制器
  public function index(Request $request)
  {
      $query = Post::query();
      
      // 过滤条件
      if ($request->has('category')) {
          $query->where('category', $request->category);
      }
      
      // 排序
      $sort = $request->get('sort', 'latest');
      $query->when($sort === 'popular', fn($q) => $q->orderBy('views', 'desc'));
      $query->when($sort === 'latest', fn($q) => $q->latest());
      
      // 分页
      $posts = $query->paginate(10);
      
      // 返回资源集合
      return new PostCollection($posts);
  }
  ```
## 小贴士

  1. **资源缓存**：对于不常变化的数据，可以缓存资源响应

  ```php
  return Cache::remember('posts.index', 60, function () {
      return new PostCollection(Post::all());
  });
  ```

  2. **资源嵌套限制**：避免无限嵌套

  ```php
  // 在资源类中
  public function toArray(Request $request): array
  {
      return [
          'author' => new UserResource($this->whenLoaded('user')),
      ];
  }
  ```

  3. **统一错误响应**：在资源中使用

  ```php
  public function with(Request $request)
  {
      return [
          'error' => $this->whenNotNull($this->error_message),
      ];
  }
  ```

  4. **性能优化**：使用 `API Resources` 配合 `Eloquent` 的 `with()` 预加载避免N+1查询问题

  ```php
  // 控制器中
  return new PostCollection(Post::with('user', 'tags')->get());
  ```

