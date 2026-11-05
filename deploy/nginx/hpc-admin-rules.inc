# 管理端伪静态与接口代理：放在已有站点的 server 块内。
# 宝塔可将本文件内容粘贴到管理端站点“伪静态”，不包含 server / http / map。
# 网站目录：/www/wwwroot/hpc_manager_server/dist；默认文档：index.html。
# 适用于本包 /api 前缀及后端 system.router-prefix: ""。
# 合并前移除重复的 location /、/api/、/index.html 等配置。
client_max_body_size 20m;

location = /index.html {
    add_header Cache-Control "no-cache" always;
}

# 已存在的静态文件直接返回，其余页面路径交给前端。
location / {
    try_files $uri $uri/ /index.html;
}

# 静态资源不存在时返回 404，不使用 HTML 冒充 JS / CSS。
location ^~ /assets/ {
    try_files $uri =404;
}

location ^~ /api/ {
    # 末尾有 /：/api/base/... 转发为后端 /base/...。
    proxy_pass http://127.0.0.1:8888/;
    proxy_http_version 1.1;
    proxy_set_header Host $http_host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    # 不依赖 http 层 map，方便直接用于站点伪静态配置。
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_connect_timeout 10s;
    proxy_read_timeout 3600s;
    proxy_send_timeout 3600s;
    proxy_buffering off;
    proxy_cache off;
    proxy_intercept_errors off;
    # 避免一次性票据进入访问日志。
    access_log off;
}
