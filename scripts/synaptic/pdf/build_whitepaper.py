#!/usr/bin/env python3
"""Typeset the complete Synaptic essay, preserving its prose and evidence.

Requires reportlab, svglib, lxml, pypdf and Pillow. Pass --font-dir containing
NotoSans-{Regular,Bold,Italic,BoldItalic}.ttf and NotoSerif equivalents.
"""
from __future__ import annotations

import argparse
import hashlib
import html
import io
import json
import re
from pathlib import Path

from lxml import etree
from PIL import Image as PILImage
from reportlab import rl_config
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, Flowable, Frame, PageTemplate, Paragraph, Spacer,
    PageBreak, KeepTogether, Table, TableStyle, Image, CondPageBreak,
)
from reportlab.graphics import renderPDF
from svglib.svglib import svg2rlg

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
URL = 'https://www.tarrysingh.com/synaptic/intelligence-without-permission'
W, H = A4
LEFT, RIGHT, BOTTOM, TOP = 66, 62, 57, 64
TEXT_W = W - LEFT - RIGHT
PLATE_W = W - 88
INK = colors.HexColor('#142B3A')
NAVY = colors.HexColor('#091D2D')
TEAL = colors.HexColor('#007A82')
GOLD = colors.HexColor('#AB7429')
MUTED = colors.HexColor('#506575')
PALE = colors.HexColor('#EFF4F5')
RULE = colors.HexColor('#CDD9DD')
FIGURES = {f['id']: f for f in json.loads((HERE/'figures.json').read_text())}
SOURCES = json.loads((HERE/'sources.json').read_text())
MANIFEST = json.loads((ROOT/'docs/plans/intelligence-without-permission/production-manifest.json').read_text())
META = {f['id']: f for f in MANIFEST['figures']}


def clean(s):
    # Font-safe editorial punctuation; words and meaning are unchanged.
    return str(s).replace('\u2011', '-').replace('\u2013', '-').replace('\u2014', ' - ').replace('\u2212', '-').replace('\u00a0', ' ')


def esc(s):
    return html.escape(clean(s), quote=True)


def markup(s):
    s = esc(s)
    s = re.sub(r'&lt;Source id=&quot;(S\d+)&quot;\s*/&gt;', lambda m: '<super><font size="7" color="#007A82"><link href="#source-'+m[1]+'">['+m[1][1:]+']</link></font></super>', s)
    s = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', lambda m: '<link color="#007A82" href="'+m[2]+'">'+m[1]+'</link>', s)
    s = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', s)
    s = re.sub(r'(?<!\*)\*([^*]+)\*(?!\*)', r'<i>\1</i>', s)
    s = re.sub(r'`([^`]+)`', r'<font name="Sans">\1</font>', s)
    return re.sub(r'[≠≤≥√∈∞∑∂∇]', lambda m: '<font name="Symbols">'+m[0]+'</font>', s)


def fonts(folder):
    pdfmetrics.registerFont(TTFont('Symbols', str(folder/'DejaVuSans.ttf')))
    pdfmetrics.registerFont(TTFont('Symbols-Bold', str(folder/'DejaVuSans-Bold.ttf')))
    for family, prefix in [('Sans','NotoSans'),('Serif','NotoSerif')]:
        for style, suffix in [('', 'Regular'),('-Bold','Bold'),('-Italic','Italic'),('-BoldItalic','BoldItalic')]:
            pdfmetrics.registerFont(TTFont(family+style, str(folder/(prefix+'-'+suffix+'.ttf'))))
        pdfmetrics.registerFontFamily(family, normal=family, bold=family+'-Bold', italic=family+'-Italic', boldItalic=family+'-BoldItalic')


