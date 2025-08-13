# 表单请求验证

## 一、请求类创建

  **是什么？**
  > - 表单请求类是专门处理表单验证的类，把验证逻辑从控制器中分离出来

  **有什么用？**
  - 集中管理验证规则
  - 自动处理验证失败重定向
  - 自定义验证错误消息
  - 保持控制器代码整洁

  **怎么用？**

  **步骤1：创建表单请求类**
  ```bash
  php artisan make:request StorePostRequest
  php artisan make:request UpdateUserRequest
  ```

  **步骤2：基本请求类结构 (`app/Http/Requests/StorePostRequest.php`)**
  ```php
  namespace App\Http\Requests;

  use Illuminate\Foundation\Http\FormRequest;

  class StorePostRequest extends FormRequest
  {
      /**
      * 确定用户是否有权限发起此请求
      */
      public function authorize(): bool
      {
          // 通常返回true，除非需要权限检查
          return true; 
      }

      /**
      * 定义验证规则
      */
      public function rules(): array
      {
          return [
              'title' => 'required|string|max:255',
              'content' => 'required|min:100',
              'category_id' => 'required|exists:categories,id',
          ];
      }
  }
  ```

  **步骤3：在控制器中使用**
  ```php
  use App\Http\Requests\StorePostRequest;

  public function store(StorePostRequest $request)
  {
      // 请求到达这里时已经通过验证
      $validated = $request->validated();
      
      // 创建文章
      Post::create($validated);
      
      return redirect('/posts')->with('success', '文章创建成功！');
  }
  ```

## 二、验证规则

  **是什么？**
  > - 定义数据需要满足的条件（如必填、最小长度、唯一性等）

  **有什么用？**
  - 确保数据符合要求
  - 防止无效或恶意数据
  - 自动生成错误信息
  - 支持复杂条件验证

  **常用规则及示例**：

  1. **基本规则**
  ```php
  public function rules(): array
  {
      return [
          // 必填字段
          'name' => 'required',
          
          // 字符串且最大长度255
          'email' => 'required|string|email|max:255',
          
          // 确认密码匹配
          'password' => 'required|min:8|confirmed',
          
          // 唯一性检查（忽略当前用户）
          'username' => 'unique:users,username,' . auth()->id(),
          
          // 日期格式
          'birthdate' => 'date_format:Y-m-d',
          
          // 数组类型
          'tags' => 'array',
          
          // 数组元素验证
          'tags.*' => 'integer|exists:tags,id',
      ];
  }
  ```

  2. **条件规则**
  ```php
  public function rules(): array
  {
      return [
          'email' => 'required|email',
          
          // 当订阅字段为true时验证
          'newsletter' => 'boolean',
          'newsletter_email' => 'required_if:newsletter,true|email',
          
          // 除非是管理员，否则标题必须唯一
          'title' => [
              'required',
              Rule::unique('posts')->ignore($this->post),
              Rule::when(!$this->user()->isAdmin, 'min:10'),
          ],
      ];
  }
  ```

  3. **复杂规则**
  ```php
  use Illuminate\Validation\Rule;

  public function rules(): array
  {
      return [
          // 自定义规则对象
          'avatar' => [
              'required',
              'image',
              new \App\Rules\MaxFileSize(2048), // 最大2MB
          ],
          
          // 闭包验证
          'start_date' => [
              'required',
              'date',
              function ($attribute, $value, $fail) {
                  if (strtotime($value) < strtotime('today')) {
                      $fail('开始日期不能是过去日期！');
                  }
              },
          ],
          
          // 条件存在验证
          'discount_code' => [
              Rule::requiredIf(function () {
                  return $this->input('total') > 1000;
              }),
              'string',
              'size:8',
          ],
      ];
  }
  ```

  4. **规则集（复用规则）**
  ```php
  // 创建规则集
  php artisan make:rule UserRegistrationRules

  // app/Rules/UserRegistrationRules.php
  public function rules(): array
  {
      return [
          'name' => 'required|string|max:255',
          'email' => 'required|email|unique:users',
          'password' => 'required|min:8|confirmed',
      ];
  }

  // 在请求类中使用
  public function rules(): array
  {
      return (new UserRegistrationRules())->rules();
  }
  ```

## 三、自定义消息

  **是什么？**
  > - 自定义验证失败时显示的错误信息

  **有什么用？**
  - 提供更友好的错误提示
  - 支持多语言
  - 针对特定字段定制消息
  - 统一错误消息格式

  **怎么用？**

  1. **基本自定义消息**
  ```php
  // 在请求类中添加 messages 方法
  public function messages(): array
  {
      return [
          // 通用消息
          'required' => ':attribute 是必填字段',
          
          // 特定字段消息
          'email.required' => '请填写您的邮箱地址',
          'email.email' => '请输入有效的邮箱格式',
          
          // 带占位符的消息
          'title.min' => '标题至少需要 :min 个字符',
          
          // 数组字段消息
          'tags.*.exists' => '选择的标签无效',
      ];
  }
  ```

  2. **自定义属性名称**
  ```php
  // 在请求类中添加 attributes 方法
  public function attributes(): array
  {
      return [
          'email' => '邮箱地址',
          'password' => '密码',
          'category_id' => '分类',
      ];
  }

  // 在语言文件中设置（推荐）
  // resources/lang/zh_CN/validation.php
  return [
      'attributes' => [
          'email' => '邮箱地址',
          'password' => '密码',
      ],
  ];
  ```

  3. **复杂自定义消息**
  ```php
  public function messages(): array
  {
      return [
          // 使用规则对象自定义消息
          'avatar' => [
              'required' => '请选择头像文件',
              'image' => '只能上传图片格式文件',
          ],
          
          // 条件错误消息
          'start_date' => [
              'required' => '请选择开始日期',
              function ($attribute, $value, $rule) {
                  return "{$attribute} 不能早于今天";
              },
          ],
          
          // 关联字段消息
          'category_id.exists' => '选择的分类不存在或已被删除',
      ];
  }
  ```

  4. **完整请求类示例**
  ```php
  namespace App\Http\Requests;

  use Illuminate\Foundation\Http\FormRequest;
  use Illuminate\Validation\Rule;

  class UpdateUserProfileRequest extends FormRequest
  {
      public function authorize(): bool
      {
          return true;
      }

      public function rules(): array
      {
          return [
              'name' => 'required|string|max:50',
              'email' => [
                  'required',
                  'email',
                  Rule::unique('users')->ignore(auth()->id()),
              ],
              'avatar' => 'nullable|image|max:2048',
              'bio' => 'nullable|string|max:500',
              'website' => 'nullable|url',
              'birthdate' => 'nullable|date|before:today',
          ];
      }

      public function messages(): array
      {
          return [
              'name.required' => '请输入您的姓名',
              'email.unique' => '该邮箱已被注册',
              'avatar.image' => '请上传图片格式文件（JPG, PNG等）',
              'avatar.max' => '头像大小不能超过2MB',
              'website.url' => '请输入有效的网址',
              'birthdate.before' => '出生日期不能是未来日期',
          ];
      }

      public function attributes(): array
      {
          return [
              'bio' => '个人简介',
          ];
      }
  }
  ```
