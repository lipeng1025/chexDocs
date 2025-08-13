# 请求与响应

## 一、请求数据处理

  **是什么？**
  > - 获取用户发送的数据（如表单提交、API请求等）

  **有什么用？**
  - 获取用户输入
  - 验证数据
  - 过滤不安全内容
  - 处理上传文件

  **怎么用？**

  1. **获取请求数据**
  ```php
  use Illuminate\Http\Request;

  public function store(Request $request)
  {
      // 获取单个值
      $name = $request->input('name');
      
      // 带默认值
      $age = $request->input('age', 18);
      
      // 获取所有输入
      $allData = $request->all();
      
      // 获取部分字段
      $only = $request->only(['name', 'email']);
      $except = $request->except('password');
      
      // 检查字段是否存在
      if ($request->has('email')) {
          // 处理邮箱
      }
      
      // 检查字段是否不为空
      if ($request->filled('name')) {
          // 处理名称
      }
  }
  ```

  2. **数据验证**
  ```php
  public function register(Request $request)
  {
      // 基本验证
      $validated = $request->validate([
          'name' => 'required|string|max:255',
          'email' => 'required|email|unique:users',
          'password' => 'required|min:8|confirmed',
      ]);
      
      // 创建用户
      User::create($validated);
      
      return redirect('/dashboard');
  }
  ```

  3. **获取请求信息**
  ```php
  // 获取请求方法
  $method = $request->method(); // GET, POST等

  // 获取请求路径
  $path = $request->path(); // 如：/user/profile

  // 获取完整URL
  $url = $request->url();

  // 获取IP地址
  $ip = $request->ip();

  // 获取浏览器信息
  $userAgent = $request->userAgent();

  // 检查请求类型
  if ($request->is('admin/*')) {
      // 处理admin路径下的请求
  }

  if ($request->ajax()) {
      // 处理AJAX请求
  }
  ```

## 二、响应生成

  **是什么？**
  > - 向用户返回处理结果（页面、JSON、下载文件等）

  **有什么用？**
  - 显示网页内容
  - 返回API数据
  - 下载文件
  - 设置HTTP状态码
  - 添加响应头

  **怎么用？**

  1. **基本响应**
  ```php
  // 返回字符串
  return 'Hello World';

  // 返回视图
  return view('welcome');

  // 返回JSON
  return response()->json([
      'status' => 'success',
      'data' => User::all()
  ]);

  // 设置状态码
  return response('Not Found', 404);

  // 添加响应头
  return response('Hello')
        ->header('Content-Type', 'text/plain')
        ->header('X-Custom-Header', 'Value');
  ```

  2. **视图响应**
  ```php
  // 基本视图
  return view('profile', ['user' => $user]);

  // 带数据的视图
  return view('posts.show', compact('post'));

  // 条件渲染
  return view('dashboard', [
      'isAdmin' => $request->user()->isAdmin()
  ]);
  ```

  3. **JSON响应**
  ```php
  // 基本JSON
  return response()->json([
      'name' => '张三',
      'age' => 25
  ]);

  // 带状态码
  return response()->json([
      'error' => 'Unauthorized'
  ], 401);

  // 使用资源类
  return new UserResource($user);
  ```

  4. **文件下载**
  ```php
  // 下载文件
  return response()->download(
      storage_path('app/reports/report.pdf'),
      '月度报告.pdf'
  );

  // 浏览器内预览
  return response()->file(
      storage_path('app/public/images/avatar.jpg')
  );

  // 流式下载
  return response()->streamDownload(function () {
      echo file_get_contents('https://example.com/large-file.csv');
  }, 'data.csv');
  ```

## 三、重定向

  **是什么？**
  > - 将用户导航到另一个URL

  **有什么用？**
  - 表单提交后跳转
  - 页面跳转
  - 带数据的跳转
  - 返回上一页

  **怎么用？**

  1. **基本重定向**
  ```php
  // 重定向到命名路由
  return redirect()->route('profile');

  // 重定向到控制器方法
  return redirect()->action([UserController::class, 'index']);

  // 重定向到外部URL
  return redirect()->away('https://google.com');

  // 返回上一页
  return back();
  ```

  2. **带数据的重定向**
  ```php
  // 带闪存数据（一次性session）
  return redirect('/dashboard')->with('success', '操作成功！');

  // 带输入数据（常用于表单错误回填）
  return back()->withInput();

  // 带错误信息
  return redirect('/login')->withErrors([
      'email' => '邮箱地址不存在'
  ]);
  ```

  3. **在视图中使用闪存数据**
  ```blade
  @if (session('success'))
      <div class="alert alert-success">
          {{ session('success') }}
      </div>
  @endif

  @if ($errors->any())
      <div class="alert alert-danger">
          <ul>
              @foreach ($errors->all() as $error)
                  <li>{{ $error }}</li>
              @endforeach
          </ul>
      </div>
  @endif
  ```

