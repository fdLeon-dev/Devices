# Helper PowerShell script to deploy Firestore rules using npx
# Usage: .\scripts\run-deploy-rules.ps1 [-ProjectId <projectId>]
param(
  [string]$ProjectId
)

if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
  Write-Error "npx not found. Install Node.js and npm, or run 'npm install' in the repo to install dev deps.";
  exit 1;
}

if ($ProjectId) {
  npx firebase deploy --only firestore:rules --project $ProjectId
} else {
  npx firebase deploy --only firestore:rules
}
