# For Docker Desktop, check Docker application status
# For Minikube
minikube status

# First apply only namespace, configmaps, secrets, and PVCs
kubectl apply -f namespace.yaml
kubectl apply -f configmaps.yaml
kubectl apply -f secrets.yaml
kubectl apply -f storage.yaml
kubectl apply -f redis-config.yaml
kubectl apply -f rabbitmq-plugins.yaml

kubectl apply -k .


kubectl apply -f /Users/josuedanielbust/universidad/arch-soft/DocuCol/services/kubernetes/rabbitmq.yaml
kubectl apply -k /Users/josuedanielbust/universidad/arch-soft/DocuCol/services/kubernetes/