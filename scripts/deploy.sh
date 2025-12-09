#!/bin/bash

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting Kubernetes Deployment${NC}"

# Check if Minikube is running
if ! minikube status &> /dev/null; then
    echo -e "${RED}❌ Minikube not running${NC}"
    echo "Starting Minikube..."
    minikube start --cpus=4 --memory=4096 --driver=docker
fi

echo -e "${BLUE}🐳 Setting up Docker environment${NC}"
eval $(minikube docker-env)

echo -e "${BLUE}🔨 Building Docker image${NC}"
docker build -t coop-web:latest .

echo -e "${BLUE}☸️ Deploying to Kubernetes${NC}"

# Apply manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/mysql-secret.yaml
kubectl apply -f k8s/mysql-configmap.yaml
kubectl apply -f k8s/mysql-pvc.yaml
kubectl apply -f k8s/mysql-deployment.yaml
kubectl apply -f k8s/mysql-service.yaml

echo -e "${BLUE}⏳ Waiting for MySQL...${NC}"
kubectl wait --for=condition=ready pod -l app=mysql -n coop-app --timeout=300s

kubectl apply -f k8s/coop-web-configmap.yaml
kubectl apply -f k8s/coop-web-secret.yaml
kubectl apply -f k8s/coop-web-rbac.yaml
kubectl apply -f k8s/coop-web-deployment.yaml
kubectl apply -f k8s/coop-web-service.yaml
kubectl apply -f k8s/coop-web-hpa.yaml

echo -e "${BLUE}⏳ Waiting for application...${NC}"
kubectl wait --for=condition=ready pod -l app=coop-web -n coop-app --timeout=300s

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo -e "${BLUE}📊 Deployment Status:${NC}"
kubectl get deployments -n coop-app
echo ""
kubectl get pods -n coop-app
echo ""
kubectl get svc -n coop-app

echo ""
echo -e "${BLUE}🌐 Access your application:${NC}"
minikube service coop-web -n coop-app --url
