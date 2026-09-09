"""Inspect literal data only; never execute the downloaded research notebook.

Checks all 4,096 entries of the published rank-48 matrix-multiplication tensor.
Coefficients are Gaussian half-integers. Scaling by two makes the calculation
exact in small integer-valued complex arithmetic (well within float exactness).
"""
import ast
import hashlib
import json
import pathlib
import sys

root=pathlib.Path(__file__).resolve().parents[2]
file=pathlib.Path(sys.argv[1] if len(sys.argv)>1 else '/private/tmp/iwp-alphaevolve.ipynb')
raw=file.read_bytes(); notebook=json.loads(raw)
source=next(''.join(cell.get('source',[])) for cell in notebook['cells'] if ''.join(cell.get('source',[])).startswith('#@title Data\ndecomposition_444 ='))
tree=ast.parse(source)
assert len(tree.body)==1 and isinstance(tree.body[0],ast.Assign)
value=tree.body[0].value
assert isinstance(value,ast.Tuple) and len(value.elts)==3
factors=[]
for call in value.elts:
    assert isinstance(call,ast.Call) and isinstance(call.func,ast.Attribute) and call.func.attr=='array'
    assert isinstance(call.func.value,ast.Name) and call.func.value.id=='np' and len(call.args)==1
    rows=ast.literal_eval(call.args[0])
    assert len(rows)==16 and all(len(row)==48 for row in rows)
    for row in rows:
        for z in row:
            assert float(2*z.real).is_integer() and float(2*z.imag).is_integer()
    factors.append([[2*z for z in row] for row in rows])
checks=0
for a in range(16):
    for b in range(16):
        for c in range(16):
            expected=8 if a%4==b//4 and b%4==c//4 and c%4==a//4 else 0
            actual=sum(factors[0][a][r]*factors[1][b][r]*factors[2][c][r] for r in range(48))
            assert actual==expected,(a,b,c,actual,expected)
            checks+=1
data={'source':'https://github.com/google-deepmind/alphaevolve_results/blob/master/mathematical_results.ipynb','notebook_sha256':hashlib.sha256(raw).hexdigest(),'algorithm':'4 × 4 complex matrix multiplication','rank':48,'reference_strassen_rank':49,'verification':'All 4,096 tensor entries checked exactly after scaling Gaussian half-integer coefficients by two. This verifies the bilinear identity, not numerical conditioning or wall-clock speed.','checked_entries':checks,'factors_scaled_by_two':[[[[int(z.real),int(z.imag)] for z in row] for row in factor] for factor in factors]}
(root/'public/synaptic/intelligence-without-permission/alphaevolve.json').write_text(json.dumps(data,separators=(',',':'))+'\n')
print(f'PASS: {checks} exact tensor identities; rank 48; no notebook code executed.')
