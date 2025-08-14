# 本地化
## 概念

  **什么是本地化？**
  > - 本地化就是让你的应用能"说"多种语言，就像同声传译一样，让不同语言的用户都能理解你的应用内容。

  **有什么用？**
  - 支持多语言用户群体
  - 提升国际用户体验
  - 扩大应用市场范围
  - 满足不同地区法规要求
  - 提高应用专业度和竞争力

## 一、多语言文件

  **是什么？**
  > - 多语言文件就像应用的"翻译词典"，每个语言对应一个文件夹，里面存放着所有需要翻译的文本内容。

  **有什么用？**
  - 集中管理所有翻译内容
  - 方便添加新语言支持
  - 快速查找和修改翻译文本
  - 支持动态替换变量

  **怎么用？**

  1. **创建语言文件夹**
  ```bash
  # 创建语言文件夹结构
  resources/
    lang/
      en/      # 英语
        messages.php
      zh_CN/   # 简体中文
        messages.php
      es/      # 西班牙语
        messages.php
  ```

  2. **编辑语言文件 `resources/lang/en/messages.php`**
  ```php
  return [
      'welcome' => 'Welcome to our application!',
      'greeting' => 'Hello, :name!',  // 带变量的翻译
      'products' => [
          'title' => 'Our Products',
          'description' => 'Check out our latest products'
      ],
      'cart' => [
          'empty' => 'Your cart is empty',
          'add' => 'Add to cart'
      ]
  ];
  ```

  3. **中文文件 `resources/lang/zh_CN/messages.php`**
  ```php
  return [
      'welcome' => '欢迎使用我们的应用！',
      'greeting' => '你好，:name！',
      'products' => [
          'title' => '我们的产品',
          'description' => '查看我们最新的产品'
      ],
      'cart' => [
          'empty' => '您的购物车是空的',
          'add' => '加入购物车'
      ]
  ];
  ```

  4. **实际应用：多语言路由**
  ```php
  // routes/web.php
  Route::group(['prefix' => '{locale}'], function () {
      Route::get('/', function ($locale) {
          App::setLocale($locale); // 设置当前语言
          return view('home');
      });
      
      Route::get('/products', 'ProductController@index');
  });
  ```

## 二、翻译方法

  **是什么？**
  > - 翻译方法是Laravel提供的工具，用于在代码中获取当前语言的文本内容。

  **有什么用？**
  - 在视图、控制器等地方输出翻译文本
  - 动态替换翻译中的变量
  - 处理单复数形式
  - 支持语言回退机制

  **怎么用？**

  1. **基础翻译**
  ```php
  // 使用辅助函数
  echo __('messages.welcome'); // 输出当前语言的欢迎语

  // 使用Lang门面
  use Illuminate\Support\Facades\Lang;
  echo Lang::get('messages.welcome');
  ```

  2. **带变量的翻译**
  ```php
  // 在语言文件中
  'greeting' => 'Hello, :name!',

  // 使用
  echo __('messages.greeting', ['name' => 'John']);
  // 输出: Hello, John! (英文) 或 你好，John！(中文)
  ```

  3. **在Blade视图中使用**
  ```blade
  <!-- 基础翻译 -->
  <h1>@lang('messages.products.title')</h1>

  <!-- 带变量的翻译 -->
  <p>@lang('messages.greeting', ['name' => Auth::user()->name])</p>

  <!-- 嵌套翻译 -->
  <button>@lang('messages.cart.add')</button>
  ```

  4. **单复数处理**
  ```php
  // 语言文件
  'apples' => '{0} 没有苹果|[1,19] 有 :count 个苹果|[20,*] 有很多苹果',

  // 使用
  echo trans_choice('messages.apples', 0); // 没有苹果
  echo trans_choice('messages.apples', 5); // 有 5 个苹果
  echo trans_choice('messages.apples', 25); // 有很多苹果
  ```

  5. **设置默认语言**
  ```php
  // 在配置文件 config/app.php
  'locale' => 'zh_CN', // 默认语言

  // 动态设置语言
  App::setLocale('es'); // 设置为西班牙语

  // 获取当前语言
  $currentLocale = App::getLocale();

  // 获取备用语言（当首选语言缺少翻译时使用）
  App::setFallbackLocale('en');
  ```

  6. **实际应用：多语言表单验证**
  ```php
  // 在表单请求中 resources/lang/zh_CN/validation.php
  'custom' => [
      'email' => [
          'required' => '请填写邮箱地址',
          'email' => '请输入有效的邮箱格式',
      ],
      'password' => [
          'min' => '密码至少需要 :min 个字符',
      ],
  ],

  // 控制器中使用
  public function store(Request $request)
  {
      $request->validate([
          'email' => 'required|email',
          'password' => 'required|min:8',
      ]);
      
      // 验证失败时会自动返回对应语言的错误信息
  }
  ```