ST = {}
def styles():
    ST.update({
        'body': ParagraphStyle('body', fontName='Serif', fontSize=10.15, leading=15, textColor=INK, spaceAfter=8, allowWidows=0, allowOrphans=0),
        'lead': ParagraphStyle('lead', fontName='Serif', fontSize=12, leading=18, textColor=INK, spaceAfter=14),
        'h2': ParagraphStyle('h2', fontName='Sans-Bold', fontSize=16, leading=21, textColor=INK, spaceBefore=15, spaceAfter=10, keepWithNext=True),
        'h3': ParagraphStyle('h3', fontName='Sans-Bold', fontSize=12.2, leading=17, textColor=TEAL, spaceBefore=12, spaceAfter=8, keepWithNext=True),
        'small': ParagraphStyle('small', fontName='Sans', fontSize=8.1, leading=11.8, textColor=MUTED, spaceAfter=7),
        'caption': ParagraphStyle('caption', fontName='Sans', fontSize=9.1, leading=13, textColor=INK, spaceAfter=9),
        'method': ParagraphStyle('method', fontName='Sans', fontSize=7.8, leading=11.3, textColor=MUTED, spaceAfter=7),
        'figuretitle': ParagraphStyle('figuretitle', fontName='Sans-Bold', fontSize=16, leading=20, textColor=INK, spaceAfter=9),
        'kicker': ParagraphStyle('kicker', fontName='Sans-Bold', fontSize=8, leading=11, textColor=TEAL, spaceAfter=8, tracking=1.3),
        'cell': ParagraphStyle('cell', fontName='Sans', fontSize=8, leading=11.4, textColor=INK),
        'cellhead': ParagraphStyle('cellhead', fontName='Sans-Bold', fontSize=8, leading=11, textColor=colors.white),
        'reference': ParagraphStyle('reference', fontName='Sans', fontSize=8.25, leading=12, textColor=INK, spaceAfter=6),
        'toc': ParagraphStyle('toc', fontName='Sans', fontSize=10, leading=14.5, textColor=INK),
        'tocsmall': ParagraphStyle('tocsmall', fontName='Sans', fontSize=8.8, leading=12.7, textColor=INK),
    })
    # A very small local adjustment prevents a two-line terminal page in
    # chapter 9 without cutting prose or compressing the rest of the book.
    ST['body09']=ParagraphStyle('body09',parent=ST['body'],leading=14.6,spaceAfter=6.8)


def p(text, style='body'):
    return Paragraph(markup(text), ST[style])


def rich(text, style='body'):
    return Paragraph(text, ST[style])


class SetSection(Flowable):
    def __init__(self, label, number=''):
        Flowable.__init__(self)
        self.label,self.number=label,number
    def wrap(self,*a): return 0,0
    def draw(self):
        self.canv._doctemplate.section=self.label
        self.canv._doctemplate.section_number=self.number


class Anchor(Flowable):
    def __init__(self,key,title=None,level=0):
        Flowable.__init__(self); self.key,self.title,self.level=key,title,level
    def wrap(self,*a): return 0,0
    def draw(self):
        c=self.canv;c.bookmarkPage(self.key)
        c._doctemplate.locations[self.key]=c.getPageNumber()
        if self.title:c.addOutlineEntry(clean(self.title),self.key,self.level,closed=False)


class Rule(Flowable):
    def __init__(self,w=TEXT_W,color=TEAL):
        Flowable.__init__(self);self.width=w;self.height=11;self.color=color
    def draw(self):
        self.canv.setStrokeColor(self.color);self.canv.setLineWidth(.7);self.canv.line(0,7,self.width,7)


