# Deployment Guide - Phase 6

## Architecture Overview

```
┌─────────────────────────────────────────┐
│      Kubernetes Cluster (Minikube)      │
├─────────────────────────────────────────┤
│ Namespace: coop-app                     │
├──────────────────────┬──────────────────┤
│   coop-web           │     MySQL        │
│   (3 replicas)       │  (1 replica)     │
│   - HPA (3-10)       │  - PVC (10Gi)    │
│   - Rolling Updates  │  - Health checks │
│   - Resource limits  │  - ConfigMap     │
└──────────────────────┴──────────────────┘
```

## Resource Requirements

### Per Pod Calculations

**Application (coop-web)**
- CPU Request: 100m (0.1 cores)
- CPU Limit: 500m (0.5 cores)
- Memory Request: 128Mi
- Memory Limit: 256Mi

**Database (MySQL)**
- CPU Request: 250m (0.25 cores)
- CPU Limit: 500m (0.5 cores)
- Memory Request: 256Mi
- Memory Limit: 512Mi

### Total Cluster Requirements

**For 3 replicas + 1 MySQL:**
- Minimum CPU: 550m (300m app + 250m MySQL)
- Maximum CPU: 2500m (1500m app + 500m MySQL)
- Minimum Memory: 640Mi (384Mi app + 256Mi MySQL)
- Maximum Memory: 1.28Gi (768Mi app + 512Mi MySQL)

**Recommended Minikube Spec:**
```bash
minikube start --cpus=4 --memory=4096 --driver=docker
```

## Deployment Strategies

### 1. Rolling Updates
- **Max Surge**: 1 pod (allows 4 pods during update)
- **Max Unavailable**: 1 pod (keeps 2 available)
- **Zero Downtime**: Yes ✓
- **Time**: ~2-3 minutes

### 2. Health Checks
- **Liveness Probe**: Restarts unhealthy pods
- **Readiness Probe**: Removes failing pods from traffic
- **Grace Period**: 15 seconds pre-stop hook

### 3. Auto-scaling
- **Min Replicas**: 3
- **Max Replicas**: 10
- **CPU Threshold**: 70%
- **Memory Threshold**: 80%

## Step 1: Local Minikube Setup

```bash
# Start Minikube
minikube start --cpus=4 --memory=4096 --driver=docker

# Verify status
minikube status
kubectl cluster-info

# Set Docker environment
eval $(minikube docker-env)
```

## Step 2: Build and Push Docker Image

```bash
# Build image (stored in Minikube)
docker build -t coop-web:latest .

# For production, tag and push to Docker Hub
docker tag coop-web:latest your-username/coop-web:v1.0.0
docker push your-username/coop-web:v1.0.0
```

## Step 3: Deploy to Kubernetes

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Deploy MySQL
kubectl apply -f k8s/mysql-secret.yaml
kubectl apply -f k8s/mysql-configmap.yaml
kubectl apply -f k8s/mysql-pvc.yaml
kubectl apply -f k8s/mysql-deployment.yaml
kubectl apply -f k8s/mysql-service.yaml

# Wait for MySQL
kubectl wait --for=condition=ready pod -l app=mysql -n coop-app --timeout=300s

# Deploy application
kubectl apply -f k8s/coop-web-configmap.yaml
kubectl apply -f k8s/coop-web-secret.yaml
kubectl apply -f k8s/coop-web-rbac.yaml
kubectl apply -f k8s/coop-web-deployment.yaml
kubectl apply -f k8s/coop-web-service.yaml
kubectl apply -f k8s/coop-web-hpa.yaml

# Verify
kubectl get deployments -n coop-app
kubectl get pods -n coop-app
kubectl get svc -n coop-app
```

## Step 4: Access the Application

```bash
# Get service URL
minikube service coop-web -n coop-app

# Or port forward
kubectl port-forward svc/coop-web 3000:80 -n coop-app

# Then visit: http://localhost:3000
```

## Rolling Update Process

### Update to New Version

```bash
# Update the deployment with new image
kubectl set image deployment/coop-web \
  coop-web=your-username/coop-web:v1.1.0 \
  -n coop-app --record

# Monitor the rollout
kubectl rollout status deployment/coop-web -n coop-app

# View rollout history
kubectl rollout history deployment/coop-web -n coop-app
```

### What Happens During Update

1. **New pod starts** with new image
2. **Health checks pass** on new pod
3. **Old pod receives traffic removal** (pre-stop hook waits 15s)
4. **Old pod terminates gracefully**
5. **Repeat for remaining pods**

### Rollback if Issues

```bash
# Rollback to previous version
kubectl rollout undo deployment/coop-web -n coop-app

# Rollback to specific revision
kubectl rollout undo deployment/coop-web --to-revision=2 -n coop-app
```

## Monitoring and Logs

```bash
# View logs from all pods
kubectl logs -f -l app=coop-web -n coop-app

# View specific pod logs
kubectl logs <pod-name> -n coop-app

# Check HPA status
kubectl get hpa -n coop-app
kubectl describe hpa coop-web-hpa -n coop-app

# Resource usage
kubectl top pods -n coop-app
kubectl top nodes

# Get detailed pod info
kubectl describe pod <pod-name> -n coop-app
```

## Troubleshooting

### Pod not starting
```bash
kubectl describe pod <pod-name> -n coop-app
kubectl logs <pod-name> -n coop-app
```

### Database connection issues
```bash
# Test MySQL from a pod
kubectl run -it --rm debug --image=mysql:8.0 --restart=Never -- \
  mysql -h mysql -u root -proot -e "SELECT 1;"
```

### Check resource limits
```bash
kubectl top pod -n coop-app
```

### Service not accessible
```bash
kubectl get svc -n coop-app
kubectl describe svc coop-web -n coop-app
```

## GitHub Actions Deployment

To enable automatic deployment:

1. **Add secrets to GitHub:**
   - `DOCKER_USERNAME`: Your Docker Hub username
   - `DOCKER_PASSWORD`: Your Docker Hub token
   - `KUBE_CONFIG`: Base64-encoded kubeconfig

2. **Encode kubeconfig:**
```bash
cat ~/.kube/config | base64 -w 0
```

3. **Push a version tag:**
```bash
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

This triggers automatic deployment! ✅

## Cleanup

```bash
# Stop Minikube (keeps data)
minikube stop

# Delete everything
kubectl delete namespace coop-app

# Delete Minikube cluster
minikube delete
```

## Performance Metrics

**Expected Performance:**
- App startup: ~5 seconds
- Readiness probe: ~10 seconds
- Rolling update: ~2-3 minutes
- HPA scale-up: ~30 seconds
- Request latency: <100ms (healthy state)

**Resource Usage:**
- Idle CPU: <50m per pod
- Idle Memory: ~50Mi per pod
- Peak CPU: ~200m under load
- Peak Memory: ~150Mi under load
