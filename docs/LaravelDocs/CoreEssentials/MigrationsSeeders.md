# 数据库迁移与填充

## 一、迁移创建与运行

  **是什么？**
  > - 数据库迁移就像是数据库的版本控制，用代码定义数据库结构变更（创建表、修改字段等）

  **有什么用？**
  - 团队共享数据库结构变更
  - 不用手动操作数据库
  - 随时回滚变更
  - 保持开发和生产环境数据库一致

  **怎么用？**

  **步骤1：创建迁移文件**
  ```bash
  # 创建posts表的迁移文件
  php artisan make:migration create_posts_table

  # 创建修改users表的迁移文件
  php artisan make:migration add_avatar_to_users_table --table=users
  ```

  **步骤2：编写迁移文件 (`database/migrations/xxxx_create_posts_table.php`)**
  ```php
  use Illuminate\Database\Migrations\Migration;
  use Illuminate\Database\Schema\Blueprint;
  use Illuminate\Support\Facades\Schema;

  class CreatePostsTable extends Migration
  {
      public function up()
      {
          Schema::create('posts', function (Blueprint $table) {
              $table->id(); // 自增主键
              $table->string('title', 100); // 字符串字段
              $table->text('content'); // 长文本字段
              $table->integer('views')->default(0); // 整数默认值
              $table->foreignId('user_id')->constrained(); // 外键关联
              $table->timestamps(); // 自动创建 created_at 和 updated_at
          });
      }

      public function down()
      {
          Schema::dropIfExists('posts'); // 回滚时删除表
      }
  }
  ```

  **修改字段的迁移文件示例**：
  ```php
  public function up()
  {
      Schema::table('users', function (Blueprint $table) {
          $table->string('avatar')->nullable()->after('email'); // 在email后添加头像字段
      });
  }

  public function down()
  {
      Schema::table('users', function (Blueprint $table) {
          $table->dropColumn('avatar'); // 回滚时删除该字段
      });
  }
  ```

  **步骤3：运行迁移**
  ```bash
  # 运行所有未执行的迁移
  php artisan migrate

  # 回滚上一次迁移（撤销操作）
  php artisan migrate:rollback

  # 回滚所有迁移（清空所有表）
  php artisan migrate:reset

  # 重建数据库（先删除所有表再重新运行迁移）
  php artisan migrate:fresh
  ```

## 二、数据填充

  **是什么？**
  > - 用代码向数据库插入初始测试数据的过程

  **有什么用？**
  - 快速填充测试数据
  - 初始化必要数据（如管理员账号）
  - 方便团队共享测试数据

  **怎么用？**

  **步骤1：创建填充器**
  ```bash
  php artisan make:seeder UsersTableSeeder
  ```

  **步骤2：编写填充器 (`database/seeders/UsersTableSeeder.php`)**
  ```php
  use App\Models\User;
  use Illuminate\Database\Seeder;

  class UsersTableSeeder extends Seeder
  {
      public function run()
      {
          // 创建10个普通用户
          User::factory(10)->create();
          
          // 创建管理员账户
          User::create([
              'name' => '管理员',
              'email' => 'admin@example.com',
              'password' => bcrypt('123456'),
              'role' => 'admin'
          ]);
          
          // 输出提示信息
          $this->command->info('用户数据填充完成！');
      }
  }
  ```

  **步骤3：注册填充器 (`database/seeders/DatabaseSeeder.php`)**
  ```php
  public function run()
  {
      $this->call([
          UsersTableSeeder::class,
          PostsTableSeeder::class,
          // 添加其他填充器...
      ]);
  }
  ```

  **步骤4：运行填充**
  ```bash
  # 运行所有填充器
  php artisan db:seed

  # 运行指定填充器
  php artisan db:seed --class=UsersTableSeeder

  # 迁移+填充一条龙
  php artisan migrate --seed
  ```

## 三、工厂模式

  **是什么？**
  > - 批量生成测试数据的工具，定义如何创建模型实例

  **有什么用？**
  - 快速生成大量测试数据
  - 自动生成关联数据
  - 自定义数据规则
  - 简化测试数据准备

  **怎么用？**

  **步骤1：创建工厂**
  ```bash
  php artisan make:factory PostFactory --model=Post
  ```

  **步骤2：编写工厂 (`database/factories/PostFactory.php`)**
  ```php
  use App\Models\Post;
  use App\Models\User;
  use Illuminate\Database\Eloquent\Factories\Factory;

  class PostFactory extends Factory
  {
      protected $model = Post::class;

      public function definition()
      {
          return [
              'user_id' => User::factory(), // 自动创建关联用户
              'title' => $this->faker->sentence(6), // 随机生成6个单词的句子
              'content' => $this->faker->paragraphs(3, true), // 3段文字
              'views' => $this->faker->numberBetween(0, 1000),
              'published_at' => $this->faker->dateTimeThisYear()
          ];
      }
      
      // 可选：定义特殊状态
      public function popular()
      {
          return $this->state([
              'views' => $this->faker->numberBetween(1000, 5000),
          ]);
      }
  }
  ```

  **步骤3：在模型中使用工厂 (`app/Models/Post.php`)**
  ```php
  use Illuminate\Database\Eloquent\Factories\HasFactory;

  class Post extends Model
  {
      use HasFactory; // 添加这个Trait
      
      // ...
  }
  ```

  **步骤4：使用工厂生成数据**
  ```php
  // 创建单个模型实例（不保存到数据库）
  $post = Post::factory()->make();

  // 创建单个并保存到数据库
  $post = Post::factory()->create();

  // 创建多个
  Post::factory()->count(50)->create();

  // 使用特定状态（使用上面定义的popular状态）
  Post::factory()->count(10)->popular()->create();

  // 创建关联数据
  $user = User::factory()
              ->hasPosts(5) // 用户有5篇文章
              ->create();

  // 创建文章并指定用户
  Post::factory()
      ->for(User::factory()->create(['name' => '特定用户']))
      ->create();
  ```

## 实际使用场景

  在测试或填充器中生成数据：

  ```php
  // 生成20个用户，每个用户有3篇文章
  User::factory(20)
      ->hasPosts(3)
      ->create();

  // 生成5篇热门文章
  Post::factory(5)
      ->popular()
      ->create();
  ```

## 小贴士

  - 使用 `php artisan tinker` 进入交互模式测试工厂
  - 常用假数据生成方法：

      - `fake()->name` 生成姓名
      - `fake()->email` 生成邮箱
      - `fake()->address` 生成地址
      - `fake()->dateTimeBetween('-1 year') `一年内的随机日期
  - 重置自增ID：`php artisan db:seed --force` 会重置自增计数器

