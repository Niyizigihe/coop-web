#!/bin/bash

echo "=== Phase 6 Deployment Verification ==="
echo ""

echo "1. Checking Minikube Status..."
minikube status
echo ""

echo "2. Checking Pods..."
kubectl get pods -n coop-app
echo ""

echo "3. Checking Services..."
kubectl get svc -n coop-app
echo ""

echo "4. Checking Deployments..."
kubectl get deployments -n coop-app
echo ""

echo "5. Checking HPA..."
kubectl get hpa -n coop-app
echo ""

echo "6. Checking Resource Usage..."
kubectl top pods -n coop-app
echo ""

echo "7. Testing API..."
COOP_WEB_POD=$(kubectl get pods -n coop-app -l app=coop-web -o jsonpath='{.items[0].metadata.name}')
kubectl port-forward -n coop-app svc/coop-web 3000:80 &
sleep 2
curl -s http://localhost:3000/hello | jq .
echo ""

echo "8. Checking Database..."
MYSQL_POD=$(kubectl get pods -n coop-app -l app=mysql -o jsonpath='{.items[0].metadata.name}')
kubectl exec -it $MYSQL_POD -n coop-app -- mysql -u root -proot cooperative_db -e "SELECT COUNT(*) as member_count FROM members;"
echo ""

echo "✅ Phase 6 Verification Complete!"