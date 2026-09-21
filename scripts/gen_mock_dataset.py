"""
HeliaCell mock data generator
生成 PBMC 10k demo 数据集 (10 个 cluster + 3D embedding + 50 个基因 + 8 个 pathway)

这是临时的,直到 CellVQ inference 跑通后用真实数据替换。
用法:  python scripts/gen_mock_dataset.py
输出:  web/public/data/pbmc-demo.json
"""

import json
import math
import random
from pathlib import Path
from datetime import datetime

random.seed(42)

# 10 个 PBMC cluster (Cell Ontology 标签 + HCL 颜色)
CLUSTERS = [
    ("CD4+ T",       "T-helper lymphocyte",   "#7cf5c8"),
    ("CD8+ T",       "cytotoxic T cell",      "#ffb86b"),
    ("B cell",       "naive B cell",          "#9b8cff"),
    ("NK cell",      "natural killer cell",   "#ff7a8a"),
    ("CD14+ Mono",   "CD14-positive monocyte","#4ade80"),
    ("FCGR3A+ Mono", "non-classical monocyte","#34d399"),
    ("cDC",          "conventional dendritic cell","#fbbf24"),
    ("pDC",          "plasmacytoid dendritic cell","#facc15"),
    ("Platelet",     "platelet",              "#a3a3a3"),
    ("Doublet",      "doublet artifact",      "#94a3b8"),
]

# 50 个标记基因 (PBMC 经典),去重
MARKER_GENES_RAW = [
    "CD3D","CD3E","CD8A","CD8B","CD4","IL7R","CCR7","TCF7","LEF1","MAL",
    "GZMA","GZMB","PRF1","NKG7","GNLY","KLRD1","KLRB1","KLRK1","CTSW","CST7",
    "MS4A1","CD79A","CD79B","TCL1A","LAMP5","VPREB3","IGLL5","CD19","CD22","CD37",
    "FCGR3A","NCR1","SPON2","MYOM2","IL2RB","TBX21","PRDM1",
    "LYZ","S100A8","S100A9","CTSS","FCGR1A","LGALS2","MS4A7","CTSB","CTSD","AIF1",
    "LILRA4","IRF7","CLEC4C","CCR9","TLR7","TCF4","IRF4","IRF8","CLEC10A","CADM1",
    "B2M","HLA-A","HLA-DRA","CD74","ITGAX","CD1C","TREM1","SELL","LGALS3","IFI44",
]
# dedupe 保序
MARKER_GENES = list(dict.fromkeys(MARKER_GENES_RAW))[:50]

# 10 条 Hallmark pathways (示例)
PATHWAYS = [
    ("T-cell activation", "GO:0042110"),
    ("TNF signaling",     "GO:0033209"),
    ("Interferon response","GO:0035455"),
    ("B-cell receptor signaling","GO:0050853"),
    ("NK cell mediated immunity","GO:0045087"),
    ("Phagocytosis",      "GO:0006909"),
    ("Antigen processing","GO:0019882"),
    ("Inflammatory response","GO:0006954"),
]


def fibonacci_sphere(n, radius=1.0):
    """生成均匀分布在球面上的 n 个点 — 用作 cluster centers"""
    points = []
    phi = (1 + 5**0.5) / 2
    for i in range(n):
        z = 1 - 2 * i / (n - 1)
        r = math.sqrt(1 - z * z)
        theta = 2 * math.pi * i / phi
        x = r * math.cos(theta)
        y = r * math.sin(theta)
        points.append((x*radius, y*radius, z*radius))
    return points


def gen_cluster_cells(cluster_center, n, spread=0.18):
    """以 cluster_center 为中心生成 n 个 cells,3D Gaussian 分布"""
    cells = []
    for _ in range(n):
        x = cluster_center[0] + random.gauss(0, spread)
        y = cluster_center[1] + random.gauss(0, spread)
        z = cluster_center[2] + random.gauss(0, spread)
        cells.append((x, y, z))
    return cells


def main():
    n_clusters = len(CLUSTERS)
    cells_per_cluster = 100  # 总数 1000 cells — demo 量级
    cluster_centers = fibonacci_sphere(n_clusters, radius=2.5)

    cells = []
    cell_idx = 0
    for (name, _desc, _color), center in zip(CLUSTERS, cluster_centers):
        positions = gen_cluster_cells(center, cells_per_cluster, spread=0.4)
        for (x, y, z) in positions:
            # code: 每 cluster 一个独特的 4-bit code (CellVQ-style VQ)
            code = (cell_idx * 7919 + 13) % (2**12)  # 12-bit codebook
            cells.append({
                "id": cell_idx,
                "x": round(x, 4),
                "y": round(y, 4),
                "z": round(z, 4),
                "code": code,
                "cluster": name,
                "cell_type": name,
                "confidence": round(0.85 + random.random() * 0.15, 3),
            })
            cell_idx += 1

    clusters = {}
    for i, (name, desc, color) in enumerate(CLUSTERS):
        ids = [c["id"] for c in cells if c["cluster"] == name]
        clusters[name] = {
            "name": name,
            "color": color,
            "ids": ids,
            "description": desc,
        }

    # 基因表达 — 每个基因有一个 cluster "preferred" 关系
    expression = {}
    gene_info = []
    for g_idx, gene in enumerate(MARKER_GENES):
        gene_info.append({
            "symbol": gene,
            "cluster_score": {},
        })
        # 该基因表达的 cell-level 值
        per_cell = []
        preferred_cluster = CLUSTERS[(g_idx * 17) % n_clusters][0]
        for cell in cells:
            if cell["cluster"] == preferred_cluster:
                # 该 cluster 高表达
                base = random.uniform(0.55, 1.0)
            else:
                base = random.uniform(0.0, 0.35)
            per_cell.append(round(base + random.gauss(0, 0.05), 4))
        expression[gene] = per_cell

    # 通路活性 (cells x pathways)
    pathways = []
    for p_idx, (pname, pcode) in enumerate(PATHWAYS):
        activity = []
        for cell in cells:
            cluster_idx = next(i for i, (n, _, _) in enumerate(CLUSTERS) if n == cell["cluster"])
            # 该 cluster 与该 pathway 的 affinity via 偏移
            affinity = math.sin((cluster_idx + p_idx) * 0.7) * 0.5 + 0.5
            activity.append(round(affinity + random.gauss(0, 0.1), 4))
        pathways.append({
            "name": pname,
            "hall_mark": pcode,
            "activity": activity,
        })

    dataset = {
        "summary": {
            "id": "pbmc-demo",
            "name": "PBMC 10k — Demo",
            "description": "Mock PBMC dataset for HeliaCell. Real data: replace with CellVQ inference output on PBMC 10x v3.",
            "source": "synthetic (10 clusters × 100 cells)",
            "n_cells": len(cells),
            "embedding_method": "Fibonacci sphere + Gaussian (mock)",
            "generated_by": "mock",
            "cell_ontology_version": "CL 2026-09",
        },
        "cells": cells,
        "clusters": clusters,
        "genes": gene_info,
        "expression": expression,
        "pathways": pathways,
        "updated_at": datetime.now().isoformat() + "Z",
    }

    out = Path(__file__).parent.parent / "web" / "public" / "data" / "pbmc-demo.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    with open(out, "w", encoding="utf-8") as f:
        json.dump(dataset, f, ensure_ascii=False)
    print(f"✓ wrote {out}")
    print(f"  {len(cells)} cells / {len(clusters)} clusters / {len(expression)} genes / {len(pathways)} pathways")


if __name__ == "__main__":
    main()
