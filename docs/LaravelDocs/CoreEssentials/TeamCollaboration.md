# 团队协作

## 一、代码规范

  **是什么？**
  > - 代码规范是团队约定一致的代码编写规则，包括命名、格式、注释等标准

  **有什么用？**
  - 保持代码风格统一
  - 提高代码可读性
  - 减少代码冲突
  - 方便代码审查
  - 加速新成员融入

  **怎么用？**

  1. **安装代码规范工具**
  ```bash
  composer require --dev friendsofphp/php-cs-fixer
  composer require --dev nunomaduro/larastan
  ```

  2. **配置代码规范 (`.php-cs-fixer.dist.php`)**
  ```php
  return (new PhpCsFixer\Config())
      ->setRules([
          '@PSR12' => true,
          'array_syntax' => ['syntax' => 'short'],
          'ordered_imports' => true,
          'no_unused_imports' => true,
          'not_operator_with_successor_space' => true,
          'trailing_comma_in_multiline' => true,
          'phpdoc_scalar' => true,
          'unary_operator_spaces' => true,
          'binary_operator_spaces' => true,
          'blank_line_before_statement' => [
              'statements' => ['return', 'throw', 'try'],
          ],
          'phpdoc_single_line_var_spacing' => true,
          'phpdoc_var_without_name' => true,
          'class_attributes_separation' => true,
          'method_argument_space' => [
              'on_multiline' => 'ensure_fully_multiline',
              'keep_multiple_spaces_after_comma' => true,
          ],
      ])
      ->setFinder(
          PhpCsFixer\Finder::create()
              ->exclude('vendor')
              ->exclude('storage')
              ->exclude('bootstrap/cache')
              ->in(__DIR__)
      );
  ```

  3. **配置静态分析 (phpstan.neon)**
  ```yaml
  parameters:
    level: 8
    paths:
      - app
      - config
      - database
      - routes
    ignoreErrors:
      - '#Call to an undefined method.*#'
    checkMissingIterableValueType: false
  ```

  4. **添加脚本到 composer.json**
  ```json
  "scripts": {
      "format": "php-cs-fixer fix",
      "analyze": "phpstan analyse",
      "lint": "npm run lint-js && npm run lint-css",
      "check": [
          "@format",
          "@analyze",
          "@lint"
      ]
  }
  ```

  5. **常用规范示例**
  
  **命名规范**

  ```php
  // 类名 - 大驼峰
  class UserController {}

  // 方法名 - 小驼峰
  public function getUserProfile() {}

  // 变量名 - 小驼峰
  $userProfile = [];

  // 常量 - 大写+下划线
  const MAX_LOGIN_ATTEMPTS = 5;
  ```

  **代码格式**

  ```php
  // 正确的缩进
  public function store(Request $request)
  {
      $validated = $request->validate([
          'name' => 'required|string|max:255',
          'email' => 'required|email|unique:users',
      ]);
      
      $user = User::create($validated);
      
      return response()->json([
          'data' => new UserResource($user),
          'message' => 'User created successfully'
      ], 201);
  }

  // 错误的缩进
  public function store(Request $request){
  $validated = $request->validate(['name'=>'required',...]);
  return response()->json([...]);}
  ```

  **注释规范**

  ```php
  /**
  * 创建新用户
  * 
  * @param \Illuminate\Http\Request $request HTTP请求
  * @return \Illuminate\Http\JsonResponse
  * 
  * @throws \Illuminate\Validation\ValidationException
  */
  public function createUser(Request $request)
  {
      // 验证输入数据
      $data = $request->validate([...]);
      
      // 创建用户记录
      $user = User::create($data);
      
      // 返回响应
      return response()->json(...);
  }
  ```

  6. **自动化代码检查**
  ```bash
  # 在提交前自动格式化代码
  composer run format

  # 运行静态分析
  composer run analyze

  # 配置Git钩子 (.husky/pre-commit)
  #!/bin/sh
  . "$(dirname "$0")/_/husky.sh"

  composer run format
  git add .
  composer run analyze
  ```

