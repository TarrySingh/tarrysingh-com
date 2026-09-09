"""Rebuild small, provenance-bearing datasets used by the visual essay.

Requires mpmath==1.3.0. Run with --molecules to fetch public coordinate files.
No raster images are generated. Coordinates remain in angstroms.
"""
import argparse
import hashlib
import json
import pathlib
import urllib.request
import mpmath as mp

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / 'public/synaptic/intelligence-without-permission'
mp.mp.dps = 35

def save(name, data):
    (OUT / name).write_text(json.dumps(data, separators=(',', ':'))+'\n')

def zeta():
    real = [i / 40 for i in range(41)]
    imaginary = [10 + i / 6 for i in range(121)]
    values = [[round(float(abs(mp.zeta(mp.mpc(x, y)))), 8) for x in real] for y in imaginary]
    zeros = [float(mp.im(mp.zetazero(i))) for i in range(1, 4)]
    for i in range(1, 4):
        assert abs(mp.zeta(mp.zetazero(i))) < mp.mpf('1e-28')
    assert abs(mp.zeta(2) - mp.pi**2 / 6) < mp.mpf('1e-30')
    slice_values = [[round(10+i/60, 8), round(float(abs(mp.zeta(mp.mpc('.5', 10+mp.mpf(i)/60)))), 8)] for i in range(1201)]
    save('zeta.json', {'function':'abs(zeta(sigma+i*t))','precision_digits':35,'generator':'mpmath 1.3.0','real':real,'imaginary':imaginary,'values':values,'critical_line':slice_values,'zeros':zeros,'height_transform':'log1p(modulus), clipped at 1.8','pole':'s=1 is outside this domain','purpose':'Finite illustration, not evidence for the Riemann hypothesis'})
    print('zeta.json: 4,961 grid samples; 1,201 line samples; three zero residuals and zeta(2) checked')

def fetch(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent':'SynapticResearch/1.0'}), timeout=45) as response:
        return response.read()

def atoms(raw, record='ATOM', chain='A'):
    result=[]
    for line in raw.decode().splitlines():
        if line.startswith(record.ljust(6)) and line[21:22] == chain and line[16:17] in (' ', 'A'):
            result.append({'name':line[12:16].strip(),'residue':line[17:20].strip(),'number':int(line[22:26]),'xyz':[float(line[30:38]),float(line[38:46]),float(line[46:54])],'b':float(line[60:66]),'element':line[76:78].strip()})
    return result

def molecules():
    exp_url='https://files.rcsb.org/download/1LYZ.pdb'
    exp_raw=fetch(exp_url)
    api='https://alphafold.ebi.ac.uk/api/prediction/P00698'
    metadata=json.loads(fetch(api))[0]
    pred_url=metadata['pdbUrl']
    pred_raw=fetch(pred_url)
    experimental=[a for a in atoms(exp_raw) if a['name']=='CA']
    predicted=[a for a in atoms(pred_raw) if a['name']=='CA' and 19 <= a['number'] <= 147]
    assert len(experimental)==len(predicted)==129
    assert [a['residue'] for a in experimental]==[a['residue'] for a in predicted]
    a=mp.matrix([v['xyz'] for v in experimental]); b=mp.matrix([v['xyz'] for v in predicted])
    mean_a=[sum(a[i,j] for i in range(129))/129 for j in range(3)]
    mean_b=[sum(b[i,j] for i in range(129))/129 for j in range(3)]
    ac=mp.matrix([[a[i,j]-mean_a[j] for j in range(3)] for i in range(129)])
    bc=mp.matrix([[b[i,j]-mean_b[j] for j in range(3)] for i in range(129)])
    u,s,vt=mp.svd(bc.T*ac)
    correction=mp.eye(3); correction[2,2]=1 if mp.det(u*vt)>0 else -1
    aligned=bc*u*correction*vt
    rmsd=mp.sqrt(sum((aligned[i,j]-ac[i,j])**2 for i in range(129) for j in range(3))/129)
    def rounded(matrix): return [[round(float(matrix[i,j]),5) for j in range(3)] for i in range(matrix.rows)]
    save('protein.json',{'name':'Hen egg-white lysozyme','experimental':rounded(ac),'predicted':rounded(aligned),'confidence':[v['b'] for v in predicted],'residues':[v['residue'] for v in experimental],'rmsd_angstrom':float(rmsd),'provenance':{'experimental':exp_url,'experimental_accession':'1LYZ chain A residues 1–129','predicted':pred_url,'predicted_accession':'P00698 residues 19–147, signal peptide excluded','alignment':'Proper-rotation least-squares C-alpha alignment; all 129 sequence-identical residues','units':'angstrom','experimental_sha256':hashlib.sha256(exp_raw).hexdigest(),'predicted_sha256':hashlib.sha256(pred_raw).hexdigest(),'licences':'PDB CC0; AlphaFold DB CC BY 4.0','interpretation':'Illustrative comparison of a familiar protein, not a held-out AlphaFold benchmark. Confidence is pLDDT, not experimental error.'}})
    binding_url='https://files.rcsb.org/download/1STP.pdb'
    binding_raw=fetch(binding_url)
    protein=atoms(binding_raw)
    ca=[a for a in protein if a['name']=='CA']
    ligand=[a for a in atoms(binding_raw,'HETATM') if a['residue']=='BTN']
    assert ca and ligand
    centre=[sum(a['xyz'][j] for a in ligand)/len(ligand) for j in range(3)]
    contacts=[a for a in protein if min(sum((a['xyz'][j]-b['xyz'][j])**2 for j in range(3)) for b in ligand)<16]
    def centered(items):
        return [{**a,'xyz':[round(a['xyz'][j]-centre[j],5) for j in range(3)]} for a in items]
    save('binding.json',{'name':'Streptavidin–biotin','backbone':centered(ca),'ligand':centered(ligand),'contacts':centered(contacts),'provenance':{'url':binding_url,'accession':'1STP, chain A; BTN ligand','sha256':hashlib.sha256(binding_raw).hexdigest(),'units':'angstrom','contact_rule':'Protein atoms within 4 Å of a ligand atom; geometric proximity, not a bond or an affinity measurement','licence':'PDB CC0','purpose':'Experimental educational example; not an AI-designed binder or therapeutic'}})
    print(f'protein.json: 129 matched residues, C-alpha RMSD {float(rmsd):.3f} Å; binding.json: {len(ligand)} ligand atoms')

if __name__=='__main__':
    parser=argparse.ArgumentParser(); parser.add_argument('--molecules',action='store_true'); args=parser.parse_args()
    OUT.mkdir(parents=True,exist_ok=True)
    molecules() if args.molecules else zeta()
