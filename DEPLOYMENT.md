# Kubernetes Deployment Guide

## Resource Requirements

### Application Pod (coop-web)
- **CPU Request**: 100m (0.1 cores)
- **CPU Limit**: 500m (0.5 cores)
- **Memory Request**: 128Mi
- **Memory Limit**: 256Mi

### Database Pod (MySQL)
- **CPU Request**: 250m
- **CPU Limit**: 500m
- **Memory Request**: 256Mi
- **Memory Limit**: 512Mi

### Total Cluster Requirements (for 3 replicas + 1 MySQL)
- **Min CPU**: 550m
- **Max CPU**: 2500m
- **Min Memory**: 640Mi
- **Max Memory**: 1.28Gi

## Deployment Architecture
┌─────────────────────────────────────┐
│     Kubernetes Cluster              │
├─────────────────────────────────────┤
│ Namespace: coop-app                 │
├──────────────────┬──────────────────┤
│   coop-web       │      MySQL       │
│  (3 replicas)    │   (1 replica)    │
│  - LoadBalancer  │   - PVC (10Gi)   │
│  - HPA (3-10)    │   - ConfigMap    │
└──────────────────┴──────────────────┘

## Rolling Update Strategy

- **Max Surge**: 1 pod (allows 4 running during update)
- **Max Unavailable**: 1 pod (keeps 2 available)
- **Graceful Shutdown**: 15 seconds pre-stop hook

## Deployment Steps

### 1. Prerequisites
# Install kubectl
kubectl version --client

# Configure kubeconfig
export KUBECONFIG=/path/to/kubeconfig.yaml

# Verify cluster access
kubectl cluster-info
kubectl get nodes

### 2. Create Docker image

# Build locally
docker build -t niyizigihe/coop-web:v1.0.0 .

# Push to registry
docker push niyizigihe/coop-web:v1.0.0

### 3. Deploy to Kubernetes
# Create namespace
kubectl create namespace coop-app

# Deploy MySQL
kubectl apply -f k8s/mysql-secret.yaml
kubectl apply -f k8s/mysql-configmap.yaml
kubectl apply -f k8s/mysql-pvc.yaml
kubectl apply -f k8s/mysql-deployment.yaml
kubectl apply -f k8s/mysql-service.yaml

# Wait for MySQL to be ready
kubectl wait --for=condition=ready pod \
  -l app=mysql -n coop-app --timeout=300s

# Deploy application
kubectl apply -f k8s/coop-web-configmap.yaml
kubectl apply -f k8s/coop-web-secret.yaml
kubectl apply -f k8s/coop-web-rbac.yaml
kubectl apply -f k8s/coop-web-deployment.yaml
kubectl apply -f k8s/coop-web-service.yaml
kubectl apply -f k8s/coop-web-hpa.yaml

### 4. Verify deployment
# Check pods
kubectl get pods -n coop-app

# Check services
kubectl get svc -n coop-app

# Check logs
kubectl logs -f deployment/coop-web -n coop-app

# Port forward (local testing)
kubectl port-forward svc/coop-web 3000:80 -n coop-app

## Rolling Updates

### Update image version
kubectl set image deployment/coop-web \
  coop-web=your-username/coop-web:v1.1.0 \
  -n coop-app

### Monitor rollout
# Watch progress
kubectl rollout status deployment/coop-web -n coop-app

# View rollout history
kubectl rollout history deployment/coop-web -n coop-app

# Rollback if needed
kubectl rollout undo deployment/coop-web -n coop-app

## Horizontal Pod Autoscaling

### View HPA statu
kubectl get hpa -n coop-app
kubectl describe hpa coop-web-hpa -n coop-app

### Manual scaling
kubectl scale deployment coop-web --replicas=5 -n coop-app

## Monitoring & Logs

# View logs from all pods
kubectl logs -f -l app=coop-web -n coop-app

# View specific pod logs
kubectl logs <pod-name> -n coop-app

# Execute command in pod
kubectl exec -it <pod-name> -n coop-app -- /bin/sh

# Get resource usage
kubectl top pods -n coop-app
kubectl top nodes

## Cleanup
# Delete deployment
kubectl delete deployment coop-web -n coop-app

# Delete namespace
kubectl delete namespace coop-app

# Delete all resources
kubectl delete -f k8s/ -n coop-app

## Troubleshooting

### Pod not starting
kubectl describe pod <pod-name> -n coop-app
kubectl logs <pod-name> -n coop-app

### Database connection issue
# Test MySQL connectivity
kubectl run -it --rm debug --image=mysql:8.0 --restart=Never -- \
  mysql -h mysql -u root -proot -e "SELECT 1;"

### Check resource limits
kubectl top pod <pod-name> -n coop-app
