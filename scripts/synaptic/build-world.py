"""Rebuild the Natural Earth land projection from a downloaded GeoJSON file.

Usage: python3 scripts/synaptic/build-world.py /path/to/ne_110m_land.geojson
Download source: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson
Input hash must match the source used for this research edition.
"""
import hashlib,json,pathlib,sys
raw=pathlib.Path(sys.argv[1]).read_bytes()
digest=hashlib.sha256(raw).hexdigest()
assert digest=='9e0729ee253ca7d7a5c4ae9395fb1902264c5377c52e224d13dd85010e2835d9','Source changed; inspect before regenerating.'
data=json.loads(raw); paths=[]
for feature in data['features']:
    geometry=feature['geometry']
    polygons=[geometry['coordinates']] if geometry['type']=='Polygon' else geometry['coordinates']
    for polygon in polygons:
        paths.append(''.join('M'+'L'.join(f'{(lon+180)*2.5:.2f},{(90-lat)*2.5:.2f}' for lon,lat in ring)+'Z' for ring in polygon))
out={'paths':paths,'projection':'Equirectangular; 2.5 SVG units per degree; viewBox 0 0 900 450','source':'https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_land.geojson','licence':'Natural Earth public domain','sha256':digest}
destination=pathlib.Path(__file__).resolve().parents[2]/'public/synaptic/intelligence-without-permission/world-land.json'
destination.write_text(json.dumps(out,separators=(',',':'))+'\n')
print(f'{len(paths)} polygons; source hash verified.')
