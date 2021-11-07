# I. Local

##

```shell
minikube start
skaffold dev
```

## create statefulsets

```shell
cd k8s/local/statefulsets
kubectl create -f .
```

# II. Cloud

## Select project

```shell
gcloud projects list
gcloud config set project <project_id>
```

## Select context

```shell
gcloud container clusters get-credentials <cluster_name> --zone asia-southeast1-a
kubectl config get-contexts
kubectl config use-context <context_name>
```

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

## Expose loadblancer database service

```shell
kubectl get pods
kubectl expose pod chat-mongo-0 --port=27017 --type=LoadBalancer
kubectl get services
kubectl describe service chat-mongo-0
```

## Delete loadblancer database service

```shell
kubectl get services
kubectl delete service chat-mongo-0
```

# prometheus

docker service create --replicas 1 --name my-prometheus \
 --mount type=bind,source=/tmp/prometheus.yml,destination=/etc/prometheus/prometheus.yml \
 --publish published=9090,target=9090,protocol=tcp \
 prom/prometheus
