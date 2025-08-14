# 文件存储进阶
## 概念

  **什么是文件存储进阶？**
  > - 文件存储进阶就像给你的应用添加了"超能力"，让它不仅能存文件，还能自定义存储位置、处理大文件流、优化文件管理，就像从普通仓库升级为智能仓储系统。

  **有什么用？**
  - 自定义存储位置（云存储、FTP等）
  - 高效处理大文件
  - 优化文件上传下载性能
  - 实现文件流处理
  - 增强文件存储安全性

## 一、自定义驱动

  **是什么？**
  > - 自定义驱动就是创建自己的文件存储方式，不再局限于本地磁盘或S3，可以接入任何存储系统（如FTP、SFTP、WebDAV等）。

  **有什么用？**
  - 集成特殊存储系统
  - 连接企业内部存储
  - 定制特殊存储逻辑
  - 统一不同存储系统的API

  **怎么用？**

  1. **创建自定义驱动类**
  ```bash
  php artisan make:provider CustomStorageServiceProvider
  ```

  2. **编辑服务提供者 `app/Providers/CustomStorageServiceProvider.php`**
  ```php
  use Illuminate\Support\Facades\Storage;
  use Illuminate\Support\ServiceProvider;
  use League\Flysystem\Filesystem;
  use League\Flysystem\Sftp\SftpAdapter;

  class CustomStorageServiceProvider extends ServiceProvider
  {
      public function boot()
      {
          Storage::extend('sftp', function ($app, $config) {
              $adapter = new SftpAdapter([
                  'host' => $config['host'],
                  'port' => $config['port'],
                  'username' => $config['username'],
                  'password' => $config['password'],
                  'root' => $config['root'],
                  'timeout' => 30,
              ]);
              
              return new Filesystem($adapter);
          });
      }
  }
  ```

  3. **注册服务提供者 `config/app.php`**
  ```php
  'providers' => [
      // ...
      App\Providers\CustomStorageServiceProvider::class,
  ],
  ```

  4. **配置自定义驱动 `config/filesystems.php`**
  ```php
  'disks' => [
      // ...
      'sftp' => [
          'driver' => 'sftp',
          'host' => env('SFTP_HOST'),
          'port' => env('SFTP_PORT', 22),
          'username' => env('SFTP_USERNAME'),
          'password' => env('SFTP_PASSWORD'),
          'root' => env('SFTP_ROOT', '/'),
      ],
  ],
  ```

  5. **使用自定义驱动**
  ```php
  // 存储文件
  Storage::disk('sftp')->put('file.txt', '内容');

  // 获取文件
  $content = Storage::disk('sftp')->get('file.txt');

  // 下载文件
  return Storage::disk('sftp')->download('file.txt');
  ```

  6. **实际应用：WebDAV驱动**
  ```php
  // 自定义WebDAV驱动
  Storage::extend('webdav', function ($app, $config) {
      $client = new \Sabre\DAV\Client([
          'baseUri' => $config['base_uri'],
          'userName' => $config['username'],
          'password' => $config['password'],
      ]);
      
      $adapter = new \League\Flysystem\WebDAV\WebDAVAdapter($client);
      
      return new Filesystem($adapter);
  });
  ```

