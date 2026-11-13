# SpendWise Minikube Setup (Windows)

## Prerequisites

- Docker Desktop installed and running.
- Minikube installed.
- `kubectl` installed and available on `PATH`.

Run the following commands in PowerShell from the `SpendWise` directory.

## Start Minikube

```powershell
minikube start --driver=docker
minikube status
kubectl get nodes
```

Confirm Minikube reports `Running` and the node reports `Ready`.

## Build and verify local images

```powershell
minikube image build --tag spendwise-backend --file backend/Dockerfile backend
minikube image build --tag spendwise-frontend --file frontend/Dockerfile frontend
minikube image ls
```

The Dockerfile paths and build contexts are relative to the `SpendWise` directory.

These images are available only in the local Minikube image store. They are not automatically uploaded to Docker Hub or shared with other computers.

## Stop Minikube

```powershell
minikube stop
```

Kubernetes deployment and service manifests are managed by my teammate and are outside this Minikube integration guide.