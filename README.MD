# I. Local

1. minikube start
2. create statefulsets
   cd k8s/local/statefulsets
   kubectl create -f .

# II. Cloud

## Select project

gcloud projects list
gcloud config set project <project_id>

## Select context

gcloud container clusters get-credentials <cluster_name> --zone asia-southeast1-a
kubectl config get-contexts
kubectl config use-context <context_name>

## Init Project

```shell
# Add Ingress
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.0.0/deploy/static/provider/cloud/deploy.yaml
# Add Cert Manager
kubectl apply -f https://github.com/jetstack/cert-manager/releases/download/v1.5.3/cert-manager.yaml
kubectl apply -f k8s/dev/issuers/prod-issuer.yml
# Apply Statefulsets
cd k8s/dev/statefulsets
kubectl create -f .
```

## Then use Skaffold to deploy

```shell
skaffold dev -f skaffold-dev.yaml
```

## Expose database

kubectl get pods
kubectl expose pod chat-mongo-0 --port=27017 --type=LoadBalancer
kubectl get services
kubectl describe service chat-mongo-0