## 实际应用：注册表单验证

  **请求类 (`app/Http/Requests/RegisterRequest.php`)**
  ```php
  namespace App\Http\Requests;

  use Illuminate\Foundation\Http\FormRequest;

  class RegisterRequest extends FormRequest
  {
      public function authorize(): bool
      {
          return true;
      }

      public function rules(): array
      {
          return [
              'name' => 'required|string|max:50',
              'email' => 'required|email|unique:users',
              'password' => 'required|min:8|confirmed',
              'agree_terms' => 'required|accepted',
          ];
      }

      public function messages(): array
      {
          return [
              'name.required' => '请输入您的姓名',
              'email.required' => '请输入邮箱地址',
              'email.email' => '邮箱格式不正确',
              'email.unique' => '该邮箱已被注册',
              'password.required' => '请设置密码',
              'password.min' => '密码至少需要8个字符',
              'password.confirmed' => '两次输入的密码不一致',
              'agree_terms.required' => '请阅读并同意服务条款',
              'agree_terms.accepted' => '必须同意服务条款才能注册',
          ];
      }
  }
  ```

  **控制器 (`app/Http/Controllers/AuthController.php`)**
  ```php
  public function register(RegisterRequest $request)
  {
      // 验证通过后创建用户
      $user = User::create($request->validated());
      
      // 登录用户
      auth()->login($user);
      
      return redirect('/dashboard')->with('success', '注册成功！');
  }
  ```

  **视图 (`resources/views/auth/register.blade.php`)**
  ```blade
  <form method="POST" action="{{ route('register') }}">
      @csrf
      
      <!-- 姓名 -->
      <div class="form-group">
          <label for="name">姓名</label>
          <input id="name" type="text" name="name" value="{{ old('name') }}" class="form-control">
          @error('name')
              <div class="text-danger">{{ $message }}</div>
          @enderror
      </div>
      
      <!-- 邮箱 -->
      <div class="form-group">
          <label for="email">邮箱</label>
          <input id="email" type="email" name="email" value="{{ old('email') }}" class="form-control">
          @error('email')
              <div class="text-danger">{{ $message }}</div>
          @enderror
      </div>
      
      <!-- 密码 -->
      <div class="form-group">
          <label for="password">密码</label>
          <input id="password" type="password" name="password" class="form-control">
          @error('password')
              <div class="text-danger">{{ $message }}</div>
          @enderror
      </div>
      
      <!-- 确认密码 -->
      <div class="form-group">
          <label for="password_confirmation">确认密码</label>
          <input id="password_confirmation" type="password" name="password_confirmation" class="form-control">
      </div>
      
      <!-- 服务条款 -->
      <div class="form-group">
          <div class="form-check">
              <input type="checkbox" name="agree_terms" id="agree_terms" class="form-check-input">
              <label for="agree_terms" class="form-check-label">
                  我已阅读并同意 <a href="#">服务条款</a>
              </label>
          </div>
          @error('agree_terms')
              <div class="text-danger">{{ $message }}</div>
          @enderror
      </div>
      
      <button type="submit" class="btn btn-primary">注册</button>
  </form>
  ```
## 小贴士

  **自定义规则对象**：

  ```bash
  php artisan make:rule ValidPhoneNumber
  ```

  ```php
  namespace App\Rules;

  use Illuminate\Contracts\Validation\Rule;

  class ValidPhoneNumber implements Rule
  {
      public function passes($attribute, $value)
      {
          return preg_match('/^1[3-9]\d{9}$/', $value);
      }

      public function message()
      {
          return '请输入有效的手机号码';
      }
  }
  ```

  **验证后钩子**：

  ```php
  public function withValidator($validator)
  {
      $validator->after(function ($validator) {
          if ($this->somethingElseIsInvalid()) {
              $validator->errors()->add('field', '附加验证错误');
          }
      });
  }
  ```

  **准备输入数据**：

  ```php
  protected function prepareForValidation()
  {
      $this->merge([
          'slug' => Str::slug($this->title),
      ]);
  }
  ```

  **API错误响应**：

  ```php
  public function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
  {
      throw new \Illuminate\Http\Exceptions\HttpResponseException(
          response()->json([
              'success' => false,
              'errors' => $validator->errors()
          ], 422)
      );
  }
  ```


