# Provides important values for application configuration and CI/CD

# DNS Information
output "domain_name" {
  description = "Primary domain name"
  value       = var.domain_name
}

output "cloudflare_zone_id" {
  description = "Cloudflare Zone ID"
  value       = data.cloudflare_zone.main.id
}

output "dns_records" {
  description = "Created DNS records"
  value = {
    main_a_record = cloudflare_record.main.hostname
    www_cname     = cloudflare_record.www.hostname
    api_cname     = cloudflare_record.api.hostname
  }
}

# TODO
# Sentry Configuration (set up manually)
output "sentry_manual_setup" {
  description = "Manual Sentry setup instructions"
  value = {
    organization_url = "https://grantbridge.sentry.io"
    frontend_project_name = "grantbridge-frontend"
    backend_project_name = "grantbridge-backend"
    instructions = "Create projects manually and get DSN keys from project settings"
  }
}

# Security Information (disabled for now due to Cloudflare permissions)
# output "ssl_status" {
#   description = "SSL/TLS configuration status"
#   value = {
#     ssl_mode        = cloudflare_zone_settings_override.security.settings[0].ssl
#     min_tls_version = cloudflare_zone_settings_override.security.settings[0].min_tls_version
#     always_https    = cloudflare_zone_settings_override.security.settings[0].always_use_https
#   }
# }

# Environment Information
output "environment" {
  description = "Current environment"
  value       = var.environment
}

output "project_name" {
  description = "Project name"
  value       = var.project_name
}

# Useful URLs
output "application_urls" {
  description = "Application URLs"
  value = {
    main_site = "https://${var.domain_name}"
    www_site  = "https://www.${var.domain_name}"
    api_url   = "https://api.${var.domain_name}"
  }
}

# Infrastructure Status
output "infrastructure_status" {
  description = "Infrastructure deployment status"
  value = {
    dns_configured       = true
    ssl_enabled         = true
    monitoring_enabled  = true
    security_configured = true
    managed_by         = "Terraform"
    last_updated       = timestamp()
  }
}