## 完整示例：多语言电商网站

  1. **语言文件结构**
  ```text
  resources/
    lang/
      en/
        common.php
        products.php
        cart.php
        auth.php
      zh_CN/
        common.php
        products.php
        cart.php
        auth.php
      es/
        common.php
        products.php
        cart.php
        auth.php
  ```

  2. **公共语言文件 `resources/lang/en/common.php`**
  ```php
  return [
      'welcome' => 'Welcome to our store',
      'login' => 'Login',
      'register' => 'Register',
      'logout' => 'Logout',
      'search' => 'Search products...',
      'copyright' => '© :year All rights reserved'
  ];
  ```

  3. **产品语言文件 `resources/lang/en/products.php`**
  ```php
  return [
      'title' => 'Products',
      'description' => 'Browse our collection',
      'price' => 'Price: :price USD',
      'add_to_cart' => 'Add to cart',
      'stock' => [
          'available' => 'In stock (:count available)',
          'out_of_stock' => 'Out of stock',
          'low_stock' => 'Only :count left!'
      ]
  ];
  ```

  4. **语言切换器组件 `resources/views/components/language-switcher.blade.php`**
  ```blade
  <div class="language-switcher">
      @foreach(config('app.available_locales') as $locale => $name)
          <a href="{{ route('set-locale', $locale) }}"
            class="{{ app()->getLocale() === $locale ? 'active' : '' }}">
              {{ strtoupper($locale) }}
          </a>
      @endforeach
  </div>
  ```

  5. **语言切换路由 `routes/web.php`**
  ```php
  Route::get('set-locale/{locale}', function ($locale) {
      // 验证语言是否可用
      if (!in_array($locale, array_keys(config('app.available_locales')))) {
          abort(400);
      }
      
      // 设置语言
      App::setLocale($locale);
      
      // 保存到会话
      session()->put('locale', $locale);
      
      return redirect()->back();
  })->name('set-locale');
  ```

  6. **中间件自动设置语言 `app/Http/Middleware/SetLocale.php`**
  ```php
  class SetLocale
  {
      public function handle($request, Closure $next)
      {
          // 优先使用会话中的语言设置
          if ($locale = session('locale')) {
              App::setLocale($locale);
          }
          // 其次使用浏览器语言
          elseif ($locale = $request->getPreferredLanguage(array_keys(config('app.available_locales')))) {
              App::setLocale($locale);
          }
          // 最后使用默认语言
          else {
              App::setLocale(config('app.fallback_locale'));
          }
          
          return $next($request);
      }
  }
  ```

  7. **注册中间件 `app/Http/Kernel.php`**
  ```php
  protected $middlewareGroups = [
      'web' => [
          // ...
          \App\Http\Middleware\SetLocale::class,
      ],
  ];
  ```

  8. **在视图中使用翻译**
  ```blade
  <!DOCTYPE html>
  <html lang="{{ app()->getLocale() }}">
  <head>
      <title>@lang('common.welcome') - {{ config('app.name') }}</title>
  </head>
  <body>
      <header>
          @include('components.language-switcher')
          
          <h1>@lang('common.welcome')</h1>
          <nav>
              <a href="/">@lang('common.home')</a>
              <a href="/products">@lang('products.title')</a>
          </nav>
      </header>
      
      <main>
          @yield('content')
      </main>
      
      <footer>
          <p>@lang('common.copyright', ['year' => date('Y')])</p>
      </footer>
  </body>
  </html>
  ```

  9. **产品列表视图 `resources/views/products/index.blade.php`**
  ```blade
  @extends('layouts.app')

  @section('content')
  <h2>@lang('products.title')</h2>
  <p>@lang('products.description')</p>

  @foreach($products as $product)
  <div class="product">
      <h3>{{ $product->name }}</h3>
      <p>@lang('products.price', ['price' => $product->price])</p>
      
      @if($product->stock > 10)
          <p>@lang('products.stock.available', ['count' => $product->stock])</p>
      @elseif($product->stock > 0)
          <p class="text-warning">@lang('products.stock.low_stock', ['count' => $product->stock])</p>
      @else
          <p class="text-danger">@lang('products.stock.out_of_stock')</p>
      @endif
      
      <button>@lang('products.add_to_cart')</button>
  </div>
  @endforeach
  @endsection
  ```
## 常见问题解答

  **Q：如何添加新语言？**  
  A：

  - 在 `resources/lang` 下创建新语言文件夹（如 `fr`）
  - 复制现有语言文件并翻译内容
  - 在 `config/app.php` 中添加：

  ```php
  'available_locales' => [
      'en' => 'English',
      'zh_CN' => '简体中文',
      'fr' => 'Français',
  ],
  ```

  **Q：翻译文本中如何包含HTML？**  
  A：

  ```php
  // 语言文件中
  'welcome' => 'Welcome to <strong>our store</strong>!',

  // Blade视图中使用
  {!! __('messages.welcome') !!}
  ```

  **Q：如何翻译数据库内容？**  
  A：使用多语言包如 `spatie/laravel-translatable`：

  ```bash
  composer require spatie/laravel-translatable
  ```

  ```php
  // 模型中使用
  class Product extends Model
  {
      use \Spatie\Translatable\HasTranslations;
      
      public $translatable = ['name', 'description'];
  }

  // 保存翻译
  $product->setTranslations('name', [
      'en' => 'English name',
      'zh_CN' => '中文名称',
  ]);
  ```

  **Q：如何获取浏览器首选语言？**  
  A：

  ```php
  $browserLang = request()->getPreferredLanguage(['en', 'zh_CN', 'es']);
  App::setLocale($browserLang);
  ```

  **Q：如何翻译验证消息？**  
  A：

  - 创建 `resources/lang/xx/validation.php` 文件
  - 覆盖默认消息：

  ```php
  return [
      'required' => '此字段是必填的',
      'email' => '请输入有效的邮箱地址',
      // ...
  ];
  ```

  **Q：如何翻译JSON文件？**  
  A：Laravel 9+ 支持JSON翻译：

  ```json
  // resources/lang/zh_CN.json
  {
      "Welcome to our store": "欢迎来到我们的商店",
      "This is a test": "这是一个测试"
  }
  ```

  ```php
  // 使用
  __('Welcome to our store'); // 自动使用JSON翻译
  ```

  **Q：如何自动化翻译？**  
  A：使用翻译管理工具：

  - 导出所有翻译键：`php artisan vue-i18n:generate`
  - 使用在线服务（如`Lokalise`）管理翻译
  - 导入翻译回项目
