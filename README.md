# Microservices CI/CD Platform: Terraform + Jenkins + Docker + ECR + Kubernetes (k3s) + Helm + Monitoring

A production-style pipeline: Terraform provisions AWS infrastructure → Jenkins builds and tests two
microservices → Docker images are pushed to Amazon ECR → Helm deploys them to a k3s Kubernetes
cluster with autoscaling → Prometheus/Grafana monitor it all.

Everything runs on a single AWS Free Tier EC2 instance.

---

## Architecture

```
                        ┌─────────────────────────────────────┐
                        │         EC2 (Free Tier)              │
                        │                                       │
 GitHub push ──webhook──▶  Jenkins                              │
                        │     │                                 │
                        │     ├─▶ Test backend (npm test)       │
                        │     ├─▶ Build & push images ──────────┼──▶ Amazon ECR
                        │     └─▶ helm upgrade --install         │
                        │              │                        │
                        │              ▼                        │
                        │   k3s cluster (frontend, backend,     │
                        │   redis, HPA, Traefik ingress)        │
                        │              │                        │
                        │              ▼                        │
                        │   Prometheus + Grafana                │
                        └─────────────────────────────────────┘
```

**Why these specific tool choices (good to know for interviews):**
- **Terraform** — infrastructure is defined as code, reproducible, and reviewable, instead of clicking through the AWS console
- **k3s instead of Minikube** — Minikube is a local development tool; k3s is a certified, lightweight Kubernetes distribution companies actually run in production and at the edge
- **ECR instead of Docker Hub** — keeps everything inside AWS, uses IAM for auth instead of a separate login
- **IAM instance role instead of access keys** — no long-lived credentials sitting in Jenkins
- **Helm instead of raw `kubectl apply`** — templated, versioned, one-command rollbacks (`helm rollback`)

---

## Prerequisites

- AWS account (Free Tier active) with an IAM user that has EC2/IAM/ECR permissions
- AWS CLI installed locally, configured with `aws configure`
- Terraform installed locally (`terraform -version` to confirm)
- A GitHub account and a new repo for this project
- Basic SSH familiarity

---

## Step 1 — Create an EC2 Key Pair (if you don't have one)

```bash
aws ec2 create-key-pair --key-name cicd-key --query 'KeyMaterial' --output text > cicd-key.pem
chmod 400 cicd-key.pem
```

---

## Step 2 — Provision infrastructure with Terraform

```bash
cd infra
terraform init
```

Find your public IP for the security group restriction:
```bash
curl -s ifconfig.me
```

Apply, passing in your key name and IP (replace values):
```bash
terraform apply \
  -var="key_name=cicd-key" \
  -var="my_ip=$(curl -s ifconfig.me)/32"
```

Type `yes` to confirm. When it finishes, note the output values — especially `instance_public_ip`.

**What Terraform just created for you:**
- An EC2 instance (t2.micro, Free Tier eligible)
- A security group open only to your IP (SSH, Jenkins UI, HTTP, Grafana)
- An IAM role + instance profile giving the EC2 instance ECR push/pull permissions — no stored AWS keys needed anywhere in Jenkins

---

## Step 3 — SSH into the instance

```bash
ssh -i cicd-key.pem ubuntu@<instance_public_ip>
```

---

## Step 4 — Add swap (t2.micro only has 1GB RAM)

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile swap swap defaults 0 0' | sudo tee -a /etc/fstab
```

---

## Step 5 — Install Docker

```bash
sudo apt update
sudo apt install -y docker.io awscli
sudo usermod -aG docker ubuntu
sudo systemctl enable docker --now
newgrp docker
```

---

## Step 6 — Install k3s (lightweight Kubernetes)

```bash
curl -sfL https://get.k3s.io | sh -
sudo chmod 644 /etc/rancher/k3s/k3s.yaml
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown $(id -u):$(id -g) ~/.kube/config
export KUBECONFIG=~/.kube/config
echo 'export KUBECONFIG=~/.kube/config' >> ~/.bashrc

