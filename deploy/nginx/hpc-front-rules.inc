# 用户端伪静态与接口代理：放在已有站点的 server 块内。
# 宝塔可将本文件内容粘贴到用户端站点“伪静态”，不包含 server / http / map。
# 网站目录：/www/wwwroot/hpc_manager_server/front-dist；默认文档：index.html。
# config.yaml 的 front.public-origin 必须与浏览器协议、域名/IP、端口一致。
# 合并前移除重复的 location /、/client-api/、/index.html 等配置。
client_max_body_size 10m;

location = /index.html {
    add_header Cache-Control "no-cache" always;
}

location / {
    try_files $uri $uri/ /index.html;
}

location ^~ /assets/ {
    try_files $uri =404;
}

location ^~ /client-api/ {
    # 末尾无 /：保留完整路径、查询参数和请求体供后端验签。
    proxy_pass http://127.0.0.1:8888;
    proxy_http_version 1.1;
    proxy_set_header Host $http_host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_connect_timeout 10s;
    proxy_read_timeout 3600s;
    proxy_send_timeout 3600s;
    proxy_buffering off;
    proxy_cache off;
    proxy_intercept_errors off;
    # 下载、终端等一次性票据不得写入访问日志。
    access_log off;
}
