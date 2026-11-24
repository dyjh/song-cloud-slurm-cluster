<div align="center">
  <img src="dist/logo.png" width="88" alt="凇云数据" />
  <h1>凇云超算集群服务平台</h1>
  <p>SongCloud HPC · v1.1.0</p>
  <p>面向 Slurm 集群的资源管理、作业服务与用户工作空间</p>
  <p>Go · Gin · Vue 3 · TypeScript · MySQL · Redis</p>
  <p>简体中文 | <a href="README-en.md">English</a></p>
</div>

---

## 阅读导航

| 了解平台 | 安装使用 | 日常维护 |
| --- | --- | --- |
| [平台介绍](#平台介绍) | [安装要求](#发布包与环境要求) | [软件授权](#软件授权) |
| [功能清单](#功能清单) | [部署平台](#部署平台) | [升级与常见问题](#升级维护与常见问题) |
| [系统架构](#系统架构) | [客户端域名](#客户端许可域名设置) · [集群部署](#集群配置与基础组件部署) | [第三方组件](#第三方组件与交付说明) |

## 平台介绍

凇云超算集群服务平台为 Slurm 集群提供管理端和用户端，适用于科研团队、企业计算部门和算力服务商。

- **管理端**：管理节点、用户、分区、资源额度和计费，部署集群服务，查看运行状态。
- **用户端**：通过浏览器使用应用、管理文件、提交作业、查看费用和下载个人 VPN 配置。

作业由 Slurm 调度。计算软件、GPU 驱动及相应许可证需另行准备。

### 界面预览

管理端查看集群运行情况，用户端完成日常计算操作。点击图片可查看原图。

<table width="100%">
  <tr>
    <td colspan="2" align="center">
      <a href=""><img src="https://cache.ljdyjh.cn/song-cloud-slurm-cluster/admin-dashboard.png" width="880" alt="管理看板：资源统计与任务趋势" /></a>
      <p><strong>管理看板</strong><br />资源统计 · 作业趋势 · 节点分布</p>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center" valign="top">
      <a href=""><img src="https://cache.ljdyjh.cn/song-cloud-slurm-cluster/client-desktop.png" width="440" alt="用户桌面：文件、任务与终端入口" /></a>
      <p><strong>用户桌面</strong><br />文件、任务与终端，随时打开</p>
    </td>
    <td width="50%" align="center" valign="top">
      <a href=""><img src="https://cache.ljdyjh.cn/song-cloud-slurm-cluster/application-center.png" width="440" alt="应用中心：软件版本、作业模板与图形程序" /></a>
      <p><strong>应用中心</strong><br />选择版本，提交作业或启动图形程序</p>
    </td>
  </tr>
</table>

> 实际环境截图，部分信息已隐藏。可用应用由管理员配置；图中计算软件及其许可证不包含在本运行包中。

## 功能清单

### 管理端

| 模块 | 主要功能 |
| --- | --- |
| 平台看板 | 用户、Slurm 作业与节点统计，CPU / GPU / 内存 / 存储资源汇总，任务趋势 |
| 节点管理 | Master、Storage、Login、Compute 角色；SSH / 本地执行配置；连接检测；节点价格；支持 IPMI 的设备可进行电源管理 |
| 监控与探针 | 节点探针部署、运行状态、CPU / 内存 / 磁盘 / GPU 指标与历史趋势，告警配置 |
| 集群基础组件 | 按角色检查环境、填写配置、分步安装、检查结果及卸载；任务中心展示当前步骤、日志与失败原因 |
| 分区与资源权限 | Slurm 分区管理，用户分区授权，CPU 核数与 GPU 卡数额度，分区默认每卡 CPU 数 |
| 用户与团队 | 业务用户、启停用、试用期限、团队关系、密码维护、LDAP 与 VPN 权限 |
| 存储与配额 | 默认及用户存储上限、XFS 用户配额；软阈值按硬上限的 90% 向上取整推算 |
| 计费与报表 | CPU 核时 / GPU 卡时价格、用户收费倍率、钱包与机时费流水、作业明细与费用查询、存储计费配置 |
| 应用配置 | 软件与版本、作业模板、GUI 程序入口及对应运行参数 |
| AI 助手 | 供应商连接、模型供应、Token / 缓存 / 联网计价、单轮预算、并发容量、Skill 与 RAG 知识库 |
| 图片生成 | OpenAI 与千问图片接口配置，图片模型、尺寸、质量和按张收费；启用并配置后可在对话中生成图片 |
| 平台设置 | 品牌、客户端、LDAP、OpenVPN、Slurm、存储与图形相关设置 |
| 日志与授权 | 操作 / 登录 / 错误日志，当前软件授权信息 |

### 用户端

| 模块 | 主要功能 |
| --- | --- |
| 应用中心 | 搜索软件、选择版本、使用模板或打开已配置的 GUI 应用 |
| 文件管理 | 目录浏览、上传下载、新建与编辑、重命名、删除、批量复制与剪切移动、脚本提交；标题旁展示已用空间与存储上限 |
| 终端 | 在 Login 节点使用当前系统用户身份操作，按配置启用目录隔离 |
| 任务明细 | 作业查询、状态与资源统计、费用、节点信息、取消任务，以及分区权限弹窗 |
| 钱包与团队 | 余额、机时费及流水查询，团队信息与入队申请 |
| 个人信息 | 资料与账号安全维护；有 OpenVPN 权限时下载个人 `.ovpn` 配置 |
| AI 助手 | 对话、已配置的工具与知识检索；具备图片模型配置时可调用图片生成工具 |

CPU / GPU 额度为 `0` 表示没有该资源额度。分区默认每卡 CPU 数用于默认资源分配，不等于对每个用户强制规定卡核比。文件管理中的“上限”对应存储硬上限。

## 系统架构

### 主要组件

| 部分 | 技术与职责 |
| --- | --- |
| 管理端 | Vue 3、Vite、Element Plus、Pinia、Vue Router；配置、管理与报表 |
| 用户端 | Vue 3、TypeScript、Vite；浏览器桌面、多窗口与业务用户操作 |
| 服务端 | Go、Gin、GORM；业务接口、后台任务、数据存储与集群服务管理 |
| 认证授权 | 管理端 JWT / Casbin；用户端独立会话、请求签名与重放防护；商户软件授权 |
| 数据服务 | MySQL 保存平台数据；Redis 保存会话和一次性请求状态 |
| 集群对接 | SSH、本地命令、Slurm、LDAP / SSSD、MUNGE、NFS / XFS、OpenVPN |
| Web 入口 | Nginx 提供静态页面、API 与 WebSocket 反向代理；Supervisor 管理 Go 服务进程 |

```text
浏览器
├─ 管理端 → Nginx /api/        → Go 管理接口（移除 /api 前缀）
└─ 用户端 → Nginx /client-api/ → Go 用户接口（保留完整路径）
                                  ├─ MySQL / Redis
                                  ├─ 授权服务 / AI 供应商
                                  └─ SSH 或本地执行 → 集群节点
                                                       ├─ Slurm / MUNGE
                                                       ├─ LDAP / SSSD
                                                       ├─ NFS / XFS
                                                       └─ OpenVPN / 图形应用
```

集群基础组件通过后台任务分步执行部署操作，进度与日志由任务中心保存。关闭页面不等于取消后台任务。

## 发布包与环境要求

### 目录结构

```text
v1.0.0/
├─ server                 # Linux amd64 服务端
├─ dist/                  # 管理端生产静态文件
├─ front-dist/            # 用户端生产静态文件
├─ resource/              # 模板、节点探针、集群运行工具及摘要
├─ deploy/
│  ├─ nginx/              # 管理端和用户端代理示例
│  └─ supervisor/         # 服务进程配置示例
├─ docs/images/           # 本说明使用的界面截图
├─ config.example.yaml    # 无实际凭据的配置示例
├─ BUILD-INFO.txt          # 构建日期、来源与兼容信息
├─ SHA256SUMS             # 发布文件校验清单
├─ LICENSE.txt            # 商业软件使用条款（英文）
├─ README.md
└─ README-en.md
```

### 安装要求

| 项目 | 要求 |
| --- | --- |
| 平台服务器 | Linux x86_64 / amd64，glibc ≥ 2.34；Ubuntu 24、Rocky 10 满足此要求 |
| 数据库与缓存 | MySQL 8、Redis，安装前准备好连接账号 |
| Web 与进程管理 | Nginx、Supervisor |
| 网络 | 平台服务器能访问授权服务；启用 AI 时能访问供应商接口；节点能访问安装所需的软件源 |
| 用户文件 | 平台服务器能解析用户 UID / GID，并访问用户目录；多机部署需配置目录认证与共享存储 |
| 集群节点 | 自动部署支持 Ubuntu 24.*、Rocky 8、Rocky 10 |

**Rocky 8 可作为集群节点，但不能直接运行本包中的平台服务端。** 它自带的 glibc 2.28 低于本包要求，运行平台需使用兼容的服务端版本，不要升级系统 glibc。

本包已启用 CGO，用于系统 NSS / LDAP 用户解析。运行时不需要安装 Go 或 Node.js；MySQL、Redis、Nginx 和 Supervisor 需自行安装。

## 部署平台

以下使用 `/www/wwwroot/hpc_manager_server` 作为安装目录，管理端 HTTP `80`、用户端 HTTP `5174`、后端 `8888`。安装到其他路径时同步修改 Supervisor 的工作目录、启动命令、日志路径和 Nginx 的 `root`。

### 上传与校验

将 `v1.0.0/` 内的全部文件上传到服务器的空目录 `/www/wwwroot/hpc_manager_server/`，保持目录结构。`server` 已是可执行文件，无需解压。

```bash
cd /www/wwwroot/hpc_manager_server
sha256sum -c SHA256SUMS
sudo chmod +x server resource/probe/hpc-node-probe-linux-amd64 \
  resource/cluster-runtime/hpc-cluster-runtime-linux-amd64
sudo cp config.example.yaml config.yaml
sudo chmod 600 config.yaml
```

已有环境请使用后文的升级流程，不要覆盖原配置或运行数据。

### 填写配置

编辑 `config.yaml` 中的对应配置项，其他字段保留原值。

```yaml
system:
  addr: 8888
  router-prefix: ""
  db-type: mysql
  use-redis: true
  use-cron: true
  trusted-proxies:
    - 127.0.0.1

redis:
  useCluster: false
  addr: 127.0.0.1:6379
  password: "替换为实际 Redis 密码"
  db: 0

front:
  enabled: true
  jwt-signing-key: "替换为独立生成的 Base64 密钥"
  public-origin: "http://你的服务器IP:5174"
  allowed-origins: []
```

使用 `openssl rand -base64 32` 分别生成密钥，独立填写：

| 配置项 | 用途 |
| --- | --- |
| `jwt.signing-key` | 管理端登录令牌签名，替换示例默认值 |
| `front.jwt-signing-key` | 用户端令牌签名，至少 32 随机字节的 Base64 |
| `ai-helper.master-key` | AI 供应商密钥加密，启用 AI 前填写 32 随机字节的 Base64 |

请妥善保存密钥。更换 `ai-helper.master-key` 后，原有 AI 供应商凭据将无法解密。

**计划任务**：`use-cron` 用于作业同步、计费等定时任务。软件授权每三小时刷新一次，不受此开关控制。

**配置页显示**：`system.env: public` 会隐藏部分平台配置页签，请按实际需要设置。

首次安装保留示例中的空平台数据库连接，稍后通过初始化页面填写。先确保 MySQL 服务与可初始化目标库的账号可用。**平台数据库与 Slurm 记账数据库是不同用途**：后者在部署 Master 基础组件时单独填写。

### 使用 Supervisor 托管服务端

参考 [Supervisor 示例](deploy/supervisor/hpc-manager.conf)。将其放入当前 Supervisor 的 include 目录；常见位置为 Ubuntu 的 `/etc/supervisor/conf.d/` 或 Rocky 的 `/etc/supervisord.d/`，以本机主配置为准。

```ini
[program:hpc_manager]
directory=/www/wwwroot/hpc_manager_server
command=/www/wwwroot/hpc_manager_server/server -c /www/wwwroot/hpc_manager_server/config.yaml
user=root
autostart=false
autorestart=unexpected
startsecs=5
startretries=3
stopsignal=TERM
stopwaitsecs=30
stopasgroup=true
killasgroup=true
redirect_stderr=true
stdout_logfile=/www/wwwroot/hpc_manager_server/server.log
stdout_logfile_maxbytes=50MB
stdout_logfile_backups=5
```

示例以 root 运行，供集群本地管理、系统用户切换及文件权限操作使用；用户文件操作仍按相应业务用户权限执行。使用其他账号运行时，需先配置相应的系统权限。

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start hpc_manager
sudo supervisorctl status hpc_manager
sudo supervisorctl tail hpc_manager
```

初次人工启动正常后，可将 `autostart` 改为 `true` 并重新加载配置，同时确保 Supervisor 自身已设为开机启动。修改程序配置后通过 `supervisorctl restart hpc_manager` 重启；不要同时手动启动第二个 `server` 进程。

### Nginx 伪静态

管理端站点目录指向 `dist/`，用户端指向 `front-dist/`。两个站点都在各自的 `server` 块（宝塔为“伪静态”设置）中配置：

```nginx
location / {
    try_files $uri $uri/ /index.html;
}

location ^~ /assets/ {
    try_files $uri =404;
}
```

页面路径回退到 `index.html`，不存在的静态资源返回 404。已有 `location /` 时直接替换，避免重复配置。

端口、域名、HTTPS 和反向代理按常规方式配置。完整示例见 [管理端](deploy/nginx/hpc-admin-http.conf) 和 [用户端](deploy/nginx/hpc-front-http.conf)，配套规则见 [管理端规则](deploy/nginx/hpc-admin-rules.inc) 和 [用户端规则](deploy/nginx/hpc-front-rules.inc)。管理端 `/api/` 转发时移除前缀；用户端 `/client-api/` 保留完整路径。修改安装目录时同步调整示例中的 `root` 和 `include` 路径。

本包用户端按独立站点根路径部署。配置完成后执行 `nginx -t`，通过后再重载 Nginx。

### 完成首次初始化

1. 打开管理端 `/#/init`。
2. 先填写商户授权码，点击“校验并保存”；成功后点击“下一步”。
3. 设置 `admin` 管理员密码，选择 MySQL，填写数据库主机、端口、库名和账号密码，执行初始化。请主动设置自己的密码。
4. 登录管理端，在“当前授权”确认商户、等级、到期时间与设备额度。
5. 添加节点并配置集群服务，再创建业务用户、分配资源权限，测试文件访问与作业提交。

已初始化的数据库不要再次执行初始化。已有环境的升级按对应版本的升级说明处理。

## 客户端许可域名设置

在服务端 `config.yaml` 的 `front.public-origin` 中填写用户访问客户端的完整地址。软件授权服务和 VPN 地址分别配置。

| 字段 | 含义与填写方法 |
| --- | --- |
| `front.public-origin` | 客户端正式入口，包含协议、域名或 IP、非默认端口，例如 `https://client.example.com` 或 `http://192.168.10.20:5174` |
| `front.allowed-origins` | 额外允许的 HTTP 请求来源；终端、GUI 和签名请求仍使用 `public-origin` |
| `system.trusted-proxies` | 直接连接 Go 后端的可信代理 IP，本机 Nginx 示例填 `127.0.0.1`；不是浏览器域名列表 |

建议固定一个正式客户端入口：

```yaml
front:
  public-origin: "https://client.example.com"
  allowed-origins: []
```

保留其他 `front` 字段。**不要填写 `/#/`、页面路径、查询参数或通配符**。按浏览器 Origin 的形式填写，不加末尾 `/`；`http` 与 `https`、不同端口以及 IP 与域名都是不同入口。

请求签名、终端和 GUI 连接均使用 `public-origin`。请统一从这个地址访问客户端，并将备用域名跳转到该地址。

变更域名时，同步修改 DNS、Nginx `server_name` / HTTPS 证书和 `front.public-origin`，重启后端，再从正式入口重新登录。默认同源 `/client-api` 方式下，仅更换域名不需要重新构建前端。

## 集群配置与基础组件部署

**平台服务启动不等于集群组件已经部署。** 先在“服务器节点”录入节点和 SSH 连接，再从相应节点的“服务管理 → 集群基础组件”执行。

| 角色 | 主要职责与部署内容 |
| --- | --- |
| Master | 与平台后端位于同一服务器；目录服务、SSSD、MUNGE、Slurm 控制与记账服务，连接已有记账数据库 |
| Storage | XFS 与用户配额、NFS 服务、目录身份解析；部署完成后补齐 Master 的共享目录访问 |
| Login | 目录认证、共享目录访问、Slurm 客户端、SSH / PAM 登录和 OpenVPN 个人证书接入 |
| Compute | 目录认证、共享目录访问、MUNGE、slurmd；按硬件及驱动探测配置 CPU / NVIDIA GPU 资源 |

顺序为 **Master → Storage → Login / Compute**，Login 和 Compute 可分别部署。不同角色可位于同一台设备，共享目录直接使用本地路径。Master 使用其他机器可访问的内网地址，不能向远程节点发布 `127.0.0.1` 作为服务地址。

在节点服务页面中，先检查环境，再填写配置并校验，确认后开始部署。完成后，平台会检查服务并保存相关配置。进度、日志和失败原因可在任务中心查看。

**存储与卸载**

- 已有 XFS 目录需启用用户配额；选择磁盘格式化前请确认设备，格式化无法撤销。
- 卸载只清理部署时添加或修改的内容，其他角色仍在使用的公共组件会保留。
- Storage 卸载保留用户文件；Slurm 卸载保留记账数据库表。
- 删除节点记录前，需先卸载该节点已部署的服务。

**已有集群**

在平台配置中填写 LDAP、Slurm、存储及 Login 连接信息。录入节点后，还需完成对应服务配置。手动接入 OpenVPN 要求服务已支持平台的个人证书管理，不能直接使用共用证书的实例。

## 软件授权

本软件为商业软件。公开提供运行包下载，使用须取得有效授权。具体条款见 [LICENSE.txt](LICENSE.txt)。

### 查看与更换授权

打开管理端“当前授权”，可查看商户、等级、服务说明、授权码、有效期、节点额度、允许的 IP 和最近验证时间。所有管理角色均可查看，有修改权限的管理员可在此更换授权码。

授权方：**上海凇云科技有限公司**。

授权支持指定到期时间或无限期、节点数量上限或不限数量，以及可选的多个 IP 绑定。实际权益以该商户授权信息和交付约定为准。

### 授权验证

| 项目 | 说明 |
| --- | --- |
| 首次安装 | 先验证授权码，再填写数据库信息 |
| 自动更新 | 每 3 小时验证一次；启动服务或保存授权码时也会验证 |
| 到期处理 | 到期时间在本地检查；等级、IP 和授权码变更在下一次在线验证时更新 |
| 无效或连接失败 | 授权到期、授权码失效或验证时无法连接授权服务，将暂停平台业务访问 |
| 恢复使用 | 管理端仍可登录、查看授权和更换授权码；更换有效授权码或恢复连接后重新验证 |
| 已提交的作业 | 不会自动取消已提交到 Slurm 的作业 |

授权信息加密传输，平台会核对响应来源、对应请求及时间。响应须在签发后 1 分钟内收到；软件的使用期限按授权到期时间计算。

授权保存在 `config.yaml` 同目录的 `license.json` 中，请妥善保管并备份。重启服务仍需联网验证。

### 节点数量与 IP 限制

设备计数按平台内**未删除的节点记录数**计算，同一 IP 下的 Master、Storage、Login、Compute 分别计数。额度降低后保留现有节点；超限时提示并限制新增，不会自动删除设备。

启用 IP 限制时，授权服务核对请求来源 IP 与商户绑定范围。通常应绑定平台访问授权服务所用的公网出口 IP，而不是用户电脑 IP、VPN 地址池或客户端域名。经代理 / NAT 时应确认实际出口，不能自行提交一个 IP 代替服务端验证。

## 升级维护与常见问题

### 升级与备份

升级前备份平台数据库、`config.yaml`、`license.json`、用户上传数据和相关集群配置。集群的 LDAP、证书材料、用户共享目录和 Slurm 记账库也需按其用途分别备份。

核对新版本的升级要求后，停止服务，更新程序、页面文件和需要更换的节点工具，按升级说明处理数据库，再启动服务并测试。

保留原有 `config.yaml`、密钥和数据。数据库结构发生变化时，恢复旧版本还需按升级说明恢复对应数据库。

### 常见问题

| 现象 | 优先检查 |
| --- | --- |
| `GLIBC_2.34 not found` | 运行主机 libc 不满足本包要求；使用兼容构建，不升级系统 glibc 来迁就包 |
| 页面正常但接口 404 | Nginx 静态目录、管理端 `/api/` 去前缀和用户端 `/client-api/` 保留路径是否正确 |
| 客户端登录、签名或终端被拒绝 | `front.enabled`、Redis、密钥、浏览器 Origin、代理 Host、系统时间与 WebSocket 转发 |
| “授权服务器不可达” | 后端机器的 DNS、HTTPS 出站连接、证书信任、代理及授权服务状态；内部同名 DNS 区域也可能影响解析 |
| AI 供应商凭据无法保存或解密 | `ai-helper.master-key` 是否符合格式；是否误更换了已有密钥 |
| 文件管理或用户终端失败 | 用户 UID / GID 解析、共享目录、权限、Login 连接；隔离模式为 `required` 时还需隔离工具与系统能力可用 |
| 作业显示排队或更新较慢 | Slurm 的实际排队原因、节点状态、用户权限 / 额度，以及平台任务同步配置 |

部署完成后，请测试管理端和用户端登录、授权验证、文件读写、终端连接，以及一次 Slurm 作业提交。已启用的 VPN、GUI、GPU、计费和 AI 功能也应分别测试。

## 第三方组件与交付说明

本平台基于 gin-vue-admin 及相关开源组件开发。源码根 README 声明的 gin-vue-admin BSL 1.1 条款、版权与署名要求仍需遵守；平台授权不包含第三方组件或计算软件的额外使用许可。

本包随带的浏览器组件声明见 [noVNC 说明](front-dist/licenses/novnc-1.6.0/README.txt) 与 [Xpra 来源说明](front-dist/vendor/xpra/UPSTREAM.md)，其许可证保留在对应目录。Slurm、OpenVPN、数据库、AI 接口和计算软件分别适用各自许可与服务条款。

运行包不含实际数据库、管理员凭据、API Key、商户授权码、个人 VPN 证书或完整源码仓库。AI 功能需要配置供应商账号与费用规则；第三方计算软件需要另行准备和授权。交付范围、部署协助与服务期限以具体约定为准。

版本和运行环境信息见 [BUILD-INFO.txt](BUILD-INFO.txt)。
