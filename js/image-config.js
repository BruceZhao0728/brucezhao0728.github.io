// 图片CDN配置
// 可以在这里统一配置图片的CDN地址

const IMAGE_CONFIG = {
    // 设置为 true 使用CDN，false 使用本地路径
    useCDN: false,
    
    // CDN基础URL - 替换为你的CDN地址
    // 例如 jsDelivr: 'https://cdn.jsdelivr.net/gh/brucezhao0728/brucezhao0728.github.io@main'
    // 或使用完整的自定义CDN地址
    cdnBaseUrl: '',
    
    // 本地基础路径
    localBaseUrl: '',
    
    // 获取图片URL的函数
    getImageUrl: function(path) {
        if (this.useCDN && this.cdnBaseUrl) {
            return `${this.cdnBaseUrl}/${path}`;
        }
        return `${this.localBaseUrl}${path}`;
    }
};

// 如果需要启用CDN，修改以下配置：
// IMAGE_CONFIG.useCDN = true;
// IMAGE_CONFIG.cdnBaseUrl = 'https://cdn.jsdelivr.net/gh/brucezhao0728/brucezhao0728.github.io@main';
