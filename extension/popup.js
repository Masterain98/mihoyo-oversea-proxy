// 默认设置
const DEFAULT_SETTINGS = {
  proxyDomain: 'upload-bbs-miyoushe.dal.ao',
  actMihoyoDomain: 'act-mihoyo.dal.ao',
  enableUploadBbs: true,
  enableActMihoyo: true
};

// Nginx 配置模板
const NGINX_CONFIGS = {
  UPLOAD_BBS: `server {
  listen 80;
  listen [::]:80;
  listen 443 ssl;
  listen [::]:443 ssl;

  ssl_certificate {path_to_your_cert};
  ssl_certificate_key {path_to_your_key};
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ecdh_curve X25519:prime256v1:secp384r1:secp521r1;
  ssl_ciphers ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256;
  ssl_conf_command Ciphersuites TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256;
  ssl_conf_command Options PrioritizeChaCha;
  ssl_prefer_server_ciphers on;
  ssl_session_timeout 10m;
  ssl_session_cache shared:SSL:10m;
  ssl_buffer_size 2k;
  add_header Strict-Transport-Security max-age=15768000;
  ssl_stapling on;
  ssl_stapling_verify on;

  server_name {your_domain};
  access_log {path_to_your_log}.log combined;

  index index.html index.htm index.php;
  root {path_to_your_root};

  if ($ssl_protocol = "") { return 301 https://$host$request_uri; }

  #error_page 404 /404.html;
  #error_page 502 /502.html;

  # 反向代理：转发全部流量到 upload-bbs.miyoushe.com
  location / {
    proxy_http_version 1.1;

    # 上游站点（建议用 https）
    proxy_pass https://upload-bbs.miyoushe.com;

    # 关键：让上游看到正确 Host（用于路由/鉴权/回源）
    proxy_set_header Host upload-bbs.miyoushe.com;

    # 透传客户端真实信息
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Port $server_port;

    # 尽可能保留原始请求信息（避免某些后端取不到）
    proxy_set_header X-Original-URI $request_uri;
    proxy_set_header X-Original-Method $request_method;

    # 转发客户端请求的全部 headers/cookies：Nginx 默认会转发大部分 header，
    # 这里显式关闭可能的干预，并确保不会丢 Host 之外的信息
    proxy_pass_request_headers on;

    # 如果上游 Set-Cookie 绑定了 upload-bbs.miyoushe.com，需要改写到当前域名，否则浏览器不会回传 cookie
    proxy_cookie_domain upload-bbs.miyoushe.com $host;

    # 如上游有 Location 跳转到自身域名，自动改写为当前域名（默认 proxy_redirect 有时不够稳，显式写清）
    proxy_redirect https://upload-bbs.miyoushe.com/ /;
    proxy_redirect http://upload-bbs.miyoushe.com/ /;

    # 超时与缓冲（按需可调；保持稳妥）
    proxy_connect_timeout 10s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;

    # 如果你希望尽量“原样”转发（大文件上传/流式响应），可考虑关闭 buffering
    # proxy_request_buffering off;
    # proxy_buffering off;
  }
}
`,
  ACT_MIHOYO: `server {
  listen 80;
  listen [::]:80;
  listen 443 ssl;
  listen [::]:443 ssl;

  ssl_certificate {path_to_your_cert};
  ssl_certificate_key {path_to_your_key};
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ecdh_curve X25519:prime256v1:secp384r1:secp521r1;
  ssl_ciphers ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256;
  ssl_conf_command Ciphersuites TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256;
  ssl_conf_command Options PrioritizeChaCha;
  ssl_prefer_server_ciphers on;
  ssl_session_timeout 10m;
  ssl_session_cache shared:SSL:10m;
  ssl_buffer_size 2k;
  add_header Strict-Transport-Security max-age=15768000;
  ssl_stapling on;
  ssl_stapling_verify on;

  server_name {your_domain};
  access_log {path_to_your_log}.log combined;

  index index.html index.htm index.php;
  root {path_to_your_root};

  if ($ssl_protocol = "") { return 301 https://$host$request_uri; }


  # 只反代 act.mihoyo.com 的静态资源
  location ~* \.(png|jpg|jpeg|gif|webp|svg|ico|js|css|map|woff2?|ttf|eot)$ {
    proxy_http_version 1.1;

    proxy_pass https://act.mihoyo.com;

    proxy_set_header Host act.mihoyo.com;

    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Port $server_port;

    proxy_set_header X-Original-URI $request_uri;
    proxy_set_header X-Original-Method $request_method;

    proxy_set_header Upgrade $http_upgrade;

    proxy_pass_request_headers on;

    # 静态资源通常不需要改写跳转；关掉更稳
    proxy_redirect off;

    # 如有 Set-Cookie，确保浏览器会把 cookie 发回当前域名
    proxy_cookie_domain act.mihoyo.com $host;

    # 缓存/超时（可按需调整）
    proxy_connect_timeout 10s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;

    # 你也可以让浏览器缓存更久（若你希望“代发静态”更省流量）
    expires 30d;
    access_log off;
  }

  # 其他所有请求不反代
  location / {
    return 404;
    # 或者：return 403;
    # 或者：try_files $uri $uri/ =404;  # 如果你本地也有一些内容要提供
  }

  # 仍保留安全规则/例外目录
  location ~ /(\.user\.ini|\.ht|\.git|\.svn|\.project|LICENSE|README\.md) {
    deny all;
  }
  location /.well-known {
    allow all;
  }
}
`
};

