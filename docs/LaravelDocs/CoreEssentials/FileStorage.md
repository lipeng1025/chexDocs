# 文件存储基础

## 一、存储配置

  **是什么？**
  > - 配置Laravel如何存储和管理文件（本地存储、云存储等）

  **有什么用？**
  - 统一文件访问接口
  - 轻松切换存储位置（本地/S3/OSS等）
  - 管理文件访问权限
  - 配置存储路径和URL生成

  **怎么用？**

  **步骤1：配置文件系统 (`config/filesystems.php`)**
  ```php
  return [
      'default' => env('FILESYSTEM_DISK', 'local'),
      
      'disks' => [
          'local' => [
              'driver' => 'local',
              'root' => storage_path('app'),
              'throw' => false,
          ],
          
          'public' => [
              'driver' => 'local',
              'root' => storage_path('app/public'),
              'url' => env('APP_URL').'/storage',
              'visibility' => 'public',
              'throw' => false,
          ],
          
          's3' => [
              'driver' => 's3',
              'key' => env('AWS_ACCESS_KEY_ID'),
              'secret' => env('AWS_SECRET_ACCESS_KEY'),
              'region' => env('AWS_DEFAULT_REGION'),
              'bucket' => env('AWS_BUCKET'),
              'url' => env('AWS_URL'),
              'endpoint' => env('AWS_ENDPOINT'),
              'use_path_style_endpoint' => env('AWS_USE_PATH_STYLE_ENDPOINT', false),
              'throw' => false,
          ],
      ],
  ];
  ```

  **步骤2：配置环境变量 (.env)**
  ```env
  # 默认存储磁盘
  FILESYSTEM_DISK=public

  # 本地公共存储URL
  APP_URL=http://localhost:8000

  # S3配置
  AWS_ACCESS_KEY_ID=your-access-key
  AWS_SECRET_ACCESS_KEY=your-secret-key
  AWS_DEFAULT_REGION=us-east-1
  AWS_BUCKET=your-bucket
  AWS_URL=https://your-bucket.s3.amazonaws.com
  ```

  **步骤3：创建符号链接（本地公共存储）**
  ```bash
  # 创建public/storage到storage/app/public的链接
  php artisan storage:link
  ```

  **步骤4：使用不同磁盘**
  ```php
  // 使用默认磁盘
  Storage::put('file.txt', '内容');

  // 使用特定磁盘
  Storage::disk('s3')->put('file.txt', '内容');
  ```

## 二、文件上传下载

  **是什么？**
  > - 处理用户上传文件并提供文件下载功能

  **有什么用？**
  - 接收用户上传的文件
  - 存储文件到指定位置
  - 提供文件下载服务
  - 生成文件访问URL

  **怎么用？**

  1. **文件上传基础**
  ```php
  use Illuminate\Support\Facades\Storage;

  public function upload(Request $request)
  {
      // 验证上传文件
      $request->validate([
          'file' => 'required|file|max:10240', // 最大10MB
      ]);
      
      // 存储文件
      $path = $request->file('file')->store('uploads');
      
      // 获取存储路径
      $fullPath = Storage::path($path);
      
      return response()->json([
          'path' => $path,
          'url' => Storage::url($path)
      ]);
  }
  ```

  2. **上传文件到不同磁盘**
  ```php
  // 上传到公共存储
  $path = $request->file('avatar')->store(
      'avatars', // 存储目录
      'public'   // 磁盘名称
  );

  // 上传到S3
  $s3Path = $request->file('document')->store(
      'documents',
      's3'
  );
  ```

  3. **文件下载**
  ```php
  public function download($filename)
  {
      // 本地文件下载
      return Storage::download("uploads/{$filename}");
      
      // 重命名下载文件
      return Storage::download("uploads/{$filename}", "用户文件.jpg");
      
      // S3文件下载
      return Storage::disk('s3')->download("documents/{$filename}");
  }
  ```

  4. **文件预览（不下载）**
  ```php
  public function preview($filename)
  {
      // 预览图片
      return response()->file(Storage::path("uploads/{$filename}"));
      
      // 预览PDF
      return response()->file(Storage::path("docs/{$filename}"), [
          'Content-Type' => 'application/pdf'
      ]);
  }
  ```
