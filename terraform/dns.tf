# Manages Cloudflare DNS records for optimal performance and security

# Main A record pointing to web server
resource "cloudflare_record" "main" {
  zone_id = data.cloudflare_zone.main.id
  name    = "@"
  content = var.web_server_ip
  type    = "A"
  ttl     = 1  # Required when proxied = true
  proxied = true # Enable Cloudflare proxy for security and performance
  allow_overwrite = true

  comment = "Main domain A record pointing to web server"
}

# WWW CNAME record
resource "cloudflare_record" "www" {
  zone_id = data.cloudflare_zone.main.id
  name    = "www"
  content = var.domain_name
  type    = "CNAME"
  ttl     = 1  # Required when proxied = true
  proxied = true
  allow_overwrite = true

  comment = "WWW subdomain redirect to main domain"
}

# API subdomain for backend service
resource "cloudflare_record" "api" {
  zone_id = data.cloudflare_zone.main.id
  name    = "api"
  content = var.api_server_endpoint
  type    = "CNAME"
  ttl     = 300
  proxied = false # Don't proxy API calls to avoid issues

  comment = "API subdomain pointing to backend service"
}

# Email MX records for mail service
resource "cloudflare_record" "mx1" {
  zone_id  = data.cloudflare_zone.main.id
  name     = "@"
  content  = var.primary_mx_server
  type     = "MX"
  priority = 10
  ttl      = 3600

  comment = "Primary MX record for email service"
}

resource "cloudflare_record" "mx2" {
  zone_id  = data.cloudflare_zone.main.id
  name     = "@"
  content  = var.secondary_mx_server
  type     = "MX"
  priority = 20
  ttl      = 3600

  comment = "Secondary MX record for email service"
}

# SPF record for email security
resource "cloudflare_record" "spf" {
  zone_id = data.cloudflare_zone.main.id
  name    = "@"
  content = var.spf_record
  type    = "TXT"
  ttl     = 3600

  comment = "SPF record for email authentication"
}

# DMARC record for email security
resource "cloudflare_record" "dmarc" {
  zone_id = data.cloudflare_zone.main.id
  name    = "_dmarc"
  content = "v=DMARC1; p=quarantine; rua=mailto:dmarc@${var.domain_name}"
  type    = "TXT"
  ttl     = 3600

  comment = "DMARC policy for email security"
}