kubectl get nodes
```

k3s comes bundled with **Traefik** (ingress controller) and **metrics-server** (needed for
autoscaling) — no extra install needed for either.

---

## Step 7 — Install Helm

```bash
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
helm version
```

---

## Step 8 — Install Jenkins

```bash
sudo apt install -y openjdk-17-jdk
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/" | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt update
sudo apt install -y jenkins
sudo systemctl enable jenkins --now
```

Give Jenkins access to Docker, kubectl, and Helm:
```bash
sudo usermod -aG docker jenkins
sudo mkdir -p /var/lib/jenkins/.kube
sudo cp ~/.kube/config /var/lib/jenkins/.kube/config
sudo chown -R jenkins:jenkins /var/lib/jenkins/.kube
sudo systemctl restart jenkins
```

Open `http://<instance_public_ip>:8080`, unlock with:
```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

Install suggested plugins, create your admin user. Then install these extra plugins
(Manage Jenkins → Plugins):
- Docker Pipeline
- Pipeline: AWS Steps
- GitHub Integration

---

## Step 9 — Push this project to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Terraform + microservices + Helm + Jenkinsfile"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

## Step 10 — Fill in the placeholders

Replace these before your first build:
- `Jenkinsfile` → `YOUR_AWS_ACCOUNT_ID`, `YOUR_GITHUB_USERNAME/YOUR_REPO`
- `helm/myapp/values.yaml` → `YOUR_ECR_REPO_URL` (format: `<account_id>.dkr.ecr.<region>.amazonaws.com`)

Find your AWS account ID:
```bash
aws sts get-caller-identity --query Account --output text
```

Commit and push these changes.

---

## Step 11 — Create the Jenkins pipeline job

1. Jenkins Dashboard → New Item → name it `microservices-pipeline` → **Pipeline** → OK
2. Pipeline section:
   - Definition: **Pipeline script from SCM**
   - SCM: Git → your repo URL, branch `*/main`
   - Script Path: `Jenkinsfile`
3. Save → **Build Now**

Watch the console output — it will test the backend, log into ECR using the instance's IAM role,
build both images, push them, and run `helm upgrade --install`.

---

## Step 12 — Set up GitHub webhook (auto-trigger on push)

1. GitHub repo → Settings → Webhooks → Add webhook
   - Payload URL: `http://<instance_public_ip>:8080/github-webhook/`
   - Content type: `application/json`
   - Event: Just the push event
2. In the Jenkins job config, enable **GitHub hook trigger for GITScm polling**

---

## Step 13 — Access the app

```bash
kubectl get pods
kubectl get svc
```

Port-forward for a quick check:
```bash
kubectl port-forward svc/myapp-frontend 8081:80
```

From your local machine, tunnel through SSH:
```bash
ssh -i cicd-key.pem -L 8081:localhost:8081 ubuntu@<instance_public_ip>
```

Visit `http://localhost:8081` — you should see the visit counter incrementing on refresh, and you
can watch `servedBy` cycle between different backend pod names as Kubernetes load-balances.

---

## Step 14 — Add monitoring (Prometheus + Grafana)

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install monitoring prometheus-community/kube-prometheus-stack \
  --set grafana.service.type=NodePort \
  --set grafana.service.nodePort=30030 \
  --namespace monitoring --create-namespace
```

Get the Grafana admin password:
```bash
kubectl get secret monitoring-grafana -n monitoring -o jsonpath="{.data.admin-password}" | base64 -d
```

Port-forward and tunnel like Step 13, but for Grafana:
```bash
kubectl port-forward svc/monitoring-grafana -n monitoring 3000:80
```
Log in (`admin` / the password above), and explore the pre-built Kubernetes dashboards showing
pod CPU/memory, node health, and — because you set up the HPA — you can watch pods scale under load.

---

## Step 15 — Test autoscaling (great demo for interviews)

Generate load against the backend and watch the HPA react:
```bash
kubectl run -i --tty load-generator --image=busybox --restart=Never -- \
  /bin/sh -c "while true; do wget -q -O- http://myapp-backend:5000/api/visits; done"
```
In another terminal:
```bash
kubectl get hpa -w
```
You'll see `REPLICAS` climb as CPU usage crosses the 70% threshold, then scale back down after you
stop the load generator (`kubectl delete pod load-generator`).

---

## Cost control checklist

- `terraform destroy` when you're done demoing, to tear everything down cleanly
- Stop (don't just leave running) the EC2 instance between sessions
- Free Tier: 750 EC2 hours/month, 30GB EBS/month, 500MB ECR storage/month — this project fits comfortably if it's not left running 24/7
- Set a CloudWatch billing alarm at $1

---

## What to put on your resume

> Built a production-style microservices CI/CD platform on AWS: provisioned infrastructure with
> Terraform, automated build/test/deploy with Jenkins, containerized two services with Docker,
> pushed images to Amazon ECR authenticated via IAM roles, and deployed to a Kubernetes (k3s)
> cluster using Helm with horizontal pod autoscaling and readiness/liveness probes. Added
> Prometheus/Grafana monitoring for cluster and application observability.

### Resume bullets (pick 3-5 that fit your format)
- Provisioned AWS infrastructure (EC2, IAM, security groups) as code using Terraform
- Built a Jenkins CI/CD pipeline automating test, build, and deployment for a 2-service microservices app
- Containerized services with Docker and published versioned images to Amazon ECR
- Deployed and managed workloads on Kubernetes (k3s) using Helm charts with templated, environment-configurable manifests
- Configured Horizontal Pod Autoscaling and resource requests/limits for cost-efficient scaling
- Implemented IAM-role-based authentication for CI/CD pipelines, eliminating stored credentials
- Set up Prometheus and Grafana for cluster and application-level monitoring

---

## Optional further stretch goals

- Add a **staging vs production** Helm values file (`values-staging.yaml`, `values-prod.yaml`) and a manual approval gate in Jenkins before prod deploy
- Add **SonarQube** for static code analysis as a pipeline stage
- Replace the single-node k3s with a **3-node k3s cluster** (control plane + 2 workers) across multiple EC2 instances for a true HA story
- Add **cert-manager** + a free domain for real HTTPS via Let's Encrypt
- Write a **GitHub Actions** version of the same pipeline to show multi-CI-tool versatility