## 四、文件上传

  **是什么？**
  > - 处理用户上传的文件（图片、文档等）

  **有什么用？**
  - 保存用户头像
  - 上传产品图片
  - 处理文档
  - 验证文件类型

  **怎么用？**

  1. **基本文件上传**
  ```php
  public function uploadAvatar(Request $request)
  {
      // 验证文件
      $request->validate([
          'avatar' => 'required|image|max:2048', // 最大2MB
      ]);
      
      // 存储文件
      $path = $request->file('avatar')->store('avatars');
      
      // 返回文件路径
      return back()->with('success', '上传成功！路径: '.$path);
  }
  ```

  2. **自定义存储**
  ```php
  // 指定磁盘（在config/filesystems.php配置）
  $path = $request->file('avatar')->storeAs(
      'avatars',
      $user->id.'.jpg', // 自定义文件名
      's3' // 使用S3存储
  );

  // 获取原始文件名
  $originalName = $request->file('avatar')->getClientOriginalName();

  // 获取文件扩展名
  $extension = $request->file('avatar')->extension();

  // 获取文件大小（字节）
  $size = $request->file('avatar')->getSize();
  ```

  3. **多文件上传**
  ```php
  public function uploadPhotos(Request $request)
  {
      $request->validate([
          'photos.*' => 'image|max:5120', // 每个文件最大5MB
      ]);
      
      $paths = [];
      
      foreach ($request->file('photos') as $photo) {
          $paths[] = $photo->store('photos');
      }
      
      return back()->with('paths', $paths);
  }
  ```

  4. **图片处理（使用Intervention Image）**
  ```php
  // 安装包：composer require intervention/image

  use Intervention\Image\Facades\Image;

  public function processImage(Request $request)
  {
      $image = $request->file('image');
      
      // 创建缩略图
      $thumbnail = Image::make($image)
          ->resize(300, 300)
          ->save(storage_path('app/public/thumbnails/'.$image->hashName()));
      
      // 添加水印
      $watermarked = Image::make($image)
          ->insert(public_path('watermark.png'), 'bottom-right', 10, 10)
          ->save(storage_path('app/public/watermarked/'.$image->hashName()));
      
      return back()->with('success', '图片处理完成');
  }
  ```

## 实际应用：完整头像上传示例

  **控制器方法**
  ```php
  public function updateAvatar(Request $request)
  {
      // 验证
      $request->validate([
          'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
      ]);
      
      // 获取当前用户
      $user = auth()->user();
      
      // 删除旧头像
      if ($user->avatar) {
          Storage::delete($user->avatar);
      }
      
      // 存储新头像
      $path = $request->file('avatar')->store('avatars', 'public');
      
      // 更新用户记录
      $user->update(['avatar' => $path]);
      
      // 重定向返回
      return back()->with('success', '头像更新成功！');
  }
  ```

  **视图文件 (`resources/views/profile/edit.blade.php`)**
  ```blade
  <form action="{{ route('avatar.update') }}" method="POST" enctype="multipart/form-data">
      @csrf
      @method('PUT')
      
      <div class="form-group">
          <label for="avatar">选择头像</label>
          <input type="file" name="avatar" id="avatar" class="form-control-file">
          @error('avatar')
              <div class="text-danger">{{ $message }}</div>
          @enderror
      </div>
      
      <button type="submit" class="btn btn-primary">上传</button>
  </form>

  @if(session('success'))
      <div class="alert alert-success mt-3">
          {{ session('success') }}
      </div>
  @endif
  ```

  **路由配置 (`routes/web.php`)**
  ```php
  Route::put('/profile/avatar', [ProfileController::class, 'updateAvatar'])
      ->name('avatar.update');
  ```
## 小贴士

  - **文件存储配置**：修改config/filesystems.php设置默认磁盘

  - **安全考虑**：

      - 验证文件类型（不要依赖扩展名）
      - 限制文件大小
      - 对上传文件进行病毒扫描

  - **性能优化**：

      - 对大文件使用流处理
      - 使用队列处理耗时操作（如视频转码）

  - **云存储**：

  ```php
  // 使用S3存储
  $path = $request->file('avatar')->store(
      'avatars', 
      's3'
  );

  // 生成公开URL
  $url = Storage::disk('s3')->url($path);
  ```

