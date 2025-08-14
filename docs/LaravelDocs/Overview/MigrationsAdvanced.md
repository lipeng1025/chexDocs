# 数据库迁移进阶

## 一、复杂表修改

  **是什么？**
  > - 在已有数据库表上进行结构变更（添加/删除列、修改列类型、重命名表等）

  **有什么用？**
  - 在不丢失数据的情况下修改表结构
  - 平滑升级数据库结构
  - 支持应用迭代开发
  - 管理数据库版本变更

  **怎么用？**

  1. **创建修改迁移**
  ```bash
  # 创建修改迁移文件
  php artisan make:migration update_users_table
  ```

  2. **常用表修改操作**
  ```php
  use Illuminate\Database\Migrations\Migration;
  use Illuminate\Database\Schema\Blueprint;
  use Illuminate\Support\Facades\Schema;

  class UpdateUsersTable extends Migration
  {
      public function up()
      {
          Schema::table('users', function (Blueprint $table) {
              // 添加新列
              $table->string('phone')->nullable()->after('email');
              
              // 修改列类型
              $table->string('name', 100)->change(); // 修改为100个字符
              
              // 重命名列
              $table->renameColumn('name', 'full_name');
              
              // 添加索引
              $table->index('phone');
              
              // 添加唯一索引
              $table->unique('email');
              
              // 添加全文索引（MySQL 5.7+）
              $table->fullText('bio');
              
              // 添加虚拟列（MySQL）
              $table->string('name_initials')->virtualAs('SUBSTRING(full_name, 1, 1)');
          });
      }

      public function down()
      {
          Schema::table('users', function (Blueprint $table) {
              // 回滚操作
              $table->dropColumn('phone');
              $table->string('full_name')->change(); // 改回原类型
              $table->renameColumn('full_name', 'name');
              $table->dropIndex(['phone']);
              $table->dropUnique(['email']);
              $table->dropFullText(['bio']);
              $table->dropColumn('name_initials');
          });
      }
  }
  ```

  3. **添加多列**
  ```php
  public function up()
  {
      Schema::table('products', function (Blueprint $table) {
          $table->decimal('price', 10, 2)->after('name');
          $table->integer('stock')->default(0)->after('price');
          $table->boolean('in_stock')->virtualAs('stock > 0')->after('stock');
      });
  }
  ```

  4. **修改默认值**
  ```php
  public function up()
  {
      Schema::table('orders', function (Blueprint $table) {
          $table->string('status')->default('pending')->change();
      });
  }
  ```

  5. **复杂修改（需要Doctrine DBAL）**
  ```bash
  composer require doctrine/dbal
  ```

  ```php
  public function up()
  {
      Schema::table('users', function (Blueprint $table) {
          // 修改列类型（需要DBAL）
          $table->decimal('balance', 10, 2)->change();
          
          // 修改列属性
          $table->string('email')->nullable(false)->change();
      });
  }
  ```

## 二、外键约束

  **是什么？**
  > - 数据库层面的关系约束，确保数据的完整性和一致性

  **有什么用？**
  - 防止无效引用（如订单关联不存在的用户）
  - 自动级联更新或删除
  - 确保数据关系有效性
  - 减少应用层数据验证逻辑

  **怎么用？**

  1. **基本外键约束**
  ```php
  // 创建订单表（带用户外键）
  public function up()
  {
      Schema::create('orders', function (Blueprint $table) {
          $table->id();
          $table->decimal('amount', 10, 2);
          $table->foreignId('user_id')->constrained(); // 关联users表id
          
          // 等同于：
          // $table->unsignedBigInteger('user_id');
          // $table->foreign('user_id')->references('id')->on('users');
          
          $table->timestamps();
      });
  }
  ```

  2. **自定义外键约束**
  ```php
  public function up()
  {
      Schema::table('posts', function (Blueprint $table) {
          // 关联到authors表的author_id字段
          $table->foreignId('author_id')->constrained(
              table: 'authors',  // 关联表名
              column: 'author_id' // 关联字段
          );
      });
  }
  ```

  3. **级联操作**
  ```php
  public function up()
  {
      Schema::table('comments', function (Blueprint $table) {
          $table->foreignId('post_id')
                ->constrained()
                ->onUpdate('cascade')  // 更新级联
                ->onDelete('cascade'); // 删除级联
      });
  }
  ```

  4. **其他约束选项**
  ```php
  public function up()
  {
      Schema::table('employees', function (Blueprint $table) {
          $table->foreignId('manager_id')
                ->nullable()
                ->constrained('employees') // 自引用外键
                ->onUpdate('cascade')
                ->onDelete('set null'); // 设置为null
      });
  }
  ```

  5. **删除外键约束**
  ```php
  public function down()
  {
      Schema::table('orders', function (Blueprint $table) {
          // 删除外键约束
          $table->dropForeign(['user_id']);
          
          // 删除索引
          $table->dropIndex(['user_id']);
      });
  }
  ```

