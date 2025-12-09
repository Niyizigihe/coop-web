# Minikube Kubernetes Setup Guide

## Prerequisites

# Install Minikube
curl -LO https://github.com/kubernetes/minikube/releases/latest/download/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl


## Starting Minikube


# Start Minikube cluster
minikube start --cpus=4 --memory=4096 --driver=docker

# Verify cluster is running
kubectl cluster-info

# View Minikube dashboard
minikube dashboard


## Building Docker Image for Minikube


# Set Docker environment to use Minikube's Docker daemon
eval $(minikube docker-env)

# Build image (it will be stored in Minikube)
docker build -t coop-web:latest .

# Verify image exists in Minikube
docker images | grep coop-web


## Deploying to Minikube


# Create namespace
kubectl apply -f k8s/namespace.yaml

# Create secrets and config
kubectl apply -f k8s/mysql-secret.yaml
kubectl apply -f k8s/mysql-configmap.yaml
kubectl apply -f k8s/coop-web-config.yaml
kubectl apply -f k8s/coop-web-secret.yaml

# Deploy MySQL
kubectl apply -f k8s/mysql-deployment.yaml
kubectl apply -f k8s/mysql-service.yaml

# Wait for MySQL to be ready
kubectl wait --for=condition=ready pod -l app=mysql -n coop-app --timeout=300s

# Deploy application
kubectl apply -f k8s/coop-web-rbac.yaml
kubectl apply -f k8s/coop-web-deployment.yaml
kubectl apply -f k8s/coop-web-service.yaml

# Check deployment status
kubectl get deployments -n coop-app
kubectl get pods -n coop-app
kubectl get svc -n coop-app


## Accessing the Application


# Get the NodePort service URL
minikube service coop-web -n coop-app --url

# Or manually get NodePort
kubectl get svc coop-web -n coop-app -o jsonpath='{.spec.ports[0].nodePort}'

# Access application
minikube service coop-web -n coop-app


## Viewing Logs


# View pod logs
kubectl logs -f deployment/coop-web -n coop-app

# View MySQL logs
kubectl logs -f deployment/mysql -n coop-app

# Describe pod for troubleshooting
kubectl describe pod <pod-name> -n coop-app


## Executing Commands in Pods


# Get shell access to a pod
kubectl exec -it <pod-name> -n coop-app -- /bin/sh

# Run MySQL commands
kubectl exec -it <mysql-pod-name> -n coop-app -- mysql -u root -proot -e "SHOW DATABASES;"


## Useful Commands


# Stop Minikube (keeps data)
minikube stop

# Delete Minikube cluster
minikube delete

# SSH into Minikube node
minikube ssh

# Check resource usage
minikube status

# View cluster events
kubectl get events -n coop-app

# Port forward to local machine
kubectl port-forward -n coop-app svc/coop-web 3000:80

# Delete namespace (deletes all resources)
kubectl delete namespace coop-app


## Troubleshooting

### Image Pull Errors
Ensure you:
1. Set `eval $(minikube docker-env)` before building
2. Use `imagePullPolicy: Never` in deployment
3. Build image with same tag as in deployment spec

### DNS Issues

# Check CoreDNS
kubectl get pods -n kube-system | grep coredns

# Restart CoreDNS if needed
kubectl rollout restart deployment coredns -n kube-system


### Minikube Docker Context

# Check current context
docker context ls

# Switch to Minikube Docker
eval $(minikube docker-env)

# Switch back to host Docker
eval $(minikube docker-env --unset)


### Resource Issues
If Minikube runs out of resources:

# Increase Minikube resources
minikube stop
minikube delete
minikube start --cpus=6 --memory=8192


## Quick Deploy Script

Save as `deploy-minikube.sh`:


#!/bin/bash

set -e

echo "🔨 Setting up Minikube Docker environment..."
eval $(minikube docker-env)

echo "🐳 Building Docker image..."
docker build -t coop-web:latest .

echo "☸️ Deploying to Kubernetes..."
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/mysql-secret.yaml
kubectl apply -f k8s/mysql-configmap.yaml
kubectl apply -f k8s/coop-web-config.yaml
kubectl apply -f k8s/coop-web-secret.yaml
kubectl apply -f k8s/mysql-deployment.yaml
kubectl apply -f k8s/mysql-service.yaml
kubectl apply -f k8s/coop-web-rbac.yaml
kubectl apply -f k8s/coop-web-deployment.yaml
kubectl apply -f k8s/coop-web-service.yaml

echo "⏳ Waiting for MySQL..."
kubectl wait --for=condition=ready pod -l app=mysql -n coop-app --timeout=300s

echo "⏳ Waiting for application..."
kubectl wait --for=condition=ready pod -l app=coop-web -n coop-app --timeout=300s

echo "✅ Deployment complete!"
echo ""
echo "🌐 Access your application:"
minikube service coop-web -n coop-app --url


Run with: `bash deploy-minikube.sh`