## 二、文件流操作

  **是什么？**
  > - 文件流操作就是不把整个文件加载到内存，而是像"流水线"一样边读边处理，特别适合处理大文件。

  **有什么用？**
  - 处理超大文件（GB级以上）
  - 减少内存占用
  - 提高文件处理效率
  - 支持实时文件处理
  - 避免服务器内存溢出

  **怎么用？**

  1. **流式上传大文件**
  ```php
  public function uploadLargeFile(Request $request)
  {
      // 获取输入流
      $stream = fopen('php://input', 'r');
      
      // 创建目标文件
      $filePath = 'large-files/'.now()->format('YmdHis').'.dat';
      $destination = Storage::disk('s3')->writeStream($filePath, $stream);
      
      // 关闭流
      if (is_resource($stream)) {
          fclose($stream);
      }
      
      return response()->json(['path' => $filePath]);
  }
  ```

  2. **流式下载大文件**
  ```php
  public function downloadLargeFile($filename)
  {
      $filePath = 'large-files/'.$filename;
      
      // 检查文件是否存在
      if (!Storage::disk('s3')->exists($filePath)) {
          abort(404);
      }
      
      // 创建读取流
      $stream = Storage::disk('s3')->readStream($filePath);
      
      // 返回流式响应
      return response()->stream(function() use ($stream) {
          while (!feof($stream)) {
              echo fread($stream, 1024 * 1024); // 每次读取1MB
              flush();
          }
          fclose($stream);
      }, 200, [
          'Content-Type' => Storage::mimeType($filePath),
          'Content-Disposition' => 'attachment; filename="'.$filename.'"'
      ]);
  }
  ```

  3. **流式处理CSV文件**
  ```php
  public function processLargeCsv()
  {
      $csvPath = 'large-data.csv';
      $stream = Storage::disk('local')->readStream($csvPath);
      
      // 跳过标题行
      fgetcsv($stream);
      
      // 逐行处理
      $processed = 0;
      while (($row = fgetcsv($stream)) !== false) {
          // 处理每行数据
          $this->processRow($row);
          $processed++;
          
          // 每处理1000行释放内存
          if ($processed % 1000 === 0) {
              gc_collect_cycles();
          }
      }
      
      fclose($stream);
      return "处理完成，共处理 {$processed} 行数据";
  }
  ```

  4. **流式视频处理**
  ```php
  public function streamVideo($videoId)
  {
      $video = Video::findOrFail($videoId);
      $path = $video->path;
      
      // 获取文件大小
      $size = Storage::size($path);
      $stream = Storage::readStream($path);
      
      // 处理范围请求（支持断点续传）
      $range = request()->header('Range');
      $rangeData = $this->parseRangeHeader($range, $size);
      
      // 设置响应头
      $headers = [
          'Content-Type' => 'video/mp4',
          'Content-Length' => $rangeData['length'],
          'Content-Range' => 'bytes '.$rangeData['start'].'-'.$rangeData['end'].'/'.$size,
          'Accept-Ranges' => 'bytes',
      ];
      
      // 定位到指定位置
      fseek($stream, $rangeData['start']);
      
      // 返回部分内容流
      return response()->stream(function() use ($stream, $rangeData) {
          $remaining = $rangeData['length'];
          while ($remaining > 0 && !feof($stream)) {
              $chunkSize = min(1024 * 8, $remaining); // 每次8KB
              echo fread($stream, $chunkSize);
              $remaining -= $chunkSize;
              flush();
          }
          fclose($stream);
      }, 206, $headers);
  }

  private function parseRangeHeader($range, $fileSize)
  {
      if (!$range) {
          return [
              'start' => 0,
              'end' => $fileSize - 1,
              'length' => $fileSize
          ];
      }
      
      list(, $range) = explode('=', $range, 2);
      list($start, $end) = explode('-', $range, 2);
      
      $end = (empty($end)) ? $fileSize - 1 : min(abs(intval($end)), $fileSize - 1);
      $start = (empty($start)) ? 0 : max(abs(intval($start)), 0);
      
      if ($start > $end) {
          $start = 0;
          $end = $fileSize - 1;
      }
      
      return [
          'start' => $start,
          'end' => $end,
          'length' => $end - $start + 1
      ];
  }
  ```

  5. **实际应用：大文件加密传输**
  ```php
  public function downloadEncryptedFile($filename)
  {
      $filePath = 'sensitive-files/'.$filename;
      
      // 检查文件是否存在
      if (!Storage::exists($filePath)) {
          abort(404);
      }
      
      // 创建加密流
      $method = 'aes-256-cbc';
      $key = config('app.encryption_key');
      $iv = random_bytes(16);
      
      // 创建读取流
      $source = Storage::readStream($filePath);
      
      // 返回加密流
      return response()->stream(function() use ($source, $method, $key, $iv) {
          // 输出IV
          echo $iv;
          
          // 创建加密上下文
          $context = stream_filter_append($source, 'encrypt', STREAM_FILTER_READ, [
              'key' => $key,
              'iv' => $iv,
              'method' => $method
          ]);
          
          // 流式输出
          while (!feof($source)) {
              echo fread($source, 1024 * 8); // 每次8KB
              flush();
          }
          
          // 清理
          stream_filter_remove($context);
          fclose($source);
      }, 200, [
          'Content-Type' => 'application/octet-stream',
          'Content-Disposition' => 'attachment; filename="'.$filename.'.enc"',
          'X-Encryption-Method' => $method,
          'X-Encryption-IV' => base64_encode($iv),
      ]);
  }
  ```