class Cover(Flowable):
    def wrap(self,*a):return TEXT_W,H-TOP-BOTTOM-1
    def draw(self):
        c=self.canv
        c.saveState();c.translate(-LEFT,-BOTTOM)
        c.setFillColor(NAVY);c.rect(0,0,W,H,fill=1,stroke=0)
        art=ROOT/'public/synaptic/intelligence-without-permission/editorial-cover.webp'
        c.drawImage(ImageReader(str(art)),0,111,width=W,height=W*941/1672,mask='auto')
        c.setFillColor(TEAL);c.rect(44,H-58,28,4,fill=1,stroke=0)
        c.setFillColor(colors.white);c.setFont('Sans-Bold',10);c.drawString(82,H-58,'SYNAPTIC  /  FIELD STUDIES')
        c.setFillColor(colors.HexColor('#BCD0D8'));c.setFont('Sans',8);c.drawRightString(W-44,H-58,'SEPTEMBER 2026')
        c.setFillColor(colors.HexColor('#C1A173'));c.setFont('Sans-Bold',9);c.drawString(44,H-105,'THE END OF INTELLECTUAL EXCLUSIVITY')
        for t,y in [('Intelligence',H-167),('Without',H-220),('Permission.',H-273)]:
            c.setFillColor(colors.white if t!='Permission.' else colors.HexColor('#8CD8D7'))
            c.setFont('Sans-Bold',46);c.drawString(40,y,t)
        sub=Paragraph('When advanced intellectual work becomes widely available, what must institutions and enterprises do to earn their place?',ParagraphStyle('coversub',fontName='Sans',fontSize=12,leading=18,textColor=colors.HexColor('#D5E3E9')))
        sub.wrapOn(c,457,70);sub.drawOn(c,44,H-348)
        c.setStrokeColor(colors.HexColor('#385061'));c.line(44,99,W-44,99)
        c.setFillColor(colors.white);c.setFont('Sans-Bold',14);c.drawString(44,71,'Tarry Singh')
        c.setFillColor(colors.HexColor('#C3D5DF'));c.setFont('Sans',8.5);c.drawString(44,51,'40,376 narrative words  /  18 sections  /  38 exhibits')
        c.setFont('Sans',8);c.drawRightString(W-44,71,'COMPLETE WHITE PAPER')
        c.drawRightString(W-44,51,'tarrysingh.com')
        c.linkURL(URL,(0,0,W,H),relative=0,thickness=0)
        c.restoreState()


class ChapterTitle(Flowable):
    def __init__(self,chapter,part):
        Flowable.__init__(self);self.chapter=chapter;self.part=part
        self.title=Paragraph(esc(chapter['title']),ParagraphStyle('chaptertitle',fontName='Sans-Bold',fontSize=27,leading=33,textColor=INK))
    def wrap(self,w,h):
        _,self.th=self.title.wrap(TEXT_W,300);self.height=self.th+72;return w,self.height
    def draw(self):
        c=self.canv;label=self.chapter['id'].upper()
        c.setFillColor(TEAL);c.setFont('Sans-Bold',8.5)
        c.drawString(0,self.height-13,('CHAPTER '+label if label.isdigit() else label)+'  /  '+self.part.upper())
        self.title.drawOn(c,0,38)
        c.setStrokeColor(RULE);c.line(0,20,TEXT_W,20)
        c.setFillColor(MUTED);c.setFont('Sans',7.4)
        c.drawString(0,5,'SYNAPTIC  |  INTELLIGENCE WITHOUT PERMISSION')
        c.drawRightString(TEXT_W,5,'TARRY SINGH')


PALETTE={
    '#e7b778':'#A87325','#7ed1d2':'#007A82','#b6a1e4':'#72509B',
    '#f2e9d6':'#163041','#314050':'#B6C7D0','#14263a':'#EDF3F5',
    '#182c40':'#E9F0F3','#101e30':'#FFFFFF','#101f30':'#F0F4F6',
    '#0b1726':'#F7FAFB','#0c1929':'#F6F8F9','#08121f':'#F5F8F9',
    '#1d2b3b':'#EDF3F5','#25364a':'#D5DFE4','#1a2b3e':'#D5DFE4',
    '#445366':'#ADBCC6',
}


