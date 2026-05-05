$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
$backendDir = Join-Path $root 'backend'
$frontendDir = Join-Path $root 'frontendReactPart'

Write-Host 'Opening backend terminal...'
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location -Path '$backendDir'; pip install -r requirements.txt; python app.py"

Write-Host 'Opening frontend terminal...'
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location -Path '$frontendDir'; npm install; npm run dev"

Write-Host 'Backend and frontend terminals launched.'
