#!/usr/bin/env python3
"""Check preservation of the original prose, captions, sources and PDF links."""
import json
import re
import unicodedata
from pathlib import Path

import pdfplumber
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parents[3]
OUT=ROOT/'output/pdf/intelligence-without-permission.pdf'
audit=json.loads(OUT.with_suffix('.audit.json').read_text())
def normalized(s):
    s=re.sub(r'\[\d+\]','',s)
    return ''.join(c for c in unicodedata.normalize('NFKC',s).casefold() if c.isalnum())

with pdfplumber.open(OUT) as pdf:
    start=audit['locations']['chapter-prologue']-1
    end=audit['locations']['sources']-1
    body='\n'.join(page.crop((42,55,page.width-42,page.height-49)).extract_text() or '' for page in pdf.pages[start:end])
    all_text='\n'.join(page.extract_text() or '' for page in pdf.pages)
    glyphs=[];overflow=[]
    for i,page in enumerate(pdf.pages):
        for char in page.chars:
            if any(c in char['text'] for c in ['\x00','\ufffd']):glyphs.append([i+1,char['text']])
            if char['x0'] < -1 or char['x1'] > page.width+1 or char['top'] < -1 or char['bottom'] > page.height+1:
                overflow.append([i+1,char['text']])
norm=normalized(body);missing=[];paragraphs=0
for path in (ROOT/'content/synaptic/intelligence-without-permission').glob('*.mdx'):
    for block in re.split(r'\n\s*\n',path.read_text().strip()):
        if block.startswith(('#','<Figure')):continue
        block=re.sub(r'<Source[^>]+/>','',block)
        block=re.sub(r'\[([^\]]+)\]\([^)]+\)',r'\1',block)
        block=re.sub(r'<[^>]+>','',block)
        if not block.strip():continue
        paragraphs+=1
        if normalized(block) not in norm:missing.append([path.stem,block[:120]])
figures=json.loads((Path(__file__).parent/'figures.json').read_text())
missing_captions=[f['id'] for f in figures if normalized(f['caption']) not in normalized(all_text)]
sources=json.loads((Path(__file__).parent/'sources.json').read_text())
reader=PdfReader(OUT)
uris=[str(a.get_object().get('/A',{}).get('/URI','')) for page in reader.pages for a in page.get('/Annots',[])]
missing_links=[s['url'] for s in sources.values() if s['url'] not in uris]
report={'pages':len(reader.pages),'narrativeParagraphs':paragraphs,'paragraphsPreserved':paragraphs-len(missing),'missingParagraphs':missing,'missingCaptions':missing_captions,'missingSourceLinks':missing_links,'missingGlyphs':glyphs,'pageOverflow':overflow,'figureBookmarks':sum(k.startswith('figure-') for k in audit['locations']),'sourceAnchors':sum(k.startswith('source-') for k in audit['locations']),'externalLinks':len([u for u in uris if u]),'copyrightPresent':'Copyright tarrysingh.com' in all_text}
OUT.with_suffix('.verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(report,ensure_ascii=False,indent=2))
assert not any([missing,missing_captions,missing_links,glyphs,overflow])
assert paragraphs==484 and report['figureBookmarks']==38 and report['sourceAnchors']==61 and report['copyrightPresent']
