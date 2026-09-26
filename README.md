# 设备计量校准排期 API 服务

面向实验室和工厂的计量设备校准周期管理 API，覆盖设备台账、校准计划、证书、超期预警和外部机构管理。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

后端健康检查：<http://localhost:21116/health>

后端健康检查：<http://localhost:21116/health>


## 本地开发方式


- 后端：进入 `backend` 后按技术栈运行开发命令，接口统一挂在 `/api`。


## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | - |
| 后端 | NestJS + TypeScript + TypeORM |
| 数据库 | PostgreSQL 15 |
| 部署 | Docker Compose |

## 项目目录结构

```text

backend/src/routes, controllers, services, models, repositories, middlewares, constants, constructors, utils, types, config
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `calibration-api`

- `BACKEND_PORT`: 后端端口，默认 `21116`
- `DB_PORT`: 数据库宿主机端口
- `DB_USER/DB_PASSWORD/DB_NAME`: 本地数据库凭据

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: calibration-api`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-calibration-api}` 前缀。
- 数据库使用命名卷，避免绑定中文路径。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- DeviceCalibrationStatus: constants/DeviceCalibrationStatus、types/DeviceCalibrationStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- PlanStatus: constants/PlanStatus、types/PlanStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- CertificateResult: constants/CertificateResult、types/CertificateResult、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- CertificateStatus: constants/CertificateStatus、types/CertificateStatus、models/CalibrationCertificate、constructors/CalibrationCertificateDtoFactory、services/CalibrationCertificateService（替换登记/撤销判定）、utils/formatters（`formatCertificateStatus` 状态文案）、validators、种子数据均有引用。

## 证书替换接口

当校准结论填错或机构撤回原证书时使用，不改变设备按证书判定有效期的既有规则：

- `POST /api/calibration-certificate/{id}/replace`（角色：admin / quality_manager / calibrator）
- 请求体：`{ certificate_no, result_status, valid_until, file_path, issued_by, device_id?, plan_id? }`（`device_id` 缺省取原证书设备；`plan_id` 缺省沿用原证书计划）
- 登记条件（任一不满足则 4xx，原证书与设备状态不变）：
  1. 原证书存在且状态为 `ACTIVE`；
  2. 新证书与原证书属于同一台设备；
  3. 新证书 `valid_until` 严格晚于原证书 `valid_until`。
- 成功后：登记新证书（`ACTIVE`）→ 原证书标记 `REVOKED`（历史保留不删除）→ 设备 `valid_until`/`status` 采用新证书日期；校准计划与历史证书均保留。
- 并发：同一原证书并发替换仅一次成功，其余返回 `409 CERTIFICATE_REPLACE_CONFLICT` / `CERTIFICATE_NOT_ACTIVE`。
- 响应：`{ original_certificate, replacement_certificate, device }`；原 `GET /api/calibration-certificate/` 列表行为不变。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
