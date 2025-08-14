# 任务调度
## 概念

  **什么是任务调度？**
  > - 任务调度就是让系统在特定时间自动执行某些任务（比如清理数据、发送邮件等）。就像你设置闹钟每天7点叫醒你一样。

  **有什么用？**
  - 自动执行重复性任务（如每天清理缓存）
  - 定时处理后台任务（如每小时生成报表）
  - 代替手动操作，提高效率
  - 无需额外软件，直接用Laravel实现

## 一、计划任务定义

  **是什么？**
  > - 计划任务定义就是告诉Laravel你要执行什么任务，以及这个任务什么时候执行。

  **有什么用？**
  - 将任务代码集中管理
  - 定义执行时间和频率
  - 避免手动执行定时任务

  **怎么用？**

  1. **创建任务类**（在命令行执行）：

  ```bash
  php artisan make:command BackupDatabase
  ```

  2. **编辑任务文件 `app/Console/Commands/BackupDatabase.php`**：

  ```php
  class BackupDatabase extends Command
  {
      protected $signature = 'backup:database'; // 命令名称
      protected $description = '每天备份数据库';

      public function handle()
      {
          // 实际执行的任务代码
          $this->info('数据库备份完成！');
      }
  }
  ```

  3. **注册任务（在 `app/Console/Kernel.php`）**：

  ```php
  protected function schedule(Schedule $schedule)
  {
      $schedule->command('backup:database')->daily();
  }
  ```

## 二、调度频率

  **是什么？**
  > - 调度频率就是设置任务执行的频率，比如每分钟、每小时、每天等。

  **有什么用？**
  - 精确控制任务执行时间
  - 灵活应对不同场景需求
  - 避免任务执行过于频繁或不足

  **怎么用？**

  **常用调度方法**
  方法	说明	示例
  ->everyMinute()	每分钟	$schedule->command(...)->everyMinute();
  ->hourly()	每小时	$schedule->command(...)->hourly();
  ->daily()	每天午夜	$schedule->command(...)->daily();
  ->dailyAt('13:00')	每天固定时间	$schedule->command(...)->dailyAt('08:30');
  ->twiceDaily(1, 13)	每天两次	$schedule->command(...)->twiceDaily(9, 17);
  ->weekly()	每周日午夜	$schedule->command(...)->weekly();
  ->monthly()	每月第一天午夜	$schedule->command(...)->monthly();

  **自定义时间（使用Cron表达式）**
  ```php
  // 每周一、三、五的上午10:15执行
  $schedule->command('report:generate')->cron('15 10 * * 1,3,5');
  ```

  **组合使用**
  ```php
  // 工作日上午9点到下午5点，每小时执行
  $schedule->command('check:updates')
          ->weekdays()
          ->between('9:00', '17:00')
          ->hourly();
  ```

## 三、服务器配置

  **是什么？**
  > - 服务器配置就是设置服务器的定时任务（Cron）来每分钟调用Laravel的任务调度器。

  **有什么用？**
  - 让任务调度在服务器上自动运行
  - 确保计划任务按时执行
  - 作为任务调度的触发器

  **怎么用？**

  配置步骤

  1. **登录服务器**（通过SSH）
  2. **打开Cron配置文件**：

  ```bash
  crontab -e
  ```
  3. **添加以下内容**：

  ```bash
  * * * * * cd /你的项目路径 && php artisan schedule:run >> /dev/null 2>&1
  ```

  **关键说明**：
  - `* * * * *` 表示每分钟检查一次
  - /你的项目路径 替换为实际项目绝对路径（如`/home/user/myproject`）
  - `php artisan schedule:run` 是Laravel的调度命令
  - `>> /dev/null 2>&1` 表示静默执行（不产生日志）

  **验证是否生效**：
  ```bash
  # 查看当前Cron任务
  crontab -l

  # 测试调度（会列出所有即将运行的任务）
  php artisan schedule:list
  ```
## 完整示例：数据库每日备份

  1. **创建命令**：

  ```bash
  php artisan make:command DailyBackup
  ```

  2. **编辑命令 (`app/Console/Commands/DailyBackup.php`)**：

  ```php
  public function handle()
  {
      // 实际备份逻辑
      $date = now()->format('Y-m-d');
      $filename = "backup-{$date}.sql";
      
      // 这里使用MySQL示例，实际请用你的数据库命令
      exec("mysqldump -u用户名 -p密码 数据库名 > storage/backups/{$filename}");
      
      $this->info("数据库已备份至: storage/backups/{$filename}");
  }
  ```

  3. **注册调度 (`app/Console/Kernel.php`)**：

  ```php
  protected function schedule(Schedule $schedule)
  {
      $schedule->command('backup:database')
              ->dailyAt('02:00') // 凌晨2点执行
              ->timezone('Asia/Shanghai'); // 设置时区
  }
  ```

  4. **服务器配置Cron**：

  ```bash
  * * * * * cd /var/www/myproject && php artisan schedule:run >> /dev/null 2>&1
  ```
### 常见问题解答

  **Q：本地开发需要配置Cron吗？**  
  A：不需要！可以使用：**

  ```bash
  php artisan schedule:work
  ```
  
  这个命令会在本地每分钟自动运行调度任务。

  **Q：如何查看任务执行记录？**  
  A：在schedule方法中添加：  

  ```php
  $schedule->command('backup:database')
          ->daily()
          ->sendOutputTo(storage_path('logs/backup.log'));
  ```

  **Q：任务重叠怎么办？**  
  A：防止前一个任务还没结束又启动新任务：  

  ```php
  $schedule->command('process:data')->withoutOverlapping();
  ```

  **Q：任务执行时间太长怎么办？**  
  A：设置任务超时时间（单位：秒）：  

  ```php
  $schedule->command('report:generate')
          ->daily()
          ->timeout(120); // 120秒超时
  ```

  **Q：如何只在生产环境运行任务？**  
  A：使用environments方法：  

  ```php
  $schedule->command('backup:database')
          ->daily()
          ->environments(['production']);
  ```
