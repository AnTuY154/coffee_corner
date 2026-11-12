param([string]$ProjectPath = ".", [string]$ZipPath = "./vuon-e-frame-assets.zip")
$ErrorActionPreference = "Stop"
$project = (Resolve-Path $ProjectPath).Path
$zip = (Resolve-Path $ZipPath).Path
$target = Join-Path $project "public/art"
New-Item -ItemType Directory -Force $target | Out-Null
Expand-Archive -LiteralPath $zip -DestinationPath $target -Force
Push-Location $project
try {
  npm run test:frames
  if ($LASTEXITCODE -ne 0) { throw "Frame verification failed" }
  Write-Host "Assets installed. Review visuals, then: git add public/art/frames public/art/manifest.json; git commit -m 'feat(2d): add approved character frames'; git push"
} finally { Pop-Location }