class VectorFigure(Flowable):
    def __init__(self,xml,width):
        Flowable.__init__(self)
        xml=clean(xml)
        el=etree.fromstring(xml.encode())
        el.set('xmlns','http://www.w3.org/2000/svg')
        vb=list(map(float,el.get('viewBox').split()))
        el.set('width',str(vb[2]));el.set('height',str(vb[3]))
        for node in el.iter():
            if not isinstance(node.tag,str):continue
            if node.tag.split('}')[-1]=='text':
                cl=node.get('class','')
                node.set('font-family','Sans')
                node.set('font-size','52' if 'iwp-svg-number' in cl else '18' if 'iwp-svg-title' in cl else '14')
                node.set('fill', '#A87325' if 'iwp-svg-number' in cl else '#203B4C')
                if 'iwp-svg-title' in cl:node.set('font-family','Sans-Bold')
                if any(c in ''.join(node.itertext()) for c in '≠≤≥√∈∞∑∂∇'):
                    node.set('font-family','Symbols-Bold' if 'iwp-svg-title' in cl else 'Symbols')
            for attr,val in list(node.attrib.items()):
                for old,new in PALETTE.items():val=val.replace(old,new)
                if attr=='style':
                    val=re.sub(r'font-family:[^;]+;?', 'font-family:Sans;',val)
                node.set(attr,val)
        raw=etree.tostring(el)
        self.drawing=svg2rlg(io.BytesIO(raw))
        self.width=width;self.height=width*vb[3]/vb[2]
        # SVG CSS pixels are converted to points by svglib. Scale from the
        # resulting drawing width, rather than applying a second px/pt factor.
        scale=width/self.drawing.width
        self.drawing.scale(scale,scale)
    def wrap(self,w,h):return self.width,self.height
    def draw(self):renderPDF.draw(self.drawing,self.canv,0,0)


def table(rows,width,header=True,col_widths=None):
    data=[[p(cell,'cellhead' if header and i==0 else 'cell') for cell in row] for i,row in enumerate(rows)]
    t=Table(data,colWidths=col_widths or [width/len(rows[0])]*len(rows[0]),repeatRows=1 if header else 0,hAlign='LEFT')
    cmds=[('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),9),('RIGHTPADDING',(0,0),(-1,-1),9),('TOPPADDING',(0,0),(-1,-1),9),('BOTTOMPADDING',(0,0),(-1,-1),10),('LINEBELOW',(0,0),(-1,-1),.4,RULE)]
    if header:cmds += [('BACKGROUND',(0,0),(-1,0),NAVY),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,PALE])]
    else:cmds += [('ROWBACKGROUNDS',(0,0),(-1,-1),[PALE,colors.white])]
    t.setStyle(TableStyle(cmds));return t


STATE_NOTES={
    'V19':'Default assumptions: 1,000 attempts; 25% unique; $0.10 per attempt; checking at $2 each; 20% pass; physical tests at $50 each. Total $3,100; $62 per accepted candidate; 50 accepted candidates. Physical test outcomes remain unknown.',
    'V25':'Printed scenario: a component. Buyer: product manufacturer. Offer: a better optimisation routine. Test: independent correctness and integration tests. Dependencies: interfaces, qualification and distribution. Possible outcomes: licence, supply contract or acquisition.',
    'V31':'Default capacities per period: 100 arrivals, 30 validations and 10 deployments. Queues added: 70 before validation and 20 before deployment. Starts with empty queues and assumes every processed candidate passes.',
    'V32':'Default scenario: 50% of serial time accelerates by 10x. Total falls from 100 to 55 units, a whole-project speedup of 1.82x. With instantaneous analysis, the unchanged stage still takes 50 units.',
    'V33':'Default assumptions: research is 25% of cost; that cost falls by 50%; 50% of savings pass to the customer. Price falls from 100 to 95; cost from 80 to 70; unit margin rises from 20 to 25. Fixed volume and quality.',
    'V34':'Printed scenario: fewer adoption barriers. The interactive version also compares a sequence with more barriers. Neither view encodes elapsed time or probabilities.',
    'V35':'Selected dependency: models. Can the research continue with another provider? Versioned artefacts, evaluations and usable alternatives make that question practical.',
    'V36':'Printed scenario: several workable routes. Assumptions: useful alternatives, portable work, accessible tests and buyers willing to evaluate new contributors. A possible effect is wider bargaining power and participation. The alternative concentrated-control scenario is available online; neither has an assigned probability.',
}


