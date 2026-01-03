# GrantBridge Infrastructure as Code
# Terraform configuration for DNS management and monitoring setup

terraform {
  required_version = ">= 1.0"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
    sentry = {
      source  = "jianyuan/sentry"
      version = "~> 0.12"
    }
  }

  # Terraform Cloud backend for state management (recommended for production)
  # Uncomment and configure when ready
  # cloud {
  #   organization = "your-org-name"
  #   workspaces {
  #     name = "grantbridge-prod"
  #   }
  # }
}

# Configure Cloudflare provider
provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# Configure Sentry provider
provider "sentry" {
  token = var.sentry_auth_token
  base_url = "https://grantbridge.sentry.io/"
}

# Data source to get Cloudflare zone information
data "cloudflare_zone" "main" {
  name = var.domain_name
}
