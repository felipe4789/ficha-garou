$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot
$jdkPath = (Get-ChildItem -LiteralPath "$projectRoot/.tools/jdk" -Directory | Select-Object -First 1).FullName
if (-not $jdkPath) { throw 'JDK ausente em .tools/jdk' }
$env:JAVA_HOME = $jdkPath
$env:PATH = "$jdkPath/bin;$env:PATH"
$sdkPath = "$projectRoot/.tools/sdk"
$androidJar = "$sdkPath/platforms/android-35/android.jar"
$buildTools = "$sdkPath/build-tools/35.0.0"
$buildPath = "$projectRoot/android/build"
New-Item -ItemType Directory -Force "$buildPath/classes", "$buildPath/dex", "$buildPath/assets/web", "$projectRoot/output" | Out-Null
Copy-Item -Path "$projectRoot/web/*" -Destination "$buildPath/assets/web" -Recurse -Force
function Run-Checked { param([string]$Program, [string[]]$Arguments); & $Program @Arguments; if ($LASTEXITCODE -ne 0) { throw "Falha: $Program (código $LASTEXITCODE)" } }
Run-Checked "$jdkPath/bin/javac.exe" @('-encoding','UTF-8','-source','8','-target','8','-classpath',$androidJar,'-d',"$buildPath/classes","$projectRoot/android/app/src/main/java/br/com/fichagarou/MainActivity.java")
Run-Checked "$jdkPath/bin/jar.exe" @('cf',"$buildPath/app.jar",'-C',"$buildPath/classes",'.')
Run-Checked "$jdkPath/bin/java.exe" @('-cp',"$buildTools/lib/d8.jar",'com.android.tools.r8.D8','--lib',$androidJar,'--min-api','26','--output',"$buildPath/dex","$buildPath/app.jar")
Run-Checked "$buildTools/aapt.exe" @('package','-f','-M',"$projectRoot/android/app/src/main/AndroidManifest.xml",'-S',"$projectRoot/android/app/src/main/res",'-I',$androidJar,'-A',"$buildPath/assets",'-F',"$buildPath/unsigned.apk")
Push-Location "$buildPath/dex"
try { Run-Checked "$buildTools/aapt.exe" @('add',"$buildPath/unsigned.apk",'classes.dex') } finally { Pop-Location }
Run-Checked "$buildTools/zipalign.exe" @('-f','4',"$buildPath/unsigned.apk","$buildPath/aligned.apk")
$keyPath = "$projectRoot/.tools/debug.keystore"
if (-not (Test-Path -LiteralPath $keyPath)) { Run-Checked "$jdkPath/bin/keytool.exe" @('-genkeypair','-keystore',$keyPath,'-storepass','android','-keypass','android','-alias','androiddebugkey','-dname','CN=Ficha Garou Development','-keyalg','RSA','-keysize','2048','-validity','10000') }
Run-Checked "$jdkPath/bin/java.exe" @('-jar',"$buildTools/lib/apksigner.jar",'sign','--ks',$keyPath,'--ks-key-alias','androiddebugkey','--ks-pass','pass:android','--key-pass','pass:android','--out',"$projectRoot/output/ficha-garou.apk","$buildPath/aligned.apk")
Run-Checked "$jdkPath/bin/java.exe" @('-jar',"$buildTools/lib/apksigner.jar",'verify','--verbose',"$projectRoot/output/ficha-garou.apk")
Write-Output "APK pronto: $projectRoot/output/ficha-garou.apk"
