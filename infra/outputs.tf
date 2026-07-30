output "instance_public_ip" {
  description = "Public IP of the CI/CD server"
  value       = aws_instance.cicd_server.public_ip
}

output "ssh_command" {
  description = "Ready-to-use SSH command"
  value       = "ssh -i ${var.key_name}.pem ubuntu@${aws_instance.cicd_server.public_ip}"
}

output "jenkins_url" {
  description = "Jenkins UI URL (once installed)"
  value       = "http://${aws_instance.cicd_server.public_ip}:8080"
}
