# 设备计量校准排期 API 服务

面向实验室和工厂的计量设备校准周期管理 API，覆盖设备台账、校准计划、证书、超期预警和外部机构管理。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

后端健康检查：<http://localhost:21116/health>

后端健康检查：<http://localhost:21116/health>

### 证书替换接口

`POST /api/calibration-certificate/{id}/replace`

用于证书结论填错或机构撤回后的换证登记。规则：

- 原证书必须处于 `ACTIVE`（未撤销）状态；
- 新证书 `device_id` 必须与原证书设备一致；
- 新证书 `valid_until` 必须晚于原证书失效日；
- 登记成功后原证书标记为 `REVOKED`，设备 `valid_until` 采用新证书日期，校准计划与历史证书全部保留；
- 同一证书的并发替换只有一个请求成功，失败时原证书与设备状态不变；
- 响应包含 `old_certificate`、`new_certificate` 和设备当前状态；`GET /api/calibration-certificate` 列表继续可用。

```bash
curl -X POST http://localhost:21116/api/calibration-certificate/1/replace \
  -H 'Content-Type: application/json' \
  -d '{"device_id":1,"certificate_no":"CERT-2026-0009","result_status":"PASS","valid_until":"2027-06-30","file_path":"/files/cert-2026-0009.pdf","issued_by":"vendor name 1"}'
```

错误码：`CERT_NOT_FOUND`(404)、`CERT_NOT_REPLACEABLE`(409)、`CERT_REPLACE_CONFLICT`(409)、`CERT_DEVICE_MISMATCH`(400)、`CERT_VALID_UNTIL_NOT_LATER`(400)、`VALIDATION_FAILED`(400)。


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
- CertificateResult: constants/CertificateResult、types/CertificateResult、constructors、logTemplates、errorMessages、validators/certificateReplaceValidator、筛选器、展示组件/控制器均有引用。
- CertificateStatus（ACTIVE/REVOKED）: constants/CertificateStatus、models/CalibrationCertificate、seed、repositories/CalibrationCertificateRepository、services/CalibrationCertificateService、constructors/CalibrationCertificateDtoFactory、database/init.sql 均有引用。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