def custom_figure(id,width):
    if id=='V37':
        rows=[['University action','Measure','Decision criterion'],
              ['Open a route to a bounded test','Time to decision; eligible outside contributors','Continue if evidence quality holds while access improves'],
              ['Assess judgement directly','Explanation, transfer and detection of errors','Revise assessment when polished output hides weak understanding'],
              ['Fund shared research memory','Reusable data, negative results and maintained tools','Support contributions that other teams can actually use']]
        return [table(rows,width),Spacer(1,10),p('Printed view: university. The online decision instrument also covers enterprise R&D, smaller labs and public funders. These are proposed choices, not measured effects. Choose a scope and baseline before a trial and preserve evidence that could justify stopping it.','small')]
    if id=='V38':
        rows=[['Stage','Mathematics: the printed path'],['01  Ask','A precisely stated claim'],['02  Attempt','Candidate proof and formal artefact'],['03  Check','Statement, assumptions and independent scrutiny'],['04  Use','Knowledge that others can inspect and extend']]
        return [table(rows,width,col_widths=[90,width-90]),Spacer(1,14),p('The opportunity is a wider right to try.\nThe achievement is a result that survives.','lead'),p('The interactive edition also follows the biology and industry paths.','small')]
    return []


class Exhibit(Flowable):
    def __init__(self,id):
        Flowable.__init__(self);self.id=id;f=FIGURES[id];meta=META[id]
        iw=PLATE_W-24
        self.items=[p('EXHIBIT '+id[1:]+'  /  '+f['kind'].upper(),'kicker'),p(f['title'],'figuretitle')]
        if meta['dimension']=='3D':
            kind=meta['instrument'];img=HERE/'assets'/f'{kind}.png'
            im=PILImage.open(img);self.items += [Image(str(img),width=iw,height=iw*im.height/im.width),Spacer(1,10)]
            self.items += [p('Static view of the interactive 3D study. Geometry, evidence status and limitations are described below.','small')]
        elif f['tables']:
            rows=f['tables'][0]['rows']
            if id=='V22':rows=[['Function','What changes','What the institution can add']]+rows
            if id=='V20' and f['svgs']:self.items += [VectorFigure(f['svgs'][0],iw),Spacer(1,10)]
            self.items += [table(rows,iw),Spacer(1,11)]
        elif f['svgs']:
            self.items += [VectorFigure(f['svgs'][0],iw),Spacer(1,12)]
        else:self.items += custom_figure(id,iw)
        if id in STATE_NOTES:self.items += [p(STATE_NOTES[id],'small')]
        self.items += [p(f['caption'],'caption'),p('Method and evidence. '+f['method'],'method'),rich('<link href="'+URL+'#figure-'+id+'" color="#007A82"><b>Explore exhibit '+id[1:]+' online</b></link>','small')]
        self.width=TEXT_W
    def wrap(self,w,h):
        self.sizes=[x.wrap(PLATE_W-24,10000) for x in self.items]
        self.height=24+sum(height+getattr(x,'spaceAfter',0) for x,(_,height) in zip(self.items,self.sizes))
        return TEXT_W,self.height
    def draw(self):
        c=self.canv;x=-(PLATE_W-TEXT_W)/2
        c.saveState();c.translate(x,0)
        c.setStrokeColor(RULE);c.setLineWidth(.55);c.line(0,self.height,PLATE_W,self.height)
        c.setFillColor(TEAL);c.rect(0,self.height-4,38,4,fill=1,stroke=0)
        y=self.height-18
        for item,(_,height) in zip(self.items,self.sizes):
            y-=height;item.drawOn(c,12,y);y-=getattr(item,'spaceAfter',0)
        c.restoreState()


PARTS={'prologue':'The premise','01':'The premise','02':'Scientific evidence','03':'Scientific evidence','04':'Scientific evidence','05':'Scientific evidence','06':'Scientific evidence','07':'Research without the old gates','08':'Research without the old gates','09':'Institutional consequence','10':'Institutional consequence','11':'Institutional consequence','12':'Industrial futures','13':'Industrial futures','14':'Markets and power','15':'Markets and power','16':'The response','coda':'The response'}