## 完整文件管理示例

  1. **图片上传（带缩略图）**
  ```php
  use Intervention\Image\Facades\Image;

  public function uploadImage(Request $request)
  {
      $request->validate([
          'image' => 'required|image|max:5120', // 5MB
      ]);
      
      // 原始图片
      $path = $request->file('image')->store('images', 'public');
      
      // 创建缩略图
      $image = Image::make($request->file('image'))
          ->resize(300, null, function ($constraint) {
              $constraint->aspectRatio();
          });
      
      // 存储缩略图
      $thumbnailPath = 'thumbnails/' . basename($path);
      Storage::disk('public')->put($thumbnailPath, $image->encode());
      
      return response()->json([
          'original' => Storage::url($path),
          'thumbnail' => Storage::url($thumbnailPath)
      ]);
  }
  ```

  2. **文件管理控制器**
  ```php
  namespace App\Http\Controllers;

  use Illuminate\Http\Request;
  use Illuminate\Support\Facades\Storage;

  class FileController extends Controller
  {
      // 显示上传表单
      public function create()
      {
          return view('files.upload');
      }
      
      // 处理上传
      public function store(Request $request)
      {
          $request->validate([
              'file' => 'required|file|max:10240',
          ]);
          
          $path = $request->file('file')->store('uploads', 'public');
          
          return back()->with('success', '上传成功！')
                      ->with('path', $path)
                      ->with('url', Storage::url($path));
      }
      
      // 文件列表
      public function index()
      {
          $files = Storage::disk('public')->files('uploads');
          
          return view('files.index', [
              'files' => array_map(function ($file) {
                  return [
                      'name' => basename($file),
                      'size' => Storage::size($file),
                      'last_modified' => Storage::lastModified($file),
                      'url' => Storage::url($file)
                  ];
              }, $files)
          ]);
      }
      
      // 下载文件
      public function download($filename)
      {
          return Storage::disk('public')->download("uploads/{$filename}");
      }
      
      // 删除文件
      public function destroy($filename)
      {
          Storage::disk('public')->delete("uploads/{$filename}");
          
          return back()->with('success', '文件已删除');
      }
  }
  ```

  3. **视图文件 (`resources/views/files/upload.blade.php`)**
  ```blade
  @extends('layouts.app')

  @section('content')
  <div class="container">
      <h1>文件上传</h1>
      
      @if(session('success'))
          <div class="alert alert-success">
              {{ session('success') }}
              @if(session('path'))
                  <p>文件路径: {{ session('path') }}</p>
                  <p>访问URL: <a href="{{ session('url') }}" target="_blank">{{ session('url') }}</a></p>
              @endif
          </div>
      @endif
      
      <form action="{{ route('files.store') }}" method="POST" enctype="multipart/form-data">
          @csrf
          <div class="mb-3">
              <label for="file" class="form-label">选择文件</label>
              <input class="form-control" type="file" id="file" name="file">
          </div>
          <button type="submit" class="btn btn-primary">上传</button>
      </form>
  </div>
  @endsection
  ```

  4. **文件列表视图 (resources/views/files/index.blade.php)**
  ```blade
  @extends('layouts.app')

  @section('content')
  <div class="container">
      <h1>文件列表</h1>
      
      <table class="table">
          <thead>
              <tr>
                  <th>文件名</th>
                  <th>大小</th>
                  <th>修改时间</th>
                  <th>操作</th>
              </tr>
          </thead>
          <tbody>
              @foreach($files as $file)
              <tr>
                  <td>{{ $file['name'] }}</td>
                  <td>{{ round($file['size'] / 1024, 2) }} KB</td>
                  <td>{{ date('Y-m-d H:i', $file['last_modified']) }}</td>
                  <td>
                      <a href="{{ $file['url'] }}" target="_blank" class="btn btn-sm btn-success">查看</a>
                      <a href="{{ route('files.download', $file['name']) }}" class="btn btn-sm btn-primary">下载</a>
                      <form action="{{ route('files.destroy', $file['name']) }}" method="POST" class="d-inline">
                          @csrf
                          @method('DELETE')
                          <button type="submit" class="btn btn-sm btn-danger">删除</button>
                      </form>
                  </td>
              </tr>
              @endforeach
          </tbody>
      </table>
  </div>
  @endsection
  ```

  5. **路由配置 (`routes/web.php`)**
  ```php
  Route::prefix('files')->group(function () {
      Route::get('upload', [FileController::class, 'create'])->name('files.create');
      Route::post('upload', [FileController::class, 'store'])->name('files.store');
      Route::get('list', [FileController::class, 'index'])->name('files.index');
      Route::get('download/{filename}', [FileController::class, 'download'])->name('files.download');
      Route::delete('delete/{filename}', [FileController::class, 'destroy'])->name('files.destroy');
  });
  ```