## 完整示例：云存储集成+大文件处理

  1. **配置多磁盘存储 `config/filesystems.php`**
  ```php
  'disks' => [
      'local' => [
          'driver' => 'local',
          'root' => storage_path('app'),
      ],

      's3' => [
          'driver' => 's3',
          'key' => env('AWS_ACCESS_KEY_ID'),
          'secret' => env('AWS_SECRET_ACCESS_KEY'),
          'region' => env('AWS_DEFAULT_REGION'),
          'bucket' => env('AWS_BUCKET'),
          'url' => env('AWS_URL'),
      ],
      
      'backup' => [
          'driver' => 'sftp',
          'host' => env('BACKUP_HOST'),
          'port' => env('BACKUP_PORT', 22),
          'username' => env('BACKUP_USERNAME'),
          'password' => env('BACKUP_PASSWORD'),
          'root' => env('BACKUP_ROOT', '/backups'),
      ],
  ],
  ```

  2. **大文件分块上传前端代码**
  ```html
  <!-- resources/views/upload.blade.php -->
  <input type="file" id="largeFile">

  <script>
  document.getElementById('largeFile').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      const chunkSize = 5 * 1024 * 1024; // 5MB
      const totalChunks = Math.ceil(file.size / chunkSize);
      
      // 初始化上传
      const { data: { uploadId } } = await axios.post('/upload/init', {
          filename: file.name,
          totalChunks
      });
      
      // 分块上传
      for (let i = 0; i < totalChunks; i++) {
          const start = i * chunkSize;
          const end = Math.min(start + chunkSize, file.size);
          const chunk = file.slice(start, end);
          
          const formData = new FormData();
          formData.append('chunk', chunk);
          formData.append('chunkIndex', i);
          formData.append('uploadId', uploadId);
          
          await axios.post('/upload/chunk', formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
          });
          
          console.log(`上传进度: ${Math.round(((i + 1) / totalChunks) * 100)}%`);
      }
      
      // 完成上传
      await axios.post('/upload/complete', { uploadId });
      alert('文件上传完成！');
  });
  </script>
  ```

  3. **后端分块上传处理**
  ```php
  // 初始化上传
  public function initUpload(Request $request)
  {
      $request->validate([
          'filename' => 'required|string',
          'totalChunks' => 'required|integer|min:1'
      ]);
      
      $uploadId = uniqid();
      $filename = $request->filename;
      
      // 保存上传信息到缓存
      Cache::put("upload:{$uploadId}", [
          'filename' => $filename,
          'totalChunks' => $request->totalChunks,
          'receivedChunks' => 0
      ], now()->addHours(2));
      
      return response()->json(['uploadId' => $uploadId]);
  }

  // 处理分块
  public function uploadChunk(Request $request)
  {
      $request->validate([
          'chunk' => 'required|file',
          'chunkIndex' => 'required|integer|min:0',
          'uploadId' => 'required|string'
      ]);
      
      $upload = Cache::get("upload:{$request->uploadId}");
      if (!$upload) {
          return response()->json(['error' => 'Invalid upload ID'], 400);
      }
      
      // 保存分块到临时目录
      $chunk = $request->file('chunk');
      $chunk->storeAs('tmp', "{$request->uploadId}_{$request->chunkIndex}", 'local');
      
      // 更新进度
      $upload['receivedChunks']++;
      Cache::put("upload:{$request->uploadId}", $upload, now()->addHours(2));
      
      return response()->json(['success' => true]);
  }

  // 完成上传并合并文件
  public function completeUpload(Request $request)
  {
      $request->validate(['uploadId' => 'required|string']);
      
      $upload = Cache::get("upload:{$request->uploadId}");
      if (!$upload || $upload['receivedChunks'] < $upload['totalChunks']) {
          return response()->json(['error' => 'Upload not complete'], 400);
      }
      
      // 创建目标文件
      $finalPath = 'uploads/'.$upload['filename'];
      $finalStream = Storage::disk('s3')->writeStream($finalPath, fopen('php://temp', 'r+'));
      
      // 合并所有分块
      for ($i = 0; $i < $upload['totalChunks']; $i++) {
          $chunkPath = storage_path('app/tmp/'.$request->uploadId.'_'.$i);
          $chunkStream = fopen($chunkPath, 'r');
          
          while (!feof($chunkStream)) {
              fwrite($finalStream, fread($chunkStream, 1024 * 1024)); // 1MB
          }
          
          fclose($chunkStream);
          unlink($chunkPath); // 删除临时分块
      }
      
      fclose($finalStream);
      Cache::forget("upload:{$request->uploadId}");
      
      return response()->json(['path' => $finalPath]);
  }
  ```

  4. **文件处理管道（流式处理）**
  ```php
  public function processFilePipeline($filePath)
  {
      // 创建处理管道
      $source = Storage::disk('s3')->readStream($filePath);
      $processedPath = 'processed/'.basename($filePath);
      $destination = Storage::disk('s3')->writeStream($processedPath, fopen('php://temp', 'r+'));
      
      // 添加处理过滤器
      stream_filter_append($source, 'convert.iconv.UTF-8/ISO-8859-1'); // 转换编码
      stream_filter_append($source, 'string.toupper'); // 转为大写
      
      // 流式处理
      while (!feof($source)) {
          $data = fread($source, 8192); // 8KB
          fwrite($destination, $data);
      }
      
      // 关闭流
      fclose($source);
      fclose($destination);
      
      return response()->download(
          Storage::disk('s3')->temporaryUrl($processedPath, now()->addMinutes(10))
      );
  }
  ```
