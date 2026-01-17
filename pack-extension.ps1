# pack-extension.ps1
# Creates a zip file for Chrome Web Store submission

$ExtensionDir = Join-Path $PSScriptRoot "extension"
$OutputDir = $PSScriptRoot
$ManifestPath = Join-Path $ExtensionDir "manifest.json"

# Read version from manifest.json
$Manifest = Get-Content $ManifestPath -Raw | ConvertFrom-Json
$Version = $Manifest.version

$ZipName = "mihoyo-oversea-proxy-v$Version.zip"
$ZipPath = Join-Path $OutputDir $ZipName

# Remove existing zip if present
if (Test-Path $ZipPath) {
    Remove-Item $ZipPath -Force
    Write-Host "Removed existing $ZipName"
}

# Create the zip file
Compress-Archive -Path "$ExtensionDir\*" -DestinationPath $ZipPath -Force

Write-Host "Created: $ZipPath"
Write-Host "Ready for Chrome Web Store submission!"