// 规则 IDs
const RULE_IDS = {
  UPLOAD_BBS: 1,
  ACT_MIHOYO: 2
};

// DOM 元素
const elements = {
  proxyDomain: document.getElementById('proxyDomain'),
  actMihoyoDomain: document.getElementById('actMihoyoDomain'),
  enableUploadBbs: document.getElementById('enableUploadBbs'),
  enableActMihoyo: document.getElementById('enableActMihoyo'),
  saveBtn: document.getElementById('saveBtn'),
  resetBtn: document.getElementById('resetBtn'),
  toast: document.getElementById('toast'),
  // View elements
  mainView: document.getElementById('mainView'),
  configView: document.getElementById('configView'),
  // Navigation elements
  showUploadBbsConfig: document.getElementById('showUploadBbsConfig'),
  showActMihoyoConfig: document.getElementById('showActMihoyoConfig'),
  backBtn: document.getElementById('backBtn'),
  // Config content elements
  configContent: document.getElementById('configContent'),
  copyConfigBtn: document.getElementById('copyConfigBtn')
};

// 显示 Toast 提示
function showToast(message, isError = false) {
  elements.toast.textContent = message;
  elements.toast.className = 'toast show' + (isError ? ' error' : '');
  setTimeout(() => {
    elements.toast.className = 'toast';
  }, 2000);
}

// 加载设置
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get([
      'proxyDomain', 'actMihoyoDomain',
      'enableUploadBbs', 'enableActMihoyo'
    ]);

    const settings = {
      proxyDomain: result.proxyDomain || DEFAULT_SETTINGS.proxyDomain,
      actMihoyoDomain: result.actMihoyoDomain || DEFAULT_SETTINGS.actMihoyoDomain,
      enableUploadBbs: result.enableUploadBbs !== undefined ? result.enableUploadBbs : DEFAULT_SETTINGS.enableUploadBbs,
      enableActMihoyo: result.enableActMihoyo !== undefined ? result.enableActMihoyo : DEFAULT_SETTINGS.enableActMihoyo
    };

    elements.proxyDomain.value = settings.proxyDomain;
    elements.actMihoyoDomain.value = settings.actMihoyoDomain;
    elements.enableUploadBbs.checked = settings.enableUploadBbs;
    elements.enableActMihoyo.checked = settings.enableActMihoyo;
  } catch (error) {
    console.error('加载设置失败:', error);
    showToast('加载设置失败', true);
  }
}

// 生成 upload-bbs.miyoushe.com 重定向规则
function createUploadBbsRule(proxyDomain) {
  return {
    id: RULE_IDS.UPLOAD_BBS,
    priority: 1,
    action: {
      type: 'redirect',
      redirect: {
        regexSubstitution: `https://${proxyDomain}\\1`
      }
    },
    condition: {
      regexFilter: '^https://upload-bbs\\.miyoushe\\.com(/.*)$',
      resourceTypes: ['image', 'media', 'xmlhttprequest', 'other']
    }
  };
}

