$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot
$env:ANDROID_HOME = "$projectRoot/.tools/sdk"
$adbPath = "$env:ANDROID_HOME/platform-tools/adb.exe"
& "$PSScriptRoot/build-android.ps1"
& $adbPath install -r "$projectRoot/output/ficha-garou.apk"
if ($LASTEXITCODE -ne 0) { throw 'Não foi possível instalar o APK.' }
& $adbPath shell am start -n br.com.fichagarou/.MainActivity
