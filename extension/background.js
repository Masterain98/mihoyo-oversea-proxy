// 默认设置
const DEFAULT_SETTINGS = {
    proxyDomain: 'upload-bbs-miyoushe.dal.ao',
    actMihoyoDomain: 'act-mihoyo.dal.ao',
    enableUploadBbs: true,
    enableActMihoyo: true
};

// 规则 IDs
const RULE_IDS = {
    UPLOAD_BBS: 1,
    ACT_MIHOYO: 2
};

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

// 初始化规则
async function initializeRules() {
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

        // 先清除现有动态规则
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
            console.log('米游社海外加速：规则已启用', {
                uploadBbs: settings.enableUploadBbs ? settings.proxyDomain : '已禁用',
                actMihoyo: settings.enableActMihoyo ? settings.actMihoyoDomain : '已禁用'
            });
        } else {
            console.log('米游社海外加速：所有规则已禁用');
        }
    } catch (error) {
        console.error('初始化规则失败:', error);
    }
}

// 监听安装事件
chrome.runtime.onInstalled.addListener(() => {
    console.log('米游社海外加速插件已安装');
    initializeRules();
});

// 监听启动事件
chrome.runtime.onStartup.addListener(() => {
    initializeRules();
});

// 监听存储变化，实时更新规则
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
        initializeRules();
    }
});
