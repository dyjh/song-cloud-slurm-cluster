<div align="center">
  <img src="dist/logo.png" width="88" alt="SongCloud Data" />
  <h1>SongCloud HPC Cluster Service Platform</h1>
  <p>SongCloud HPC · v1.0.0</p>
  <p>Resource management, job services and user workspaces for Slurm clusters</p>
  <p>Go · Gin · Vue 3 · TypeScript · MySQL · Redis</p>
  <p><a href="README.md">简体中文</a> | English</p>
</div>

---

## In this guide

| About the platform | Installation | Administration |
| --- | --- | --- |
| [Overview](#overview) | [Requirements](#package-and-requirements) | [Licensing](#software-licensing) |
| [Features](#features) | [Deployment](#platform-deployment) | [Maintenance and troubleshooting](#maintenance-and-troubleshooting) |
| [Architecture](#system-architecture) | [Client domain](#client-allowed-origin-configuration) · [Cluster setup](#cluster-configuration-and-component-deployment) | [Third-party components](#third-party-components-and-delivery-scope) |

## Overview

SongCloud HPC Cluster Service Platform (**凇云超算集群服务平台**) provides an administration console and a browser client for Slurm clusters. It is designed for research teams, enterprise computing departments and computing service providers.

- **Administration console**: manage nodes, users, partitions, quotas and billing; deploy cluster services and monitor their status.
- **User client**: run applications, manage files, submit jobs, check costs and download personal VPN profiles.

Slurm schedules the jobs. Computing applications, GPU drivers and their licenses are supplied separately.

### Screenshots

Monitor the cluster in the administration console and work in the browser client. Click an image to view it at full size.

<table width="100%">
  <tr>
    <td colspan="2" align="center">
      <a href=""><img src="https://cache.ljdyjh.cn/song-cloud-slurm-cluster/admin-dashboard.png" width="880" alt="Administration dashboard: resources and job trends" /></a>
      <p><strong>Administration dashboard</strong><br />Resource totals · Job trends · Node distribution</p>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center" valign="top">
      <a href=""><img src="https://cache.ljdyjh.cn/song-cloud-slurm-cluster/client-desktop.png" width="440" alt="User desktop: files, tasks and terminal" /></a>
      <p><strong>User desktop</strong><br />Open files, tasks and terminal from one workspace</p>
    </td>
    <td width="50%" align="center" valign="top">
      <a href=""><img src="https://cache.ljdyjh.cn/song-cloud-slurm-cluster/application-center.png" width="440" alt="Application center: software versions, templates and GUI applications" /></a>
      <p><strong>Application center</strong><br />Choose a version, submit a job or launch a GUI application</p>
    </td>
  </tr>
</table>

> Actual deployments with some details redacted. Administrators configure the available applications. The computing software shown and its licenses are not included in this package.

## Features

### Administration console

| Area | Capabilities |
| --- | --- |
| Dashboard | User, Slurm job and node statistics; CPU, GPU, memory and storage summaries; submission trends |
| Node management | Master, Storage, Login and Compute roles; SSH or local execution; connectivity checks; node pricing; IPMI operations on supported hardware |
| Monitoring | Node probe deployment, status, CPU / memory / disk / GPU metrics and history, alert configuration |
| Cluster components | Role-specific preflight checks, configuration validation, deployment steps, verification and uninstall; task progress, logs and failure details |
| Partitions and resources | Slurm partitions, user partition permissions, CPU-core and GPU-card quotas, partition default CPUs per GPU |
| Users and teams | Business users, account status, trials, team membership, password maintenance, LDAP and VPN permissions |
| Storage quotas | Default and per-user storage ceilings, XFS user quotas; soft threshold derived as 90% of the hard ceiling, rounded up |
| Billing and reports | CPU core-hour and GPU card-hour pricing, user billing multipliers, wallet and compute-credit transactions, job costs, storage billing settings |
| Applications | Software versions, submission templates, GUI launch entries and runtime parameters |
| AI assistant | Provider connections, model offerings, token / cache / web-search pricing, per-turn budgets, concurrency, Skills and RAG knowledge bases |
| Image generation | OpenAI and Qwen image APIs; model, size, quality and per-image pricing; available in chat once enabled and configured |
| Platform settings | Branding, client, LDAP, OpenVPN, Slurm, storage and graphics-related settings |
| Logs and licensing | Operation / login / error logs and current software license |

### User client

| Area | Capabilities |
| --- | --- |
| Application center | Search software, choose a version, use a template or launch a configured GUI application |
| File manager | Browse, upload, download, create, edit, rename and delete; bulk copy and cut/move; submit scripts; storage usage and ceiling beside the window title |
| Terminal | Operate on a Login node as the current system user, with directory isolation as configured |
| Task details | Job queries, status, resource usage, fees, node information, cancellation and a partition-permission dialog |
| Wallet and teams | Balance, compute credits and transactions; team information and membership requests |
| Profile | Personal details and account security; personal `.ovpn` download for authorized users |
| AI assistant | Conversations, configured tools and knowledge retrieval; image generation when an image model is configured |

A CPU or GPU quota of `0` means no allowance for that resource. Default CPUs per GPU is a partition allocation default, not a mandatory per-user CPU-to-GPU ratio. The file manager's storage ceiling is the hard limit.

## System architecture

### Main components

| Component | Stack and purpose |
| --- | --- |
| Administration console | Vue 3, Vite, Element Plus, Pinia and Vue Router; configuration, management and reporting |
| User client | Vue 3, TypeScript and Vite; browser desktop, windows and user workflows |
| Backend | Go, Gin and GORM; APIs, background tasks, data storage and cluster service management |
| Authentication | Administrator JWT / Casbin; independent client sessions, request signatures and replay protection; merchant software licensing |
| Data services | MySQL for platform data; Redis for sessions, one-time request state and related runtime services |
| Cluster integration | SSH, local commands, Slurm, LDAP / SSSD, MUNGE, NFS / XFS and OpenVPN |
| Web entry points | Nginx for static assets, APIs and WebSockets; Supervisor for the Go process |

```text
Browser
├─ Admin  → Nginx /api/        → Go admin API (strip /api prefix)
└─ Client → Nginx /client-api/ → Go client API (preserve full path)
                                  ├─ MySQL / Redis
                                  ├─ Licensing service / AI providers
                                  └─ SSH or local execution → Cluster nodes
                                                                ├─ Slurm / MUNGE
                                                                ├─ LDAP / SSSD
                                                                ├─ NFS / XFS
                                                                └─ OpenVPN / GUI apps
```

Cluster deployment runs as a sequence of background steps. The task center preserves progress and logs. Closing a page does not cancel a background task.

## Package and requirements

### Package layout

```text
v1.0.0/
├─ server                 # Linux amd64 backend
├─ dist/                  # Production admin assets
├─ front-dist/            # Production user-client assets
├─ resource/              # Templates, probe, cluster runtime and digests
├─ deploy/
│  ├─ nginx/              # Admin and client proxy examples
│  └─ supervisor/         # Process configuration example
├─ docs/images/           # Screenshots used in these READMEs
├─ config.example.yaml    # Configuration without real credentials
├─ BUILD-INFO.txt          # Build origin and compatibility information
├─ SHA256SUMS             # Payload checksums
├─ LICENSE.txt            # Commercial software license (English)
├─ README.md
└─ README-en.md
```

### Installation requirements

| Item | Requirement |
| --- | --- |
| Platform server | Linux x86_64 / amd64, glibc ≥ 2.34; Ubuntu 24 and Rocky 10 meet this requirement |
| Database and cache | MySQL 8 and Redis, with connection credentials ready |
| Web and process management | Nginx and Supervisor |
| Network | Access to the licensing service, configured AI providers and package sources needed by cluster nodes |
| User files | UID / GID resolution and access to user directories on the platform server; directory services and shared storage for multi-host installations |
| Cluster nodes | Automated deployment supports Ubuntu 24.*, Rocky 8 and Rocky 10 |

**Rocky 8 is supported as a cluster node, but cannot run the backend binary in this package.** Its glibc 2.28 is below the required version. Use a compatible backend binary rather than upgrading the system glibc.

This binary uses CGO for system NSS / LDAP user lookup. Go and Node.js are not needed at runtime. Install MySQL, Redis, Nginx and Supervisor separately.

## Platform deployment

Examples use `/www/wwwroot/hpc_manager_server`, HTTP port `80` for administration, HTTP port `5174` for the client, and backend port `8888`. If you change the directory, update Supervisor's working directory, command and log path, and both Nginx roots.

### Upload and verify

Upload all contents of `v1.0.0/` to an empty directory at `/www/wwwroot/hpc_manager_server/`, keeping the folder structure. The `server` executable is ready to use; no extraction is needed.

```bash
cd /www/wwwroot/hpc_manager_server
sha256sum -c SHA256SUMS
sudo chmod +x server resource/probe/hpc-node-probe-linux-amd64 \
  resource/cluster-runtime/hpc-cluster-runtime-linux-amd64
sudo cp config.example.yaml config.yaml
sudo chmod 600 config.yaml
```

For an existing installation, follow the maintenance section instead of overwriting configuration or runtime data.

### Edit the configuration

Edit the corresponding settings in `config.yaml` and retain the other fields.

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
  password: "REPLACE_WITH_REDIS_PASSWORD"
  db: 0

front:
  enabled: true
  jwt-signing-key: "REPLACE_WITH_INDEPENDENT_BASE64_SECRET"
  public-origin: "http://YOUR_SERVER_IP:5174"
  allowed-origins: []
```

Run `openssl rand -base64 32` separately for each secret:

| Setting | Purpose |
| --- | --- |
| `jwt.signing-key` | Administrator token signing; replace the example default |
| `front.jwt-signing-key` | Client token signing; Base64 encoding of at least 32 random bytes |
| `ai-helper.master-key` | AI provider credential encryption; Base64 encoding of 32 random bytes, required before configuring AI |

Keep generated secrets stable and private. In particular, changing an existing `ai-helper.master-key` prevents decryption of stored provider credentials.

`use-cron` controls business scheduled tasks. Check the required job synchronization and billing schedules before going live. The three-hour licensing refresh runs independently. `system.env: public` also hides some platform-setting tabs; it is not merely a generic production-mode switch.

For a fresh installation, leave the example platform database connection empty until the initialization wizard. Prepare a running MySQL instance and an account able to initialize the target database. **The platform database and Slurm accounting database serve different purposes**; the accounting connection is entered separately when deploying Master components.

### Manage the backend with Supervisor

Use the [Supervisor example](deploy/supervisor/hpc-manager.conf). Place it in the include directory configured by your Supervisor installation, commonly `/etc/supervisor/conf.d/` on Ubuntu or `/etc/supervisord.d/` on Rocky. Verify the actual include pattern.

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

This example runs as root for local cluster administration, system-user switching and filesystem permission operations. User file operations still apply the appropriate business-user permissions. A different service account requires corresponding permissions and validation.

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start hpc_manager
sudo supervisorctl status hpc_manager
sudo supervisorctl tail hpc_manager
```

After a successful initial manual start, set `autostart=true`, reload the process configuration and ensure Supervisor itself starts at boot. Restart after backend configuration changes using `supervisorctl restart hpc_manager`. Do not also launch a second `server` manually.

### Nginx SPA fallback rules

Set the administration site's root to `dist/` and the client site's root to `front-dist/`. Add the following to each site's `server` block (the “URL rewrite / pseudo-static” settings in BaoTa):

```nginx
location / {
    try_files $uri $uri/ /index.html;
}

location ^~ /assets/ {
    try_files $uri =404;
}
```

Page routes fall back to `index.html`; missing static assets return 404. Replace any existing `location /` block rather than adding a duplicate.

Configure ports, domains, HTTPS and reverse proxies as usual. Complete examples: [administration](deploy/nginx/hpc-admin-http.conf) and [client](deploy/nginx/hpc-front-http.conf), with their [administration rules](deploy/nginx/hpc-admin-rules.inc) and [client rules](deploy/nginx/hpc-front-rules.inc). Strip `/api/` when forwarding admin requests; preserve the full `/client-api/` path for client requests. If the installation directory changes, update both `root` and `include` paths in the examples.

The supplied client is deployed at the root of a separate site. Run `nginx -t` and reload Nginx only after the check succeeds.

### Complete initialization

1. Open `/#/init` on the administration site.
2. Enter the merchant license code and select “Validate and save”; proceed to the next step only after validation succeeds.
3. Set your own `admin` password. Select MySQL, enter the database host, port, database name and credentials, then initialize.
4. Sign in and review merchant, tier, expiry and node allowance on “Current License”.
5. Add nodes and configure cluster services. Create a user, assign resource permissions, then test file access and job submission.

Do not initialize an existing database again. Follow the version-specific upgrade instructions for existing installations.

## Client allowed-origin configuration

The client “allowed domain” means the **browser entry point permitted to access the user client**. It is configured in the backend's `front` section. It is separate from the merchant licensing-service domain and the VPN connection address.

| Setting | Meaning |
| --- | --- |
| `front.public-origin` | Canonical client origin including scheme, domain/IP and non-default port, such as `https://client.example.com` or `http://192.168.10.20:5174` |
| `front.allowed-origins` | Additional Origins permitted by the ordinary client HTTP middleware; not complete alternate sites for every signed request and WebSocket |
| `system.trusted-proxies` | IP addresses of proxies directly connecting to Go; use `127.0.0.1` for local Nginx in these examples, not browser domains |

Use one canonical client entry point:

```yaml
front:
  public-origin: "https://client.example.com"
  allowed-origins: []
```

Retain the other `front` settings. **Do not include `/#/`, page paths, query strings or wildcards.** Use browser-Origin syntax without a trailing slash. HTTP and HTTPS, different ports, and an IP versus a hostname are distinct origins.

In this version, request signatures bind to `public-origin`; terminal and GUI WebSockets also require that exact origin. Adding another value to `allowed-origins` alone does not make every client feature usable through that address. Redirect alternate domains to the canonical entry point.

When changing the domain, update DNS, Nginx `server_name` / HTTPS certificates and `front.public-origin`, restart the backend, then sign in again through the canonical address. With the default same-origin `/client-api` setup, changing only the hostname does not require a frontend rebuild.

## Cluster configuration and component deployment

**Starting the platform does not install the cluster components.** Add nodes and SSH credentials in “Server Nodes”, then open each node's “Service Management → Cluster Base Components”.

| Role | Main responsibilities |
| --- | --- |
| Master | Runs on the same server as the platform backend; directory service, SSSD, MUNGE, Slurm controller and accounting service connected to an existing accounting database |
| Storage | XFS user quotas, NFS and directory identity resolution; also establishes Master's shared-directory access |
| Login | Directory authentication, shared-directory access, Slurm client, SSH / PAM login and per-user OpenVPN integration |
| Compute | Directory authentication, shared-directory access, MUNGE and slurmd; CPU / NVIDIA GPU resources configured from hardware and driver detection |

Deployment order is **Master → Storage → Login / Compute**. Login and Compute are not prerequisites for one another. Roles may share a host; same-host storage uses local paths according to the deployment logic. Publish a reachable private address for Master, not `127.0.0.1` to remote nodes.

On each node's service page, check the environment, enter and validate the configuration, then confirm deployment. The platform checks the installed services and saves their settings. Follow progress and errors in the task center.

**Storage and uninstall**

- Existing XFS directories must have user quotas enabled. Verify the selected device before formatting; formatting cannot be undone.
- Uninstall removes or restores changes made during deployment. Shared components still used by another role remain installed.
- Storage uninstall keeps user files; Slurm uninstall keeps accounting database tables.
- Uninstall a node's deployed services before deleting its record.

**Existing clusters**

Enter LDAP, Slurm, storage and Login connection details in the platform settings. Adding a node also requires configuring its services. Manual OpenVPN connection requires support for the platform's personal-certificate management; shared-certificate instances cannot be used directly.

## Software licensing

This is commercial software. The runtime package is publicly available for download, but use requires a valid license. See [LICENSE.txt](LICENSE.txt) for the terms.

### View or replace a license

“Current License” displays merchant, tier, tier details, service description, license code, expiry, remaining time, node allowance, IP scope and verification timestamps. All administrator roles may view it; changing the code requires separate API permission. The displayed licensor is **上海凇云科技有限公司** (Shanghai SongCloud Technology Co., Ltd.).

Licenses support an expiry date or unlimited validity, a node cap or unlimited nodes, and optional binding to multiple IP addresses. Actual entitlements follow the merchant's license information and delivery agreement.

### License verification

| Item | Behavior |
| --- | --- |
| Initial setup | Validate the license code before entering database settings |
| Automatic refresh | Every three hours, on service startup and when saving a license code |
| Expiry and changes | Expiry is checked locally; tier, IP and code changes apply at the next online verification |
| Invalid license or connection failure | Expired or invalid codes, or failure to reach the licensing service during verification, suspend platform business access |
| Restoring access | Administrator login, license viewing and permitted code changes remain available; verify again with a valid code or after restoring connectivity |
| Submitted jobs | Jobs already submitted to Slurm are not automatically cancelled |

License responses are encrypted and checked for authenticity, the matching request and their issue time. They must arrive within one minute of issue; software validity follows the license expiry date.

License information is saved in `license.json` beside `config.yaml`. Keep it private and backed up. Service startup still requires online verification.

### Node counts and IP binding

The device allowance counts **non-deleted platform node records**. Master, Storage, Login and Compute records sharing one IP each count separately. Reducing the allowance retains existing nodes; the platform reports excess usage and blocks additions instead of deleting devices.

With IP restrictions enabled, the licensing service checks the request source against the merchant's bound IPs. Normally this is the platform's public outbound IP, not the user's computer, VPN address pool or client domain. Confirm the actual egress address when using a proxy or NAT; a self-declared IP does not replace server-side verification.

## Maintenance and troubleshooting

### Upgrades and backups

Before upgrading, back up the platform database, `config.yaml`, `license.json`, uploads and relevant cluster configuration. Back up LDAP, certificate materials, shared user data and the Slurm accounting database separately.

Review version and migration requirements, stop the service, replace the appropriate backend / static assets / node tools, preserve configuration and data, apply reviewed migrations and verify after startup. Do not overwrite real configuration with `config.example.yaml` or discard existing secrets. Replacing a binary alone is not necessarily a valid rollback after database migration.

### Common issues

| Symptom | Check first |
| --- | --- |
| `GLIBC_2.34 not found` | Host libc does not meet this package's baseline; use a compatible build rather than replacing system glibc |
| Pages load but APIs return 404 | Nginx roots, stripping admin `/api/`, and preserving client `/client-api/` |
| Client login, signatures or terminal rejected | `front.enabled`, Redis, secrets, browser Origin, proxy Host, clock and WebSocket forwarding |
| Licensing service unreachable | Backend DNS, outbound HTTPS, certificate trust, proxy and service availability; an internal DNS zone may override public resolution |
| AI credentials cannot be saved/decrypted | Correct `ai-helper.master-key` format and whether an existing key was replaced |
| File manager or terminal fails | UID / GID resolution, shared paths, permissions, Login access; `required` isolation also needs the isolation tool and OS capabilities |
| Jobs remain queued or update slowly | Actual Slurm pending reason, node state, user permissions/quotas and platform synchronization settings |

After installation, test administrator and client login, license verification, file access, terminal connections and a Slurm job. Test VPN, GUI, GPU, billing and AI separately if enabled.

## Third-party components and delivery scope

The platform is based on gin-vue-admin and other open-source components. The gin-vue-admin BSL 1.1 terms and copyright / attribution requirements stated in the source-root README remain applicable. Merchant platform licensing does not replace third-party licenses or grant additional rights to computing applications.

Bundled browser-component notices are in the [noVNC documentation](front-dist/licenses/novnc-1.6.0/README.txt) and [Xpra upstream information](front-dist/vendor/xpra/UPSTREAM.md); their license files remain in the corresponding directories. Slurm, OpenVPN, databases, AI services and computing applications have their own licenses and terms.

This runtime package does not contain real database data, administrator credentials, API keys, merchant license codes, personal VPN certificates or the complete source repository. AI requires provider accounts and configured charging rules. Third-party computing applications and their licenses must be supplied separately. Delivery scope, deployment assistance and support duration are governed by the specific agreement.

See [BUILD-INFO.txt](BUILD-INFO.txt) for version and runtime information.