## 二、Git工作流

  **是什么？**
  > - 团队协作中使用Git管理代码的流程和规范

  **有什么用？**
  - 有序管理代码变更
  - 减少代码冲突
  - 支持并行开发
  - 方便代码回滚
  - 明确责任归属

  **怎么用？**

  1. **分支策略**
  ```text
  main        - 生产环境代码（保护分支）
  staging     - 测试环境代码
  develop     - 开发主分支
  feature/*   - 功能开发分支
  hotfix/*    - 紧急修复分支
  release/*   - 发布分支
  ```

  2. **完整工作流程**
  
  **步骤1：克隆仓库**

  ```bash
  git clone git@github.com:yourteam/project.git
  cd project
  ```

  **步骤2：创建功能分支**

  ```bash
  git checkout develop
  git pull origin develop
  git checkout -b feature/user-authentication
  ```

  **步骤3：开发并提交代码**

  ```bash
  # 开发代码...
  git add .
  git commit -m "添加用户登录功能"

  # 继续开发...
  git add .
  git commit -m "实现JWT认证"

  # 推送分支
  git push origin feature/user-authentication
  ```

  **步骤4：创建Pull Request**

  - 在GitHub/GitLab创建PR到develop分支
  - 添加描述和审查者
  - 关联相关Issue

  **步骤5：代码审查**

  ```bash
  # 审查者检查代码
  # 提出修改建议

  # 开发者修改代码
  git add .
  git commit -m "根据审查意见修复登录逻辑"
  git push origin feature/user-authentication
  ```

  **步骤6：合并分支**

  - 审查通过后合并PR
  - 删除功能分支

  **步骤7：发布到测试环境**

  ```bash
  git checkout staging
  git merge develop
  git push origin staging
  ```

  **步骤8：生产发布**

  ```bash
  git checkout main
  git merge staging
  git tag v1.2.0
  git push origin main --tags
  ```

  3. **提交信息规范**
  ```text
  类型(范围): 简要描述

  详细描述（可选）

  相关Issue: #123
  ```
  ---
  **类型说明**：

  - **feat**: 新功能
  - **fix**: 修复bug
  - **docs**: 文档更新
  - **style**: 代码格式化
  - **refactor**: 代码重构
  - **test**: 测试相关
  - **chore**: 构建或辅助工具变动

  **示例**：

  ```text
  feat(authentication): 添加JWT登录功能

  - 实现用户登录接口
  - 添加JWT认证中间件
  - 创建登录请求验证器

  相关Issue: #45
  ```

  4. **冲突解决**
  ```bash
  # 拉取最新代码
  git checkout develop
  git pull origin develop

  # 合并到当前分支
  git checkout feature/user-authentication
  git merge develop

  # 解决冲突
  # 编辑冲突文件...
  git add .
  git commit -m "解决合并冲突"
  ```

