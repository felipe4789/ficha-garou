"""Read the user's scanned base book. Intermediate OCR stays out of the app."""
import concurrent.futures,json,pathlib,threading
import numpy as np
import pymupdf
from rapidocr_onnxruntime import RapidOCR

ROOT=pathlib.Path(__file__).resolve().parent.parent
OUT=ROOT/'tmp/catalog-ocr'
OUT.mkdir(parents=True,exist_ok=True)
local=threading.local()
def extract(number):
    target=OUT/f'{number}.json'
    if target.exists(): return number
    if not hasattr(local,'engine'): local.engine=RapidOCR(intra_op_num_threads=1,inter_op_num_threads=1)
    with pymupdf.open(next(ROOT.glob('*.pdf'))) as doc:
        pix=doc[number-1].get_pixmap(matrix=pymupdf.Matrix(2,2))
        result,_=local.engine(np.frombuffer(pix.samples,dtype=np.uint8).reshape(pix.height,pix.width,3))
        lines=[{'text':r[1],'score':float(r[2]),'box':r[0]} for r in result]
        lines.sort(key=lambda r:(0 if sum(p[0] for p in r['box'])/4<pix.width/2 else 1,min(p[1] for p in r['box'])))
        target.write_text(json.dumps({'pdfPage':number,'bookPage':number-16,'width':pix.width,'lines':lines},ensure_ascii=False,indent=2),encoding='utf-8')
    print('Read PDF page',number,flush=True)
    return number
with concurrent.futures.ThreadPoolExecutor(3) as pool: list(pool.map(extract,range(131,170)))