class Paper(BaseDocTemplate):
    def __init__(self,path,known=None):
        super().__init__(str(path),pagesize=A4,leftMargin=LEFT,rightMargin=RIGHT,topMargin=TOP,bottomMargin=BOTTOM,title='Intelligence Without Permission',author='Tarry Singh',subject='The end of intellectual exclusivity: science, institutions and industrial futures',pageCompression=1)
        self.section='';self.section_number='';self.locations={};self.known=known or {}
        self.addPageTemplates(PageTemplate(id='paper',frames=Frame(LEFT,BOTTOM,TEXT_W,H-TOP-BOTTOM,leftPadding=0,rightPadding=0,topPadding=0,bottomPadding=0),onPage=self.page_start,onPageEnd=self.page_end))
    def page_start(self,c,doc):
        if doc.page==1:return
        c.setFillColor(colors.white);c.rect(0,0,W,H,fill=1,stroke=0)
    def page_end(self,c,doc):
        if doc.page==1:return
        c.saveState();c.setStrokeColor(RULE);c.setLineWidth(.5);c.line(LEFT,H-43,W-RIGHT,H-43)
        c.setFillColor(TEAL);c.setFont('Sans-Bold',7);c.drawString(LEFT,H-33,'SYNAPTIC')
        c.setFillColor(MUTED);c.setFont('Sans',7)
        header=clean(self.section)
        while pdfmetrics.stringWidth(header,'Sans',7)>TEXT_W-94:header=header[:-2]
        c.drawRightString(W-RIGHT,H-33,header)
        c.setStrokeColor(RULE);c.line(LEFT,40,W-RIGHT,40)
        c.setFillColor(MUTED);c.setFont('Sans',7)
        c.drawString(LEFT,26,'TARRY SINGH  /  SEPTEMBER 2026')
        c.drawCentredString(W/2,26,'tarrysingh.com')
        c.linkURL(URL,(W/2-40,19,W/2+40,34),relative=0,thickness=0)
        c.setFillColor(INK);c.setFont('Sans-Bold',8);c.drawRightString(W-RIGHT,26,str(doc.page))
        c.restoreState()


