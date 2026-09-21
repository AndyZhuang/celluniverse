"""
直接 REST API 抓 GRN + pathways, 不用 Python 包依赖

数据源:
- OmniPath interactions: https://omnipathdb.org/interactions?fields=sources,references,...
- MSigDB Hallmark: gene set from https://www.gsea-msigdb.org/gsea/msigdb/human/...
- Reactome JSON: https://reactome.org/ContentService/

输出: 
  D:\合曜AI\projects\heliacell\backend\data\
    - dorothea_human_interactions.csv        (TF → target relations)
    - omnipath_interactions.json              (cleaned)
    - hallmark_pathways.json
    - reactome_top.json
"""
import json
import time
from pathlib import Path
import urllib.request
import urllib.parse

OUT = Path(__file__).parent.parent / "data" / "raw"
OUT.mkdir(parents=True, exist_ok=True)


def fetch(url, dest, retries=3):
    """GET -> bytes -> file"""
    if dest.exists() and dest.stat().st_size > 100:
        print(f"  skip cached {dest.name} ({dest.stat().st_size/1024:.1f} KB)")
        return dest
    for i in range(retries):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'HeliaCell/0.1'})
            with urllib.request.urlopen(req, timeout=30) as r:
                data = r.read()
            dest.write_bytes(data)
            print(f"  ✓ {dest.name} ({len(data)/1024:.1f} KB)")
            return dest
        except Exception as e:
            print(f"  retry {i+1}/{retries} {e}")
            time.sleep(2)
    print(f"  ✗ {dest.name} failed after {retries} tries")
    return None


# === A. DoRothEA TF-target (lightweight CSS) ===
print("[1] DoRothEA (regulon)...")
# 用对 endpoint — DoRothEA 本身有专门的 download URL
url = "https://omnipathdb.org/interactions?partners=yes&organisms=9606&datasets=DoRothEA&fields=sources,references&format=json"
f = fetch(url, OUT / "dorothea_tf_target.json")
if f is None:
    # fallback: 直接用 GitHub raw DoRothEA 包
    fallback = "https://raw.githubusercontent.com/saezlab/DoRothEA/master/data/DoRothEA regulons.tsv"
    f = fetch(fallback, OUT / "dorothea_regulons.tsv")


# === B. MSigDB Hallmark via web (gene sets JSON) ===
print("[2] MSigDB Hallmark gene sets...")
# Try direct via gmt format - 实际 gsea-msigdb 可能不允许 programmatic fetch,改用 OmniPath
h_url = "https://omnipathdb.org/annotations?datasets=hallmark&organisms=9606&format=tsv"
h_path = OUT / "hallmark_pathways.tsv"
f = fetch(h_url, h_path)
if f is None:
    # fallback: MSigDB JSON API
    fallback = "https://www.gsea-msigdb.org/gsea/json/msigdb?geneSetNames=HALLMARK_APOPTOSIS&organism=hs"
    f = fetch(fallback, OUT / "hallmark_apoptosis.json")


# === C. Reactome pathways top (light dump) ===
print("[3] Reactome top...")
r_url = "https://reactome.org/ContentService/data/pathways/homo+sapiens"
f = fetch(r_url, OUT / "reactome_top.json")


# === D. Pathway-Activity (MSigDB full Hallmark via OmniPath) ===
print("[4] OmniPath pathway activity annotations...")
p_url = "https://omnipathdb.org/annotations?datasets=PathwayExtra,KEGG,Reactome&organisms=9606&format=tsv"
f = fetch(p_url, OUT / "pathway_annotations.tsv")


print("\n=== all downloads done ===")
print(f"output dir: {OUT}")
for p in OUT.iterdir():
    print(f"  {p.name}: {p.stat().st_size/1024:.1f} KB")