// 生成 act.mihoyo.com 静态资源重定向规则
function createActMihoyoRule(proxyDomain) {
  return {
    id: RULE_IDS.ACT_MIHOYO,
    priority: 1,
    action: {
      type: 'redirect',
      redirect: {
        regexSubstitution: `https://${proxyDomain}\\1`
      }
    },
    condition: {
      regexFilter: '^https://act\\.mihoyo\\.com(/.*\\.(png|jpg|jpeg|gif|webp|svg|ico|js|css|map|woff2?|ttf|eot))$',
      resourceTypes: ['image', 'media', 'stylesheet', 'script', 'font', 'xmlhttprequest', 'other']
    }
  };
}

// 更新规则
async function updateRules(settings) {
  try {
    // 先移除现有规则
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [RULE_IDS.UPLOAD_BBS, RULE_IDS.ACT_MIHOYO]
    });

    const rules = [];

    // 如果启用 upload-bbs 规则
    if (settings.enableUploadBbs && settings.proxyDomain) {
      rules.push(createUploadBbsRule(settings.proxyDomain));
    }

    // 如果启用 act.mihoyo 规则
    if (settings.enableActMihoyo && settings.actMihoyoDomain) {
      rules.push(createActMihoyoRule(settings.actMihoyoDomain));
    }

    if (rules.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: rules
      });
    }

    return true;
  } catch (error) {
    console.error('更新规则失败:', error);
    return false;
  }
}

// 保存设置
async function saveSettings() {
  const proxyDomain = elements.proxyDomain.value.trim();
  const actMihoyoDomain = elements.actMihoyoDomain.value.trim();
  const enableUploadBbs = elements.enableUploadBbs.checked;
  const enableActMihoyo = elements.enableActMihoyo.checked;

  // 简单的域名格式验证
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-_.]+[a-zA-Z0-9]$/;

  if (enableUploadBbs && proxyDomain && !domainRegex.test(proxyDomain)) {
    showToast('用户上传图片域名格式不正确', true);
    return;
  }

  if (enableActMihoyo && actMihoyoDomain && !domainRegex.test(actMihoyoDomain)) {
    showToast('活动页面域名格式不正确', true);
    return;
  }

  try {
    const settings = { proxyDomain, actMihoyoDomain, enableUploadBbs, enableActMihoyo };

    // 保存到存储
    await chrome.storage.sync.set(settings);

    // 更新规则
    const success = await updateRules(settings);

    if (success) {
      showToast('设置已保存');
    } else {
      showToast('更新规则失败', true);
    }
  } catch (error) {
    console.error('保存设置失败:', error);
    showToast('保存失败', true);
  }
}

// 恢复默认设置
async function resetSettings() {
  elements.proxyDomain.value = DEFAULT_SETTINGS.proxyDomain;
  elements.actMihoyoDomain.value = DEFAULT_SETTINGS.actMihoyoDomain;
  elements.enableUploadBbs.checked = DEFAULT_SETTINGS.enableUploadBbs;
  elements.enableActMihoyo.checked = DEFAULT_SETTINGS.enableActMihoyo;

  try {
    await chrome.storage.sync.set(DEFAULT_SETTINGS);
    await updateRules(DEFAULT_SETTINGS);
    showToast('已恢复默认设置');
  } catch (error) {
    console.error('恢复默认设置失败:', error);
    showToast('恢复失败', true);
  }
}

// --- Navigation Logic ---

function showConfigPage(configKey) {
  elements.configContent.textContent = NGINX_CONFIGS[configKey];
  elements.mainView.classList.add('hidden');
  elements.configView.classList.remove('hidden');
  // Scroll to top of config view
  elements.configView.scrollTop = 0;
}

function showMainPage() {
  elements.configView.classList.add('hidden');
  elements.mainView.classList.remove('hidden');
}

// Copy functionality
async function copyToClipboard() {
  const content = elements.configContent.textContent;
  try {
    await navigator.clipboard.writeText(content);
    showToast('配置已复制');
  } catch (err) {
    console.error('复制失败:', err);
    showToast('复制失败', true);
  }
}

// 绑定事件
elements.saveBtn.addEventListener('click', saveSettings);
elements.resetBtn.addEventListener('click', resetSettings);

elements.showUploadBbsConfig.addEventListener('click', () => {
  showConfigPage('UPLOAD_BBS');
});

elements.showActMihoyoConfig.addEventListener('click', () => {
  showConfigPage('ACT_MIHOYO');
});

elements.backBtn.addEventListener('click', showMainPage);
elements.copyConfigBtn.addEventListener('click', copyToClipboard);

// 初始化
loadSettings();