def frontmatter(known):
    story=[Cover(),PageBreak(),SetSection('Executive brief'),Anchor('executive','Executive brief'),p('EXECUTIVE BRIEF','kicker'),p('The institution must earn its advantage again','h2'),Spacer(1,8)]
    story += [p('When demanding intellectual work becomes easier to obtain, the ability to employ scarce expertise becomes a less complete explanation of institutional power. The consequential question is what an organisation contributes beyond access to that expertise.','lead')]
    findings=[
        ('01  Name the work precisely','A proposed mathematical resolution, the formalisation of a known theorem, an improved bound and a biological experiment are different achievements. The institutional argument is stronger when those distinctions remain visible.'),
        ('02  Separate capability from access','PhD-level intelligence describes a direction of travel and a set of demanding tasks. It does not establish that every retail system is a complete scientist, or that the strongest research configurations are equally available worldwide.'),
        ('03  Test the claim of uniqueness','A smaller lab does not have to reproduce ASML, IBM, Google or Dyson. It can contest a valuable component, analytical method or research service. An incumbent may remain formidable while losing exclusivity over a profitable activity.'),
        ('04  Follow the whole process','More research attempts help only when checking, experiments and deployment can absorb them. Count credible results and complete costs. Agent population and generated output are incomplete measures of productive capacity.'),
        ('05  Rebuild around useful evidence','Universities, enterprises and public institutions can become more valuable by supplying reliable tests, facilities, judgement and routes for outsiders to contribute. The advantage shifts toward organisations that make the complete process work.'),
    ]
    for title,text in findings:story += [p(title,'h3'),p(text)]
    story += [p('This brief is an editorial guide to the full essay. The complete 40,376-word narrative follows; figure notes and the source register preserve the limits of the evidence.','small'),PageBreak()]
    story += [SetSection('Reader guide'),Anchor('reader-guide','Reader guide'),p('READER GUIDE','kicker'),p('A complete argument, with inspectable evidence','h2'),Spacer(1,7)]
    story += [p('Read this as a challenge to inherited exclusivity and a constructive account of what institutions can become. The paper retains every narrative paragraph of the web edition. Its exhibits preserve the distinction between measured results, computed examples and explicitly stated scenarios.','lead')]
    story += [table([
        ['For the reader','Start here'],
        ['Research and academic leaders','Chapters 7-10 and 16: access, verification, university functions and a practical institutional response.'],
        ['Enterprise and R&D leaders','Chapters 10-14: what remains scarce, where smaller competitors can enter, and how gains reach markets.'],
        ['Scientific readers','Chapters 2-6: the precise mathematical and biological claims, formal artefacts and experimental boundaries.'],
        ['Industrial operators','Chapter 12: oil and gas, pharmaceuticals, manufacturing, utilities, software and services.'],
        ['Founders and public funders','Chapters 7-8 and 15-16: the complete cost of research, access conditions and the new dependencies.'],
    ],TEXT_W,col_widths=[133,TEXT_W-133]),Spacer(1,19)]
    story += [p('What the PDF preserves','h3'),p('All 18 sections, 38 numbered exhibits and 61 source entries. Numerical source citations link to the bibliography. Chapter and exhibit entries in the contents are clickable, and PDF bookmarks support navigation.','body'),p('What moves online','h3'),p('Ten 3D instruments appear here as captioned static views. Interactive 2D exhibits show identified default states or comparison tables. Each exhibit links to its live version, where readers can change controls, inspect assumptions and download the supporting data.','body'),p('Edition and authorship','h3'),p('Tarry Singh, Synaptic. Evidence cut-off: 9 September 2026. Company reports, independent sources and the author’s scenarios carry different evidential weight. A citation records provenance; it does not imply independent replication. The cover is AI-generated conceptual artwork. Scientific exhibits retain their individual methods and attribution.','small'),PageBreak()]
    story += [SetSection('Contents'),Anchor('contents','Contents'),p('CONTENTS','kicker'),p('The argument, chapter by chapter','h2'),Spacer(1,10)]
    entries=[('executive','Executive brief'),('reader-guide','Reader guide')]+[('chapter-'+c['id'],(c['id']+'  ' if c['id'].isdigit() else c['id'].capitalize()+'  ')+c['title']) for c in MANIFEST['chapters']]+[('sources','Sources and reading notes'),('exhibit-index','Index of exhibits'),('colophon','Edition notes')]
    for key,title in entries:
        row=Table([[rich('<link href="#'+key+'">'+esc(title)+'</link>','toc'),p(str(known.get(key,'-')),'toc')]],colWidths=[TEXT_W-35,35])
        row.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),0),('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),7),('LINEBELOW',(0,0),(-1,-1),.35,RULE)]))
        story.append(row)
    story.append(PageBreak());return story


def narrative():
    story=[]
    for chapter in MANIFEST['chapters']:
        id=chapter['id']
        story += [SetSection(chapter['title'],id),Anchor('chapter-'+id,(id+'  ' if id.isdigit() else '')+chapter['title']),ChapterTitle(chapter,PARTS[id]),Spacer(1,12)]
        raw=(ROOT/'content/synaptic/intelligence-without-permission'/f'{id}.mdx').read_text()
        raw=re.sub(r'<!--[\s\S]*?-->','',raw)
        for block in re.split(r'\n\s*\n',raw.strip()):
            block=block.strip()
            if not block:continue
            m=re.fullmatch(r'<Figure id="(V\d+)"\s*/>',block)
            if m:
                fid=m[1];e=Exhibit(fid);_,eh=e.wrap(TEXT_W,10000)
                if eh>H-TOP-BOTTOM-15:raise ValueError(f'{fid} too tall: {eh:.1f}')
                story += [CondPageBreak(eh+18),Anchor('figure-'+fid,'Exhibit '+fid[1:]+': '+FIGURES[fid]['title'],1),e,Spacer(1,20)]
            elif block.startswith('#'):
                level=len(block)-len(block.lstrip('#'))
                story += [p(block[level:].strip(),'h2' if level<=2 else 'h3')]
            else:
                story += [p(re.sub(r'\s*\n\s*',' ',block),'body09' if id=='09' else 'body')]
        story.append(PageBreak())
    return story


def endmatter(known):
    story=[SetSection('Sources and reading notes'),Anchor('sources','Sources and reading notes'),p('SOURCE REGISTER','kicker'),p('The evidence is part of the argument','h2'),p('Research cut-off: 9 September 2026. A link records provenance, not independent replication. The bibliography includes sources for both the narrative and the exhibits. Company announcements, original papers, formal artefacts and the author’s scenarios carry different kinds of evidence.','caption')]
    for id,s in sorted(SOURCES.items(),key=lambda kv:int(kv[0][1:])):
        items=[Anchor('source-'+id),rich('<font color="#007A82"><b>'+id[1:].zfill(2)+'</b></font>  <b>'+esc(s['title'])+'</b>','reference'),p(s['note'],'reference')]
        url=esc(s['url'])
        display=url.replace('/','/\u200b').replace('-','-\u200b').replace('_','_\u200b').replace('?','?\u200b')
        items += [rich('<link href="'+url+'" color="#007A82">'+display+'</link>','method'),Spacer(1,12)]
        story += [KeepTogether(items)]
    story += [PageBreak(),SetSection('Index of exhibits'),Anchor('exhibit-index','Index of exhibits'),p('INDEX OF EXHIBITS','kicker'),p('Thirty-eight ways to examine the argument','h2'),p('Each entry links to its location in this PDF. Exhibit pages link onward to the corresponding live figure.','small')]
    for index,(id,f) in enumerate(FIGURES.items()):
        if index==19:
            story += [PageBreak(),p('INDEX OF EXHIBITS / CONTINUED','kicker'),p('Institutions, industry and the future','h2'),Spacer(1,10)]
        row=Table([[p(id[1:],'tocsmall'),rich('<link href="#figure-'+id+'">'+esc(f['title'])+'</link>','tocsmall'),p(META[id]['dimension'],'tocsmall'),p(str(known.get('figure-'+id,'-')),'tocsmall')]],colWidths=[30,TEXT_W-98,35,33])
        row.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),0),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),6),('LINEBELOW',(0,0),(-1,-1),.35,RULE)]));story.append(row)
    story += [PageBreak(),SetSection('Edition notes'),Anchor('colophon','Edition notes'),p('EDITION NOTES','kicker'),p('Intelligence Without Permission','h2'),p('The end of intellectual exclusivity','lead'),p('Written by Tarry Singh for Synaptic. Complete white paper edition, September 2026.','body'),Rule(),p('Text integrity','h3'),p('The original narrative contains 40,376 words across 18 sections. That count excludes headings, figure captions, source notes and the front matter added for this edition. The PDF retains the complete prose; typographic punctuation is normalised for reliable rendering.','body'),p('Visuals and methods','h3'),p('The cover is AI-generated conceptual artwork. The 38 exhibits are original explanatory graphics, documented computed examples, data-based scientific views or explicitly identified scenarios. Ten 3D instruments are reproduced as static views. Source licences and attribution remain in their method notes; the web edition provides supporting files and fuller interaction.','body'),p('A living research record','h3'),p('The dated evidence cut-off is part of the argument. Later scrutiny, new publications and changing access conditions can alter the state of a claim. Read the stated scope of each source and the assumptions of each model.','body'),Spacer(1,15),rich('<link href="'+URL+'" color="#007A82"><b>Read the live essay and explore all 38 exhibits</b></link>','caption'),Spacer(1,34),p('Copyright tarrysingh.com ©','caption')]
    return story


def build(output):
    known={}
    for attempt in range(4):
        doc=Paper(output,known)
        story=frontmatter(known)+narrative()+endmatter(known)
        doc.build(story)
        if doc.locations==known:break
        known=doc.locations
    else:raise RuntimeError('Contents did not converge')
    from pypdf import PdfReader
    reader=PdfReader(str(output))
    report={'title':'Intelligence Without Permission','author':'Tarry Singh','pages':len(reader.pages),'narrativeWords':40376,'figures':len(FIGURES),'sources':len(SOURCES),'bytes':output.stat().st_size,'sha256':hashlib.sha256(output.read_bytes()).hexdigest(),'locations':doc.locations,'textPerPage':[len(page.extract_text() or '') for page in reader.pages]}
    output.with_suffix('.audit.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps({k:v for k,v in report.items() if k not in ['locations','textPerPage']},indent=2))


if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('--font-dir',type=Path,required=True);ap.add_argument('--output',type=Path,default=ROOT/'output/pdf/intelligence-without-permission.pdf');args=ap.parse_args()
    fonts(args.font_dir);styles();args.output.parent.mkdir(parents=True,exist_ok=True);build(args.output)