## 高级文件操作

  1. **文件流处理（大文件）**
  ```php
  public function downloadLargeFile($filename)
  {
      // 流式下载大文件
      return Storage::disk('s3')->response("large-files/{$filename}");
      
      // 流式上传
      $stream = fopen('php://input', 'r');
      Storage::disk('s3')->put("incoming/{$filename}", $stream);
      fclose($stream);
  }
  ```

  2. **文件分块上传**
  ```php
  public function chunkUpload(Request $request)
  {
      $request->validate([
          'file' => 'required|file',
          'chunkIndex' => 'required|integer',
          'totalChunks' => 'required|integer',
          'uuid' => 'required|string',
      ]);
      
      $file = $request->file('file');
      $chunkPath = "chunks/{$request->uuid}/{$request->chunkIndex}";
      
      // 存储分块
      $file->storeAs('', $chunkPath, 'local');
      
      // 如果是最后一个分块，合并文件
      if ($request->chunkIndex == $request->totalChunks - 1) {
          $finalPath = "uploads/{$request->uuid}/{$file->getClientOriginalName()}";
          $this->mergeChunks($request->uuid, $finalPath, $request->totalChunks);
          
          return response()->json([
              'status' => 'completed',
              'path' => $finalPath
          ]);
      }
      
      return response()->json(['status' => 'chunk_uploaded']);
  }

  private function mergeChunks($uuid, $finalPath, $totalChunks)
  {
      $finalFile = fopen(Storage::path($finalPath), 'wb');
      
      for ($i = 0; $i < $totalChunks; $i++) {
          $chunkPath = Storage::path("chunks/{$uuid}/{$i}");
          $chunk = fopen($chunkPath, 'rb');
          stream_copy_to_stream($chunk, $finalFile);
          fclose($chunk);
          unlink($chunkPath); // 删除分块
      }
      
      fclose($finalFile);
      rmdir(Storage::path("chunks/{$uuid}"));
  }
  ```

  3. **文件权限管理**
  ```php
  // 设置文件可见性
  Storage::disk('s3')->setVisibility('file.txt', 'private');

  // 获取临时访问URL（私有文件）
  $url = Storage::disk('s3')->temporaryUrl(
      'private/file.txt',
      now()->addMinutes(30)
  );

  // 生成公共URL
  $publicUrl = Storage::disk('s3')->url('public/file.jpg');
  ```
## 文件操作实用方法

  1. **文件是否存在**
  ```php
  if (Storage::exists('file.txt')) {
      // 文件存在
  }
  ```

  2. **获取文件大小**
  ```php
  $size = Storage::size('file.jpg'); // 字节数
  $sizeKB = round($size / 1024, 2); // 转换为KB
  ```

  3. **文件最后修改时间**
  ```php
  $timestamp = Storage::lastModified('file.txt');
  $date = date('Y-m-d H:i:s', $timestamp);
  ```

  4. **复制/移动文件**
  ```php
  // 复制文件
  Storage::copy('old/file.txt', 'new/file.txt');

  // 移动文件
  Storage::move('old/file.txt', 'new/file.txt');
  ```

  5. **文件列表**
  ```php
  // 获取目录下所有文件
  $files = Storage::files('uploads');

  // 递归获取所有文件
  $allFiles = Storage::allFiles('uploads');

  // 获取目录
  $directories = Storage::directories('images');
  ```

  6. **创建/删除目录**
  ```php
  // 创建目录
  Storage::makeDirectory('new-folder');

  // 删除目录（包括内容）
  Storage::deleteDirectory('old-folder');
  ```
## 最佳实践

  1. **安全建议**
  ```php
  // 验证文件类型（不要信任扩展名）
  $request->validate([
      'file' => 'required|mimetypes:image/jpeg,image/png,application/pdf',
  ]);

  // 防止目录遍历攻击
  $safePath = basename($request->input('file_path'));
  ```

  2. **性能优化**
  ```php
  // 使用流处理大文件
  Storage::writeStream('large-file.zip', fopen('source.zip', 'r'));

  // 异步处理文件操作
  ProcessFileJob::dispatch($filePath)->onQueue('file-processing');
  ```

  3. **云存储集成**
  ```php
  // 配置阿里云OSS
  'disks' => [
      'oss' => [
          'driver' => 'oss',
          'access_id' => env('OSS_ACCESS_KEY_ID'),
          'access_key' => env('OSS_ACCESS_KEY_SECRET'),
          'bucket' => env('OSS_BUCKET'),
          'endpoint' => env('OSS_ENDPOINT'),
      ],
  ],

  // 使用OSS上传
  Storage::disk('oss')->put('file.txt', '内容');
  ```

  4. **文件处理队列**
  ```php
  // 创建处理任务
  php artisan make:job ProcessUploadedFile

  // 任务类
  class ProcessUploadedFile implements ShouldQueue
  {
      use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
      
      public function __construct(public string $filePath) {}
      
      public function handle()
      {
          // 处理文件（压缩、加水印等）
          $image = Image::make(Storage::path($this->filePath));
          $image->resize(1000, null, function ($constraint) {
              $constraint->aspectRatio();
          })->save();
          
          // 生成缩略图
          $thumbnail = $image->resize(300, 300)->encode();
          Storage::put('thumbnails/' . basename($this->filePath), $thumbnail);
      }
  }

  // 在控制器中使用
  public function store(Request $request)
  {
      $path = $request->file('file')->store('uploads');
      ProcessUploadedFile::dispatch($path);
      return response()->json(['message' => '文件处理中...']);
  }
  ```


