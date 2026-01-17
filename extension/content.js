// 注入反代状态提示
(async function () {
    // 获取设置
    const result = await chrome.storage.sync.get(['proxyDomain', 'enableUploadBbs']);
    const settings = {
        proxyDomain: result.proxyDomain || 'upload-bbs-miyoushe.dal.ao',
        enableUploadBbs: result.enableUploadBbs !== undefined ? result.enableUploadBbs : true
    };

    // 如果未启用，不注入
    if (!settings.enableUploadBbs) {
        return;
    }

    // 等待页面加载完成
    function waitForElement(selector, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
                return;
            }

            const observer = new MutationObserver(() => {
                const element = document.querySelector(selector);
                if (element) {
                    observer.disconnect();
                    resolve(element);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            setTimeout(() => {
                observer.disconnect();
                reject(new Error('Element not found: ' + selector));
            }, timeout);
        });
    }

    try {
        // 等待工具区域出现
        const toolsSection = await waitForElement('.mhy-side-section.game-tool');

        // 检查是否已经注入
        if (document.getElementById('mihoyo-proxy-status')) {
            return;
        }

        // 创建提示元素
        const notification = document.createElement('div');
        notification.id = 'mihoyo-proxy-status';
        notification.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #e8f4fd 0%, #f0f8ff 100%);
        border: 1px solid #00a8ec;
        border-radius: 12px;
        padding: 12px 16px;
        margin-top: 16px;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 13px;
        color: #333;
        box-shadow: 0 2px 8px rgba(0, 168, 236, 0.15);
      ">
        <img src="${chrome.runtime.getURL('icons/logo.png')}" style="width: 32px; height: 32px; object-fit: contain;">
        <div>
          <div style="font-weight: 500; color: #00a8ec; margin-bottom: 2px;">用户上传图片加速已启用</div>
          <div style="font-size: 12px; color: #666;">
            通过 <span style="color: #00a8ec; font-weight: 500;">${settings.proxyDomain}</span> 加速
          </div>
        </div>
      </div>
    `;

        // 插入到工具区域之前
        toolsSection.parentNode.insertBefore(notification, toolsSection);

        console.log('米游社海外加速：状态提示已注入');
    } catch (error) {
        console.log('米游社海外加速：无法找到侧边栏元素', error);
    }
})();