## 三、API设计

  **是什么？**
  > - 设计和实现应用程序接口(API)的规范和标准

  **有什么用？**
  - 统一接口风格
  - 前后端分离开发
  - 方便第三方集成
  - 提高系统可维护性
  - 简化接口文档编写

  **怎么用？**

  1. **RESTful API设计规范**
  
  **资源命名**

  ```text
  GET    /users           - 用户列表
  POST   /users           - 创建用户
  GET    /users/{id}      - 用户详情
  PUT    /users/{id}      - 更新用户
  DELETE /users/{id}      - 删除用户
  GET    /users/{id}/posts - 用户的文章
  ```

  **HTTP状态码**

  ```php
  200 OK                  - 成功
  201 Created             - 创建成功
  204 No Content          - 成功无返回内容
  400 Bad Request         - 请求错误
  401 Unauthorized        - 未认证
  403 Forbidden           - 无权限
  404 Not Found           - 资源不存在
  422 Unprocessable Entity - 验证错误
  500 Internal Server Error - 服务器错误
  ```

  2. **API控制器示例**
  ```php
  namespace App\Http\Controllers\Api;

  use App\Http\Controllers\Controller;
  use App\Http\Requests\StoreUserRequest;
  use App\Http\Resources\UserResource;
  use App\Models\User;
  use Illuminate\Http\Response;

  class UserController extends Controller
  {
      /**
      * 获取用户列表
      */
      public function index()
      {
          $users = User::paginate(10);
          return UserResource::collection($users);
      }

      /**
      * 创建用户
      */
      public function store(StoreUserRequest $request)
      {
          $user = User::create($request->validated());
          return (new UserResource($user))
              ->response()
              ->setStatusCode(Response::HTTP_CREATED);
      }

      /**
      * 获取用户详情
      */
      public function show(User $user)
      {
          return new UserResource($user);
      }

      /**
      * 更新用户
      */
      public function update(UpdateUserRequest $request, User $user)
      {
          $user->update($request->validated());
          return new UserResource($user);
      }

      /**
      * 删除用户
      */
      public function destroy(User $user)
      {
          $user->delete();
          return response()->noContent();
      }
  }
  ```

  3. **API路由配置**
  ```php
  // routes/api.php
  use App\Http\Controllers\Api\UserController;

  Route::middleware('auth:sanctum')->group(function () {
      Route::apiResource('users', UserController::class);
      
      // 自定义路由
      Route::post('users/{user}/avatar', [UserController::class, 'updateAvatar']);
      Route::get('users/{user}/posts', [UserController::class, 'userPosts']);
  });

  // 认证路由
  Route::post('login', [AuthController::class, 'login']);
  Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
  ```

  4. **API版本控制**
  ```php
  // 路由文件 routes/api_v1.php
  Route::prefix('v1')->group(function () {
      Route::apiResource('users', \App\Http\Controllers\Api\V1\UserController::class);
  });

  // 路由文件 routes/api_v2.php
  Route::prefix('v2')->group(function () {
      Route::apiResource('users', \App\Http\Controllers\Api\V2\UserController::class);
  });

  // 在RouteServiceProvider中注册
  public function boot()
  {
      $this->routes(function () {
          Route::prefix('api/v1')
              ->middleware('api')
              ->namespace('App\Http\Controllers\Api\V1')
              ->group(base_path('routes/api_v1.php'));
          
          Route::prefix('api/v2')
              ->middleware('api')
              ->namespace('App\Http\Controllers\Api\V2')
              ->group(base_path('routes/api_v2.php'));
      });
  }
  ```

  5. **API文档生成 (Scribe)**
  ```bash
  composer require --dev knuckleswtf/scribe
  php artisan scribe:install
  ```

  **添加文档注释**

  ```php
  /**
  * @group 用户管理
  * 
  * 管理用户资源
  */
  class UserController extends Controller
  {
      /**
      * 获取用户列表
      * 
      * 分页获取所有用户
      * 
      * @queryParam page 页码. Example: 1
      * @queryParam per_page 每页数量. Example: 15
      * 
      * @response 200 {
      *   "data": [{
      *     "id": 1,
      *     "name": "张三",
      *     "email": "zhangsan@example.com"
      *   }],
      *   "links": {...},
      *   "meta": {...}
      * }
      */
      public function index()
      {
          // ...
      }
  }
  ```

  **生成文档**

  ```bash
  php artisan scribe:generate
  ```

  6. **API测试**
  ```php
  // tests/Feature/UserApiTest.php
  public function test_user_crud_operations()
  {
      // 创建用户
      $response = $this->postJson('/api/users', [
          'name' => '测试用户',
          'email' => 'test@example.com',
          'password' => 'password123',
      ]);
      
      $response->assertStatus(201);
      $user = $response->json('data');
      
      // 获取用户详情
      $response = $this->getJson("/api/users/{$user['id']}");
      $response->assertStatus(200)
              ->assertJson(['data' => ['email' => 'test@example.com']]);
      
      // 更新用户
      $response = $this->putJson("/api/users/{$user['id']}", [
          'name' => '更新后的用户'
      ]);
      $response->assertStatus(200);
      
      // 删除用户
      $response = $this->deleteJson("/api/users/{$user['id']}");
      $response->assertStatus(204);
      
      // 验证用户已删除
      $response = $this->getJson("/api/users/{$user['id']}");
      $response->assertStatus(404);
  }
  ```

  **团队协作工具集成**
  
  1. **项目管理 (`Jira/GitHub Issues`)**
  ```markdown
  ### 用户认证功能

  **描述**：
  实现用户注册、登录、退出功能

  **任务列表**：
  - [ ] 用户注册API
  - [ ] JWT登录API
  - [ ] 用户退出API
  - [ ] 用户资料获取API

  **验收标准**：
  1. 支持邮箱+密码注册
  2. 返回JWT令牌
  3. 令牌有效期7天
  ```

  2. **CI/CD 配置 (`.github/workflows/laravel.yml`)**
  ```yaml
  name: Laravel CI

  on:
    push:
      branches: [ develop, staging ]
    pull_request:
      branches: [ develop ]

  jobs:
    laravel-tests:
      runs-on: ubuntu-latest
      
      steps:
      - uses: actions/checkout@v2
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
          extensions: dom, curl, libxml, mbstring, zip, pdo, sqlite, pdo_sqlite
          coverage: none
          
      - name: Install dependencies
        run: composer install --no-interaction --prefer-dist
          
      - name: Copy .env
        run: cp .env.example .env
          
      - name: Generate key
        run: php artisan key:generate
          
      - name: Execute tests
        run: php artisan test
          
      - name: Code style check
        run: composer run format -- --dry-run
          
      - name: Static analysis
        run: composer run analyze
        
    deploy-staging:
      needs: laravel-tests
      runs-on: ubuntu-latest
      if: github.ref == 'refs/heads/staging'
      
      steps:
      - name: Deploy to staging
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: ${{ secrets.STAGING_USER }}
          key: ${{ secrets.STAGING_SSH_KEY }}
          script: |
            cd /var/www/project
            git pull origin staging
            composer install --no-dev
            php artisan migrate
            php artisan optimize:clear
  ```

  3. **团队沟通规范**
  ```markdown
  **代码审查指南**：
  1. 每次审查不超过400行代码
  2. 24小时内响应审查请求
  3. 使用明确的问题描述
  4. 建议替代方案而非只提问题

  **每日站会模板**：
  1. 昨天完成了什么？
  2. 今天计划做什么？
  3. 遇到什么阻碍？

  **技术决策流程**：
  1. 提出方案（RFC文档）
  2. 团队讨论（48小时）
  3. 负责人决策
  4. 记录决策结果
  ```
  ---
  **最佳实践**

  1. **代码审查要点**
  ```markdown
  - [ ] 代码是否符合规范
  - [ ] 是否有安全漏洞
  - [ ] 错误处理是否完备
  - [ ] 测试是否覆盖主要场景
  - [ ] 文档是否更新
  - [ ] 性能是否有问题
  ```

  2. **Git分支清理策略**
  ```bash
  # 定期清理已合并分支
  git fetch --all --prune
  git branch -r | awk '{print $1}' | \
    grep -E 'feature|fix|release' | \
    while read branch; do \
      git branch -d $branch; \
    done
  ```

  3. **API设计原则**
  ```markdown
  1. **一致性**：相同操作使用相同模式
  2. **无状态**：每次请求包含完整信息
  3. **缓存友好**：支持ETag和Last-Modified
  4. **版本控制**：API版本清晰
  5. **错误处理**：标准错误格式
  6. **分页**：所有列表返回分页数据
  7. **过滤排序**：支持字段过滤和排序
  ```
  
  4. **团队知识共享**
  ```bash
  # 创建团队Wiki
  git init team-wiki
  cd team-wiki
  touch README.md
  mkdir -p docs/{onboarding,architecture,decisions}

  # 添加文档结构
  # onboarding/新成员指南.md
  # architecture/系统架构.md
  # decisions/技术决策记录.md
  ```
