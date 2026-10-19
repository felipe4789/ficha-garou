param([string]$Name='FichaGarou_Android15')
$ErrorActionPreference='Stop'
$projectRoot=Split-Path -Parent $PSScriptRoot
$env:ANDROID_HOME="$projectRoot/.tools/sdk"
$emulatorPath="$env:ANDROID_HOME/emulator/emulator.exe"
$devicePath="$env:USERPROFILE/.android/avd/$Name.ini"
if(-not (Test-Path -LiteralPath $devicePath)){throw "Emulador $Name ausente. Crie o AVD com avdmanager antes de continuar."}
# A visible window is intentional: the user follows implementation in the emulator.
Start-Process -FilePath $emulatorPath -ArgumentList @('-avd',$Name,'-gpu','auto','-no-boot-anim','-netdelay','none','-netspeed','full') -WindowStyle Normal