## 三、原生SQL

  **是什么？**
  > - 在迁移中直接执行原始SQL语句

  **有什么用？**
  - 执行复杂数据库操作
  - 使用数据库特有功能
  - 优化性能关键操作
  - 处理特殊迁移需求

  **怎么用？**

  1. **基本SQL执行**
  ```php
  public function up()
  {
      // 创建存储过程
      DB::statement('
          CREATE PROCEDURE CalculateOrderTotal(IN order_id INT)
          BEGIN
              SELECT SUM(price * quantity) AS total
              FROM order_items
              WHERE order_id = order_id;
          END
      ');
      
      // 添加计算列
      DB::statement('
          ALTER TABLE products
          ADD COLUMN discounted_price DECIMAL(10,2) 
          GENERATED ALWAYS AS (price * (1 - discount)) STORED
      ');
  }

  public function down()
  {
      DB::statement('DROP PROCEDURE IF EXISTS CalculateOrderTotal');
      DB::statement('ALTER TABLE products DROP COLUMN discounted_price');
  }
  ```

  2. **复杂索引操作**
  ```php
  public function up()
  {
      // 创建空间索引（MySQL）
      DB::statement('ALTER TABLE places ADD SPATIAL INDEX location_index (location)');
      
      // 创建部分索引（PostgreSQL）
      DB::statement('CREATE INDEX active_users ON users (email) WHERE active = true');
  }

  public function down()
  {
      DB::statement('ALTER TABLE places DROP INDEX location_index');
      DB::statement('DROP INDEX active_users');
  }
  ```

  3. **数据库视图**
  ```php
  public function up()
  {
      // 创建视图
      DB::statement('
          CREATE VIEW active_orders AS
          SELECT orders.*, users.name AS customer_name
          FROM orders
          JOIN users ON users.id = orders.user_id
          WHERE orders.status = "active"
      ');
  }

  public function down()
  {
      DB::statement('DROP VIEW IF EXISTS active_orders');
  }
  ```

  4. **触发器**
  ```php
  public function up()
  {
      DB::statement('
          CREATE TRIGGER update_product_stock
          AFTER INSERT ON order_items
          FOR EACH ROW
          BEGIN
              UPDATE products
              SET stock = stock - NEW.quantity
              WHERE id = NEW.product_id;
          END
      ');
  }

  public function down()
  {
      DB::statement('DROP TRIGGER IF EXISTS update_product_stock');
  }
  ```

  5. **数据迁移**
  ```php
  public function up()
  {
      // 迁移数据到新表
      DB::statement('
          INSERT INTO new_orders (id, amount, user_id, created_at)
          SELECT id, total_amount, customer_id, order_date
          FROM legacy_orders
      ');
      
      // 更新数据
      DB::statement('
          UPDATE users
          SET status = "active"
          WHERE last_login_at > DATE_SUB(NOW(), INTERVAL 6 MONTH)
      ');
  }
  ```
## 完整示例：电商系统数据库迁移

  1. **创建产品表**
  ```php
  public function up()
  {
      Schema::create('products', function (Blueprint $table) {
          $table->id();
          $table->string('name', 200);
          $table->string('slug')->unique();
          $table->text('description');
          $table->decimal('price', 10, 2);
          $table->decimal('discount', 5, 2)->default(0);
          $table->integer('stock')->default(0);
          $table->boolean('is_featured')->default(false);
          $table->foreignId('category_id')->constrained()->onDelete('cascade');
          $table->timestamps();
          $table->softDeletes();
      });
      
      // 添加全文索引
      DB::statement('ALTER TABLE products ADD FULLTEXT fulltext_index (name, description)');
  }
  ```

  2. **创建订单系统**
  ```php
  public function up()
  {
      Schema::create('orders', function (Blueprint $table) {
          $table->id();
          $table->string('order_number')->unique();
          $table->decimal('total', 12, 2);
          $table->enum('status', ['pending', 'processing', 'shipped', 'delivered', 'cancelled'])->default('pending');
          $table->foreignId('user_id')->constrained()->onDelete('cascade');
          $table->foreignId('address_id')->constrained('user_addresses');
          $table->timestamps();
      });
      
      Schema::create('order_items', function (Blueprint $table) {
          $table->id();
          $table->foreignId('order_id')->constrained()->onDelete('cascade');
          $table->foreignId('product_id')->constrained();
          $table->decimal('price', 10, 2);
          $table->integer('quantity');
          $table->timestamps();
      });
      
      // 创建计算总价的视图
      DB::statement('
          CREATE VIEW order_summary AS
          SELECT 
              orders.id,
              orders.order_number,
              orders.status,
              orders.created_at,
              users.name AS customer,
              SUM(order_items.price * order_items.quantity) AS subtotal,
              COUNT(order_items.id) AS item_count
          FROM orders
          JOIN users ON users.id = orders.user_id
          JOIN order_items ON order_items.order_id = orders.id
          GROUP BY orders.id
      ');
  }
  ```

  3. **修改用户表**
  ```php
  public function up()
  {
      Schema::table('users', function (Blueprint $table) {
          // 添加新列
          $table->string('phone')->after('email');
          $table->date('birthdate')->nullable()->after('phone');
          $table->enum('gender', ['male', 'female', 'other'])->nullable()->after('birthdate');
          
          // 添加索引
          $table->index(['created_at', 'active']);
      });
      
      // 添加虚拟列（MySQL）
      DB::statement('
          ALTER TABLE users
          ADD COLUMN age TINYINT UNSIGNED 
          GENERATED ALWAYS AS (TIMESTAMPDIFF(YEAR, birthdate, CURDATE())) VIRTUAL
      ');
  }
  ```

  4. **数据迁移脚本**
  ```php
  public function up()
  {
      // 迁移旧数据
      DB::statement('
          INSERT INTO products (name, description, price)
          SELECT item_name, item_desc, item_price
          FROM legacy_items
          WHERE item_status = "active"
      ');
      
      // 更新价格策略
      DB::statement('
          UPDATE products
          SET price = 
              CASE 
                  WHEN category_id IN (1,2,3) THEN price * 1.1
                  WHEN category_id IN (4,5) THEN price * 0.95
                  ELSE price
              END
          WHERE discount = 0
      ');
  }
  ```
