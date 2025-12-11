$ServerIP = "13.210.197.247"
$User = "ubuntu"
$KeyPath = ".\hospital-api.pem"
$LocalScript = "backend\scripts\seed_leaves.js"
$RemotePath = "~/simed/backend/scripts/seed_leaves.js"

Write-Host "Deploying leave updates to $ServerIP..."

# 1. SCP the script
Write-Host "Uploading seed_leaves.js..."
scp -i $KeyPath $LocalScript "${User}@${ServerIP}:${RemotePath}"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error uploading file." -ForegroundColor Red
    exit 1
}

# 2. Run the script
Write-Host "Executing seed script on server..."
ssh -i $KeyPath "${User}@${ServerIP}" "cd ~/simed/backend && \
echo 'Running seed_leaves.js...' && \
node scripts/seed_leaves.js"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error executing script." -ForegroundColor Red
    exit 1
}

Write-Host "Successfully updated doctor leaves on server!" -ForegroundColor Green
