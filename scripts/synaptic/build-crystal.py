"""Expand COD 9008564's origin site using its explicit symmetry operations."""
from fractions import Fraction
import hashlib,itertools,json,pathlib,re
root=pathlib.Path(__file__).resolve().parents[2]
directory=root/'public/synaptic/intelligence-without-permission'
raw=(directory/'diamond.cif').read_bytes(); text=raw.decode()
assert re.search(r'C\s+0\.00000\s+0\.00000\s+0\.00000',text)
block=text.split('_space_group_symop_operation_xyz\n',1)[1].split('loop_',1)[0]
sites=set()
for operation in block.strip().splitlines():
    operation=operation.strip().strip("'")
    coordinates=[]
    for term in operation.split(','):
        assert re.fullmatch(r'[xyz0-9/+-]+',term),term
        value=term.replace('x','0').replace('y','0').replace('z','0')
        total=sum(Fraction(t) for t in re.findall(r'[+-]?\d+(?:/\d+)?',value))%1
        coordinates.append(float(total))
    assert len(coordinates)==3
    sites.add(tuple(coordinates))
assert len(sites)==8
closed=set()
for p in sites:
    for q in itertools.product(*[[v,1.] if v==0 else [v] for v in p]):closed.add(q)
points=sorted(closed)
bonds=[[i,j] for i,a in enumerate(points) for j,b in enumerate(points) if i<j and abs(sum((a[k]-b[k])**2 for k in range(3))-3/16)<1e-10]
length=float(re.search(r'_cell_length_a\s+([\d.]+)',text).group(1))
data={'name':'Diamond','accession':'COD 9008564, revision 291735','source':'https://www.crystallography.net/cod/9008564.html','credit':'R. W. G. Wyckoff, Crystal Structures, volume 1 (1963), pp. 7–83; AMCSD 0011242; Crystallography Open Database','licence':'CC0','cell_length_angstrom':length,'space_group':227,'fractional_points':points,'bonds':bonds,'unique_periodic_sites':8,'sha256':hashlib.sha256(raw).hexdigest(),'note':'Established experimental crystal used to explain a unit cell, not a GNoME prediction. Boundary sites are repeated for visibility; eight sites per periodic cell.'}
(directory/'crystal.json').write_text(json.dumps(data,separators=(',',':'))+'\n')
print(f'PASS: 8 periodic sites, {len(points)} displayed boundary-inclusive sites, {len(bonds)} nearest-neighbour bonds, cell {length} Å')
