# Phase 7: Monitoring & Logging

## Overview

This setup includes:
- **Prometheus**: Metrics collection & alerting
- **Grafana**: Metrics visualization
- **Elasticsearch**: Log storage
- **Kibana**: Log visualization
- **Fluent Bit**: Log shipping
- **AlertManager**: Alert routing

## SLOs & Error Budgets

### Service Level Objective (SLO): 99.5% Uptime

**Monthly Error Budget:**
- 30 days = 43,200 minutes
- 99.5% uptime = 0.5% downtime allowed
- Monthly budget = 216 minutes (~3.6 hours)

**Alert Thresholds:**
- Error Rate > 5% for 5 minutes → Critical
- P99 Latency > 500ms for 5 minutes → Warning
- CPU Usage > 80% for 5 minutes → Warning
- Memory Usage > 80% for 5 minutes → Warning

## Deployment

### 1. Deploy Monitoring Stack

```bash
# Deploy Prometheus
kubectl apply -f k8s/prometheus-configmap.yaml
kubectl apply -f k8s/prometheus-rules.yaml
kubectl apply -f k8s/prometheus-deployment.yaml

# Deploy AlertManager
kubectl apply -f k8s/alertmanager-config.yaml
kubectl apply -f k8s/alertmanager-deployment.yaml

# Deploy Grafana
kubectl apply -f k8s/grafana-deployment.yaml
```

### 2. Deploy Logging Stack

```bash
# Deploy Elasticsearch
kubectl apply -f k8s/elasticsearch-deployment.yaml

# Deploy Fluent Bit
kubectl apply -f k8s/fluent-bit-config.yaml
kubectl apply -f k8s/fluent-bit-daemonset.yaml

# Deploy Kibana
kubectl apply -f k8s/kibana-deployment.yaml
```

## Access Dashboards

### Prometheus
```bash
kubectl port-forward -n coop-app svc/prometheus 9090:9090
# Visit: http://localhost:9090
```

### Grafana
```bash
kubectl port-forward -n coop-app svc/grafana 3000:3000
# Visit: http://localhost:3000
# Login: admin / admin123
# Add Prometheus datasource: http://prometheus:9090
```

### Kibana
```bash
kubectl port-forward -n coop-app svc/kibana 5601:5601
# Visit: http://localhost:5601
```

## Key Metrics to Monitor

### Application Metrics
- `http_requests_total` - Request count by status
- `http_request_duration_seconds` - Request latency
- `db_query_duration_seconds` - Database query time
- `active_db_connections` - Active connections

### Kubernetes Metrics
- `kube_deployment_status_replicas_available` - Available replicas
- `kube_pod_container_status_restarts_total` - Pod restarts
- `container_memory_usage_bytes` - Memory usage
- `container_cpu_usage_seconds_total` - CPU usage

## Alert Rules Explained

### Error Budget Alert
Triggers when error rate > 5% for 5 minutes (consuming ~1.4 hours of monthly budget)

### Latency Alert
Triggers when P99 latency > 500ms (poor user experience threshold)

### Pod Restart Alert
Triggers when pods restart more than once in 15 minutes (indicates instability)

## Slack Integration

1. Create Slack webhook URL
2. Update in `alertmanager-config.yaml`
3. Alerts automatically sent to #alerts, #critical-alerts, #warnings

## Log Analysis

### Common Queries in Kibana

Find errors:
```json
{
  "query": {
    "match": {
      "log": "ERROR"
    }
  }
}
```

High latency requests:
```json
{
  "query": {
    "range": {
      "duration_ms": {
        "gte": 500
      }
    }
  }
}
```

## Retention Policies

- **Prometheus**: 30 days (TSDB retention)
- **Elasticsearch**: 30 days (via index templates)
- **Logs**: Automatically rotated by Fluent Bit

## Troubleshooting

### No metrics appearing
```bash
# Check if app metrics endpoint is working
kubectl port-forward -n coop-app svc/coop-web 3000:3000
curl http://localhost:3000/metrics
```

### Elasticsearch not storing logs
```bash
# Check Fluent Bit logs
kubectl logs -f daemonset/fluent-bit -n coop-app

# Check Elasticsearch health
kubectl port-forward -n coop-app svc/elasticsearch 9200:9200
curl http://localhost:9200/_cluster/health
```

### AlertManager not routing alerts
```bash
# Check AlertManager config
kubectl exec -it deployment/alertmanager -n coop-app -- cat /etc/alertmanager/alertmanager.yml
```