## 最佳实践

  1. **安全执行原生SQL**
  ```php
  // 使用绑定参数防止SQL注入
  DB::statement('
      UPDATE users 
      SET last_login_ip = ?
      WHERE id = ?
  ', [$ip, $userId]);

  // 使用命名绑定
  DB::statement('
      UPDATE products 
      SET price = :newPrice 
      WHERE category_id = :categoryId
  ', ['newPrice' => 99.99, 'categoryId' => 5]);
  ```

  2. **跨数据库兼容**
  ```php
  public function up()
  {
      if (Schema::getConnection()->getDriverName() === 'mysql') {
          DB::statement('ALTER TABLE products ENGINE = InnoDB');
      }
      
      if (Schema::getConnection()->getDriverName() === 'pgsql') {
          DB::statement('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
          DB::statement('ALTER TABLE users ADD COLUMN uuid UUID DEFAULT uuid_generate_v4()');
      }
  }
  ```

  3. **迁移性能优化**
  ```php
  public function up()
  {
      // 禁用索引更新（MySQL）
      DB::statement('ALTER TABLE orders DISABLE KEYS');
      
      // 批量插入数据
      $chunks = array_chunk($largeData, 500);
      foreach ($chunks as $chunk) {
          DB::table('orders')->insert($chunk);
      }
      
      // 启用索引更新
      DB::statement('ALTER TABLE orders ENABLE KEYS');
  }
  ```

  4. **迁移测试**
  ```php
  public function test_migration()
  {
      // 运行迁移
      Artisan::call('migrate');
      
      // 验证表结构
      $this->assertTrue(Schema::hasTable('orders'));
      $this->assertTrue(Schema::hasColumn('orders', 'user_id'));
      
      // 验证外键约束
      $foreignKeys = Schema::getConnection()
                          ->getDoctrineSchemaManager()
                          ->listTableForeignKeys('orders');
      
      $this->assertCount(1, $foreignKeys);
      $this->assertEquals('users', $foreignKeys[0]->getForeignTableName());
      
      // 验证数据迁移
      $count = DB::table('products')->count();
      $this->assertEquals(100, $count);
      
      // 回滚迁移
      Artisan::call('migrate:rollback');
      $this->assertFalse(Schema::hasTable('orders'));
  }
  ```
## 迁移调试技巧

  1. **查看迁移状态**
  ```bash
  php artisan migrate:status
  ```

  2. **重置并重新运行**
  ```bash
  php artisan migrate:refresh
  ```

  3. **生成迁移SQL**
  ```bash
  # 查看将执行的SQL
  php artisan migrate --pretend

  # 生成特定迁移的SQL
  php artisan migrate:pretend --path=database/migrations/2023_10_01_update_users_table.php
  ```

  4. **处理大表修改**
  ```php
  // 使用临时表避免锁表
  public function up()
  {
      // 创建新表结构
      Schema::create('users_new', function (Blueprint $table) {
          // 新结构...
      });
      
      // 复制数据
      DB::statement('INSERT INTO users_new SELECT * FROM users');
      
      // 重命名表
      Schema::rename('users', 'users_old');
      Schema::rename('users_new', 'users');
      
      // 删除旧表
      Schema::drop('users_old');
  }
  ```
