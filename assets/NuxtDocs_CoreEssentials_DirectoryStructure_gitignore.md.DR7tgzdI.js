import{_ as n,c as a,o as p,ag as e}from"./chunks/framework.DgDu2bHw.js";const u=JSON.parse('{"title":".gitignore","description":"","frontmatter":{},"headers":[],"relativePath":"NuxtDocs/CoreEssentials/DirectoryStructure/gitignore.md","filePath":"NuxtDocs/CoreEssentials/DirectoryStructure/gitignore.md"}'),l={name:"NuxtDocs/CoreEssentials/DirectoryStructure/gitignore.md"};function i(r,s,t,c,b,o){return p(),a("div",null,s[0]||(s[0]=[e(`<h1 id="gitignore" tabindex="-1">.gitignore <a class="header-anchor" href="#gitignore" aria-label="Permalink to &quot;.gitignore&quot;">​</a></h1><details class="details custom-block"><summary>理论阐述</summary><p><strong>🧠 核心概念</strong></p><blockquote><ul><li><code>.gitignore</code> 是 <strong>Git 版本控制的忽略规则文件</strong>，用于指定哪些文件/目录不应该提交到代码仓库，保护敏感数据和避免垃圾文件污染。</li></ul></blockquote><hr><p><strong>🚫 开发者须知（最重要！）</strong></p><blockquote><ul><li><strong>必须存在</strong>：每个 Nuxt3 项目都应包含此文件</li><li><strong>位置固定</strong>：位于项目根目录</li><li><strong>格式简单</strong>：每行一个忽略规则</li><li><strong>立即生效</strong>：添加后需重新 git add</li></ul></blockquote><hr><p><strong>📄 文件结构示例</strong></p><p>这里只是一个参考：</p><div class="language-text vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes min-light nord vp-code" tabindex="0"><code><span class="line"><span># .gitignore</span></span>
<span class="line"><span># =========== 核心忽略项 ===========</span></span>
<span class="line"><span>  .nuxt</span></span>
<span class="line"><span>  .output</span></span>
<span class="line"><span>  node_modules</span></span>
<span class="line"><span>  dist</span></span>
<span class="line"><span></span></span>
<span class="line"><span># =========== 环境文件 ===========</span></span>
<span class="line"><span>  .env</span></span>
<span class="line"><span>  .env.*</span></span>
<span class="line"><span>  !.env.example</span></span>
<span class="line"><span></span></span>
<span class="line"><span># =========== 系统文件 ===========</span></span>
<span class="line"><span>  .DS_Store</span></span>
<span class="line"><span>  Thumbs.db</span></span>
<span class="line"><span></span></span>
<span class="line"><span># =========== 日志文件 ===========</span></span>
<span class="line"><span>  *.log</span></span>
<span class="line"><span>  logs/</span></span>
<span class="line"><span></span></span>
<span class="line"><span># =========== 编辑器文件 ===========</span></span>
<span class="line"><span>  .idea/</span></span>
<span class="line"><span>  .vscode/</span></span>
<span class="line"><span>  *.suo</span></span>
<span class="line"><span>  *.ntvs*</span></span>
<span class="line"><span>  *.njsproj</span></span>
<span class="line"><span>  *.sln</span></span>
<span class="line"><span>  *.sw?</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br></div></div><hr><p><strong>⚙️ 工作原理</strong></p><blockquote><p><strong>1: git add</strong> -&gt; <strong>2: 检查.gitignore</strong> -&gt; <strong>3: {匹配规则?}</strong> -&gt; <strong>4: [匹配到: 跳过文件; 没有匹配到: 添加到暂存区]</strong></p></blockquote><hr><p><strong>💡 基础使用</strong></p><p>1.<strong>添加忽略规则：</strong></p><div class="language-gitignore vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">gitignore</span><pre class="shiki shiki-themes min-light nord vp-code" tabindex="0"><code><span class="line"><span># 忽略所有 .tmp 文件</span></span>
<span class="line"><span>*.tmp</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 忽略目录</span></span>
<span class="line"><span>temp/</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 忽略特定文件</span></span>
<span class="line"><span>secret-key.txt</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br></div></div><p>2.<strong>例外规则：</strong></p><div class="language-gitignore vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">gitignore</span><pre class="shiki shiki-themes min-light nord vp-code" tabindex="0"><code><span class="line"><span># 忽略所有 .md 文件</span></span>
<span class="line"><span>*.md</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 但不忽略 README.md</span></span>
<span class="line"><span>!README.md</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br></div></div><hr><p><strong>🌟 Nuxt3 必备忽略项</strong></p><table tabindex="0"><thead><tr><th><strong>忽略项</strong></th><th><strong>原因说明</strong></th><th><strong>是否必须</strong></th></tr></thead><tbody><tr><td>.nuxt</td><td>构建缓存目录</td><td>✅</td></tr><tr><td>.output</td><td>生产构建输出</td><td>✅</td></tr><tr><td>node_modules</td><td>依赖目录（可通过安装重建）</td><td>✅</td></tr><tr><td>.env</td><td>环境变量（含敏感信息）</td><td>✅</td></tr><tr><td>*.log</td><td>日志文件</td><td>⭐️</td></tr><tr><td>.DS_Store</td><td>macOS 系统文件</td><td>⭐️</td></tr><tr><td>.idea/.vscode</td><td>编辑器配置文件</td><td>⭐️</td></tr><tr><td>dist</td><td>旧版构建输出</td><td>⏳</td></tr></tbody></table><hr><p><strong>⚡️ 实用技巧</strong></p><p>1.<strong>分层忽略：</strong></p><div class="language-gitignore vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">gitignore</span><pre class="shiki shiki-themes min-light nord vp-code" tabindex="0"><code><span class="line"><span># gitignore</span></span>
<span class="line"><span>node_modules/</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 但允许特定子目录</span></span>
<span class="line"><span>!app/test-utils/node_modules/</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br></div></div><p>2.<strong>注释说明：</strong></p><div class="language-gitignore vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">gitignore</span><pre class="shiki shiki-themes min-light nord vp-code" tabindex="0"><code><span class="line"><span># ========== Nuxt 构建文件 ==========</span></span>
<span class="line"><span>.nuxt</span></span>
<span class="line"><span>.output</span></span>
<span class="line"><span></span></span>
<span class="line"><span># ========== 环境配置 ==========</span></span>
<span class="line"><span>.env</span></span>
<span class="line"><span>.env.local</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br></div></div><p>3.<strong>通用模板：</strong></p><div class="language-gitignore vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">gitignore</span><pre class="shiki shiki-themes min-light nord vp-code" tabindex="0"><code><span class="line"><span># Nuxt官方推荐基础配置</span></span>
<span class="line"><span>.nuxt</span></span>
<span class="line"><span>.output</span></span>
<span class="line"><span>node_modules</span></span>
<span class="line"><span>dist</span></span>
<span class="line"><span>.env</span></span>
<span class="line"><span>.DS_Store</span></span>
<span class="line"><span>*.log</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br></div></div><hr><p><strong>⚠️ 常见错误</strong></p><p>1.<strong>忽略规则失效：</strong></p><div class="language-bash vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes min-light nord vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#C2C3C5;--shiki-dark:#616E88;"># 已跟踪文件需要先取消</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#88C0D0;">git</span><span style="--shiki-light:#2B5581;--shiki-dark:#A3BE8C;"> rm</span><span style="--shiki-light:#2B5581;--shiki-dark:#A3BE8C;"> --cached</span><span style="--shiki-light:#2B5581;--shiki-dark:#A3BE8C;"> file.txt</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br></div></div><p>2.<strong>忽略语法错误：</strong></p><div class="language-gitignore vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">gitignore</span><pre class="shiki shiki-themes min-light nord vp-code" tabindex="0"><code><span class="line"><span># 错误：缺少斜杠（会忽略所有同名文件）</span></span>
<span class="line"><span>node_modules  ❌</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 正确：忽略目录</span></span>
<span class="line"><span>node_modules/ ✅</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br></div></div><p>3.<strong>误忽略必要文件：</strong></p><div class="language-gitignore vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">gitignore</span><pre class="shiki shiki-themes min-light nord vp-code" tabindex="0"><code><span class="line"><span># 危险：忽略所有配置文件</span></span>
<span class="line"><span>*.js         ❌</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 安全：只忽略特定文件</span></span>
<span class="line"><span>temp/*.js    ✅</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br></div></div><hr><p><strong>📚 完整 Nuxt3 .gitignore 模板</strong></p><div class="language-gitignore vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">gitignore</span><pre class="shiki shiki-themes min-light nord vp-code" tabindex="0"><code><span class="line"><span># ========== Nuxt 核心 ==========</span></span>
<span class="line"><span>.nuxt</span></span>
<span class="line"><span>.output</span></span>
<span class="line"><span>.nitro</span></span>
<span class="line"><span>.nuxtrc</span></span>
<span class="line"><span></span></span>
<span class="line"><span># ========== 依赖项 ==========</span></span>
<span class="line"><span>node_modules</span></span>
<span class="line"><span>/.pnpm-store</span></span>
<span class="line"><span></span></span>
<span class="line"><span># ========== 构建产物 ==========</span></span>
<span class="line"><span>dist</span></span>
<span class="line"><span>.function_cache</span></span>
<span class="line"><span></span></span>
<span class="line"><span># ========== 环境变量 ==========</span></span>
<span class="line"><span>.env</span></span>
<span class="line"><span>.env.*</span></span>
<span class="line"><span>!.env.example</span></span>
<span class="line"><span></span></span>
<span class="line"><span># ========== 系统文件 ==========</span></span>
<span class="line"><span>.DS_Store</span></span>
<span class="line"><span>Thumbs.db</span></span>
<span class="line"><span>Desktop.ini</span></span>
<span class="line"><span></span></span>
<span class="line"><span># ========== 日志/缓存 ==========</span></span>
<span class="line"><span>*.log</span></span>
<span class="line"><span>logs/</span></span>
<span class="line"><span>.cache/</span></span>
<span class="line"><span>*.tmp</span></span>
<span class="line"><span></span></span>
<span class="line"><span># ========== 测试报告 ==========</span></span>
<span class="line"><span>coverage/</span></span>
<span class="line"><span>.nyc_output/</span></span>
<span class="line"><span></span></span>
<span class="line"><span># ========== 编辑器配置 ==========</span></span>
<span class="line"><span>.idea</span></span>
<span class="line"><span>.vscode</span></span>
<span class="line"><span>*.suo</span></span>
<span class="line"><span>*.ntvs*</span></span>
<span class="line"><span>*.njsproj</span></span>
<span class="line"><span>*.sln</span></span>
<span class="line"><span>*.sw?</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br></div></div><hr><blockquote><p>💡 提示：把 <code>.gitignore</code> 想象成海关安检 - 阻止危险品（敏感文件）和多余行李（临时文件）进入代码仓库，只放行真正需要的货物（源代码）！</p></blockquote></details>`,2)]))}const m=n(l,[["render",i]]);export{u as __pageData,m as default};
