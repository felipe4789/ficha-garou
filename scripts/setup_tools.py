import pathlib,urllib.request,zipfile,concurrent.futures
base=pathlib.Path('.tools')
def download(item):
 name,url=item; dest=base/name
 if not dest.exists(): urllib.request.urlretrieve(url,dest)
 print(name,dest.stat().st_size,flush=True)
 with zipfile.ZipFile(dest) as z: z.extractall(base/('jdk' if name=='jdk.zip' else 'sdk/cmdline-tools'))
 print('extracted',name,flush=True)
with concurrent.futures.ThreadPoolExecutor(2) as p: list(p.map(download,[('jdk.zip','https://aka.ms/download-jdk/microsoft-jdk-21-windows-x64.zip'),('sdk.zip','https://dl.google.com/android/repository/commandlinetools-win-15859902_latest.zip')]))
