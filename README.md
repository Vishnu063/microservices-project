# 🚀 Microservices DevSecOps CI/CD Platform

[![CI/CD](https://img.shields.io/badge/CI%2FCD-Jenkins-D24939?logo=jenkins&logoColor=white)](#-cicd-pipeline)
[![IaC](https://img.shields.io/badge/IaC-Terraform-7B42BC?logo=terraform&logoColor=white)](#%EF%B8%8F-aws-infrastructure)
[![Kubernetes](https://img.shields.io/badge/Orchestration-Kubernetes%20(k3s)-326CE5?logo=kubernetes&logoColor=white)](#%EF%B8%8F-kubernetes-deployment)
[![Security](https://img.shields.io/badge/Security-Trivy%20%7C%20Gitleaks-critical)](#-devsecops-security)
[![Monitoring](https://img.shields.io/badge/Monitoring-Prometheus%20%7C%20Grafana-E6522C?logo=prometheus&logoColor=white)](#-monitoring)

A production-style **DevSecOps CI/CD platform** on AWS that takes an application from a `git push` to a running, monitored deployment on Kubernetes — with security scanning built into the pipeline as an enforced gate, not an afterthought.

```
Code Commit → Secret Scan → Test → Docker Build → Image Scan → Push to ECR → Kubernetes Deploy → Monitoring
```

---

## 📋 Table of Contents

- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [CI/CD Pipeline Flow](#-cicd-pipeline-flow)
- [DevSecOps Security](#-devsecops-security)
- [AWS Infrastructure](#%EF%B8%8F-aws-infrastructure)
- [Project Structure](#-project-structure)
- [Running Locally](#-running-locally)
- [Deployment](#-deployment)
- [Useful Commands](#-useful-commands)
- [Roadmap](#-roadmap)
- [Author](#-author)

---

## 🏗️ Architecture

```
                         GitHub Repository
                                │
                                ▼
                        Jenkins Pipeline
                                │
        ┌───────────┬──────────┼──────────┬───────────────┐
        ▼           ▼          ▼           ▼               │
   Unit Tests    Gitleaks    Trivy    Docker Build          │
   (fail fast)  (secrets)  (image     (backend +            │
                            CVEs)      frontend)             │
        └───────────┴──────────┴──────────┘                 │
                                │                             │
                                ▼                             │
                       Amazon ECR Registry                   │
                                │                             │
                                ▼                             │
                         Helm Deployment                     │
                                │                             │
                                ▼                             │
                    Kubernetes (k3s Cluster)                 │
                                │                             │
              ┌─────────────────┼─────────────────┐          │
              ▼                 ▼                 ▼          │
          Frontend           Backend            Redis         │
              │                 │                 │          │
              └─────────────────┴─────────────────┘          │
                                │                             │
                                ▼                             │
                  Prometheus + Grafana Monitoring ◄───────────┘
```

**Design principle:** every stage before "Push to ECR" is a **gate**, not a report. If Gitleaks finds a secret or Trivy finds a HIGH/CRITICAL CVE, the pipeline stops — the image never reaches the registry or the cluster.

---

## 🛠️ Technology Stack

| Layer | Tools |
|---|---|
| **Cloud** | AWS EC2, IAM, Amazon ECR, AWS CLI |
| **Infrastructure as Code** | Terraform |
| **CI/CD** | Jenkins, GitHub webhook integration |
| **Containerization** | Docker, Docker Compose |
| **Orchestration** | k3s (lightweight Kubernetes), Helm |
| **Security (DevSecOps)** | Trivy (image vulnerability scanning), Gitleaks (secret scanning) |
| **Monitoring** | Prometheus, Grafana, Kubernetes Metrics |
| **Application** | Node.js (backend), HTML/JS (frontend), Redis |

---

## 🔄 CI/CD Pipeline Flow

1. Developer pushes code to GitHub
2. Jenkins automatically triggers the pipeline via webhook
3. Source code is checked out
4. Application unit tests run
5. **Gitleaks** scans the repository for exposed secrets (AWS keys, tokens, passwords)
6. Docker images are built for the backend and frontend services
7. **Trivy** scans each image for OS and dependency vulnerabilities
8. Images are pushed to **Amazon ECR** (authenticated via IAM role — no static AWS keys in Jenkins)
9. **Helm** deploys the new image version to the k3s cluster
10. Kubernetes manages rollout, health checks, and self-healing
11. **Prometheus + Grafana** monitor node and pod health post-deployment

---

## 🔐 DevSecOps Security

Security scanning is wired directly into the Jenkins pipeline as a blocking gate — a failed scan stops the build the same way a failed test would.

### Gitleaks — Secret Scanning
Scans the repository and commit history for:
- AWS access keys
- API tokens
- Passwords and other hardcoded credentials

### Trivy — Vulnerability Scanning
Scans every built Docker image for:
- Known OS package CVEs
- Vulnerable application dependencies

### IAM Role-Based Authentication
The pipeline authenticates to AWS using an **IAM role attached to the EC2 instance** running Jenkins — not a static access key stored in Jenkins credentials. This means:
- No long-lived AWS secret sitting in the CI system
- Credentials are short-lived and auto-rotated
- The role is scoped to only the permissions the pipeline actually needs

---

## ☁️ AWS Infrastructure

Provisioned entirely through **Terraform** (see `infra/`):
- EC2 instance (Jenkins host / cluster node)
- IAM role and instance profile
- Security groups
- Supporting networking and permissions

```bash
cd infra
terraform init
terraform plan
terraform apply
```

---

## 📂 Project Structure

```
microservices-project/
├── Jenkinsfile              # CI/CD pipeline definition
├── docker-compose.yml       # Local multi-service dev environment
├── infra/                   # Terraform - AWS infrastructure (EC2, IAM, security groups)
├── services/
│   ├── backend/              # Node.js backend service
│   └── frontend/             # HTML/JS frontend service
├── helm/
│   └── myapp/                 # Helm chart for Kubernetes deployment
└── README.md
```

---

## 💻 Running Locally

Spin up the full stack (frontend, backend, Redis) locally with Docker Compose before touching the Kubernetes/cloud path:

```bash
git clone https://github.com/Vishnu063/microservices-project.git
cd microservices-project
docker-compose up --build
```

This is the fastest way to verify the application itself works before running it through the full CI/CD pipeline.

---

## ☸️ Deployment

Once infrastructure is provisioned and images are in ECR, deploy to the k3s cluster with Helm:

```bash
helm upgrade --install myapp ./helm/myapp \
  --set image.tag=<build-tag> \
  --namespace myapp --create-namespace
```

Kubernetes then handles:
- Rolling updates
- Health checks (liveness/readiness)
- Automatic restarts on failure
- Replica management via ReplicaSets

---

## 📊 Monitoring

Prometheus scrapes cluster and pod-level metrics; Grafana visualizes them.

Tracked metrics include:
- Node CPU / memory utilization
- Pod health and restart counts
- Overall cluster performance

---

## 🔧 Useful Commands

```bash
# Check running pods
kubectl get pods -n myapp

# Check Helm release history
helm history myapp -n myapp

# Roll back to the previous release
helm rollback myapp -n myapp

# Check images stored in ECR
aws ecr describe-images --repository-name microservices-project

# Tail Jenkins pipeline logs
# (from Jenkins UI: Build → Console Output)
```

---

## 🗺️ Roadmap

Planned hardening to close the gap between "security scanning exists" and "security is fully enforced":

- [ ] **Checkov** — Terraform IaC scanning (catch misconfigured security groups/IAM before `apply`)
- [ ] **Kyverno** — policy-as-code admission control (block `:latest` tags, enforce non-root containers, mandatory resource limits)
- [ ] **Syft** — SBOM generation for every built image
- [ ] **cosign** — image signing, with signature verification at deploy time
- [ ] **ArgoCD** — GitOps-based deployment with automated drift correction, replacing manual `helm upgrade`
- [ ] Staging environment ahead of the production-style deployment path
- [ ] Runtime secrets via AWS Secrets Manager / HashiCorp Vault instead of Helm values

---

## 🎯 Key Achievements

- ✅ Automated end-to-end CI/CD pipeline using Jenkins
- ✅ AWS infrastructure provisioned as code with Terraform
- ✅ Microservices containerized with Docker
- ✅ Private image storage and management via Amazon ECR
- ✅ Kubernetes deployment templated and versioned with Helm
- ✅ Security scanning (secrets + vulnerabilities) enforced as a pipeline gate
- ✅ IAM role-based AWS authentication — no static credentials in CI
- ✅ Cluster and application monitoring with Prometheus + Grafana

---

## 💼 Resume Summary

> Built an end-to-end DevSecOps CI/CD platform on AWS — provisioning infrastructure with Terraform, running a Jenkins-based pipeline that gates on Gitleaks secret scanning and Trivy image vulnerability scanning, containerizing services with Docker, managing images through Amazon ECR with IAM role-based authentication, deploying to Kubernetes via Helm, and monitoring the cluster with Prometheus and Grafana.

---

## 👨‍💻 Author

**Vishnu Kushwaha**
DevSecOps Engineer
[GitHub](https://github.com/Vishnu063)
