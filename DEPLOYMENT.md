# Deployment Guide for AWS EC2

This guide outlines the steps to deploy the SIMED application to an AWS EC2 instance (Ubuntu).

## Prerequisites

-   AWS Account
-   EC2 Instance (Ubuntu 20.04 or 22.04 recommended)
-   Key pair (.pem file) for SSH access
-   Domain name (optional, but recommended)

## Steps

### 1. Prepare Environment Variables

1.  Navigate to the `backend` directory.
2.  Copy `.env.example` to `.env`:
    ```bash
    cp .env.example .env
    ```
3.  Edit `.env` and fill in your production values (Supabase URL, etc.).

### 2. Transfer Files to EC2

You can use `scp` or `rsync` to transfer files, or pull from a Git repository.

**Option A: Git (Recommended)**
1.  SSH into your EC2 instance.
2.  Clone your repository:
    ```bash
    git clone <repository_url> simed
    cd simed
    ```

**Option B: SCP**
Run this from your local machine:
```bash
scp -i /path/to/key.pem -r * ubuntu@<ec2-ip>:/home/ubuntu/simed
```

### 3. Run Setup Script

1.  SSH into your EC2 instance.
2.  Make the script executable:
    ```bash
    chmod +x setup_ec2.sh
    ```
3.  Run the script:
    ```bash
    ./setup_ec2.sh
    ```

### 4. Post-Setup Configuration

The setup script does the following:
-   Installs Node.js, Nginx, PM2.
-   Installs dependencies and builds the frontend.
-   Configures Nginx.
-   Starts the backend with PM2.

**Important:**
-   Ensure your EC2 Security Group allows inbound traffic on port 80 (HTTP) and 443 (HTTPS).
-   If you have a customized `.env` file that wasn't transferred, create it now in `backend/.env`.

### 5. Verify Deployment

-   Visit your EC2 public IP or domain in a browser. You should see the login page.
-   Check backend logs if needed:
    ```bash
    pm2 logs simed-backend
    ```

### 6. SSL Setup (Optional but Recommended)

To enable HTTPS, use Certbot:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```