## 常见问题解答

  **Q：如何获取文件URL？**  
  A：

  ```php
  // 公共URL（需配置公开访问）
  $url = Storage::url('file.jpg');

  // 临时签名URL（私有文件）
  $url = Storage::temporaryUrl(
      'private/file.jpg', 
      now()->addMinutes(5)
  );
  ```

  **Q：如何监听存储事件？**  
  A：

  ```php
  // 在EventServiceProvider中注册
  protected $listen = [
      'Illuminate\Filesystem\Events\FileUploaded' => [
          'App\Listeners\ProcessUploadedFile',
      ],
  ];

  // 监听器示例
  class ProcessUploadedFile
  {
      public function handle(FileUploaded $event)
      {
          // $event->path 上传文件路径
          // $event->disk 存储磁盘
          logger()->info("文件已上传: {$event->path}");
      }
  }
  ```

  **Q：如何限制文件上传大小？**  
  A：在`.env`中配置：

  ```env
  # 最大上传10MB
  UPLOAD_MAX_SIZE=10240 # KB
  ```

  在`php.ini`中：

  ```ini
  upload_max_filesize = 10M
  post_max_size = 12M
  ```

  **Q：如何验证文件类型？**  
  A：

  ```php
  $request->validate([
      'file' => 'file|mimetypes:video/mp4,application/pdf|max:10240'
  ]);
  ```

  **Q：如何生成文件缩略图？**  
  A：使用Intervention Image：

  ```php
  use Intervention\Image\Facades\Image;

  // 创建缩略图
  $image = Image::make(Storage::get('original.jpg'))
      ->resize(300, 200)
      ->encode('jpg', 80);

  Storage::put('thumbnails/thumb.jpg', $image);
  ```

  **Q：如何清理临时文件？**  
  A：创建定时任务：

  ```bash
  php artisan make:command CleanTempFiles
  ```
  
  ```php
  // app/Console/Commands/CleanTempFiles.php
  public function handle()
  {
      // 清理超过24小时的临时文件
      $files = Storage::disk('local')->files('tmp');
      $deleted = 0;
      
      foreach ($files as $file) {
          if (Storage::lastModified($file) < now()->subDay()->timestamp) {
              Storage::delete($file);
              $deleted++;
          }
      }
      
      $this->info("清理完成，删除 {$deleted} 个临时文件");
  }
  ```

  **Q：如何测试文件存储？**  
  A：使用假存储：

  ```php
  // 在测试中
  Storage::fake('s3');

  // 执行文件操作
  Storage::disk('s3')->put('file.txt', 'Content');

  // 断言文件已存储
  Storage::disk('s3')->assertExists('file.txt');
  ```
