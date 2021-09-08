# Init Project

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

# Then use Skaffold to deploy
```shell
skaffold dev -f skaffold-dev.yml
```

