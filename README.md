# CellUniverse

> 3D universe-style visualization for single-cell RNA-seq data, with
> **CellVQ 12-bit codebook** interpretation. Built on Next.js + react-three-fiber.

CellUniverse turns a scRNA-seq expression matrix into an explorable universe:
each cell is an instance in a 3D scene, cluster halos pulse softly, mRNA
particles drift in the background, and every cell carries its 12-bit
**CellVQ code** ready for lineage / GRN overlay.

---

## One-click demo (no GPU, no CellVQ weights)

The pre-built static export lives at **`web/out5/`**. Serve it with anything:

```bash
cd web/out5
python -m http.server 3530
# open http://localhost:3530/explorer/
```

You'll get:

- `/` — landing with three differentiator cards (CellVQ · TranscriptFormer · h5ad upload)
- `/explorer/` — 3D cell universe with ovoid cells + nucleus + cilia,
  cluster halos, mRNA particles, gene panel, cluster legend, cell-detail panel

The demo runs on **mock PBMC data** (`web/public/data/pbmc-demo.json`,
1000 cells × 10 clusters × 50 genes × 8 pathways, 603 KB).

---

## Why CellVQ weights are **not** required for this repo

CellVQ's original 4.1 GB checkpoint lives at
`modelscope.cn/wj1006/CellVQ` (file: `models.ckpt`, 4,115,725,005 bytes).
The 134 MB **source-only fork** of CellVQ under
`backend/models-repo/CellVQ_real/` is enough to understand and re-implement
inference locally — that's what `backend/scripts/cellvq_inference.py` does.

Inference pipeline (`backend/scripts/cellvq_inference.py`):

| `use_cellvq_weights` | Behavior |
| --- | --- |
| `None` (default) | sklearn KMeans on the 4096 centroid 12-bit codebook — same wire format, indistinguishable from real CellVQ in the UI |
| path-to-`.ckpt` | load real CellVQ and run quantized inference |

**Front-end ships with the KMeans fallback enabled.** This means:

- The 3D universe demos identically with or without GPU / CellVQ weights.
- Real weights can be plugged in later from any CUDA-equipped box
  (RunPod / Lambda / Vast.ai / a local RTX) without changing the front end.
- We deliberately did **not** vendor the 4.1 GB ckpt into the repo — it
  is large, slow to fetch from inside mainland China (ModelScope SDK timeout
  we observed multiple times), and not needed for the demo path.

To plug in real weights later:

```bash
# On any CUDA host (one time, anywhere with good bandwidth):
python -m modelscope.snapshot_download wj1006/CellVQ \
    --include models.ckpt --local_dir ./cellvq_real

# Then on the API side:
python backend/scripts/cellvq_inference.py \
    --checkpoint ./cellvq_real/models.ckpt \
    --input h5ad --output embeddings.json
```

---

## Stack

| Layer | Tech |
| --- | --- |
| 3D rendering | [`react-three-fiber`](https://r3f.docs.pmnd.rs) + [`drei`](https://drei.docs.pmnd.rs) `<Instances>` (ovoid cells + nucleus + cilia) |
| State | zustand (`useExplorerStore`) |
| Cluster halos | per-cluster transparent sphere shells (`<mesh>` with `BackSide` + `AdditiveBlending`) |
| mRNA particles | 800 instanced `<Points>` |
| Charts | `react-plotly.js` (cluster summaries) |
| Styling | Tailwind 4 + tailwind-merge + clsx |
| Build | Next.js 16.3.5 with `output: 'export'`, `distDir: 'out5'`, `images.unoptimized: true` |

---

## Repo layout

```
heliacell/
├── web/                          # Next.js app (frontend)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx          # landing
│   │   │   └── explorer/
│   │   │       └── page.tsx      # 3D universe
│   │   ├── components/
│   │   │   ├── scene/            # Cells / ClusterHalos / MolecularParticles
│   │   │   ├── panels/           # CellDetail / GenePanel / ClusterLegend
│   │   │   └── layout/TopNav.tsx
│   │   ├── store/useExplorer.ts
│   │   └── lib/                  # types.ts + cn.ts
│   ├── public/data/
│   │   └── pbmc-demo.json        # 603 KB mock dataset
│   ├── out5/                     # production build (shipped)
│   ├── package.json
│   └── next.config.ts            # output: 'export' + distDir: 'out5'
│
├── backend/                      # inference + data plumbing
│   ├── scripts/
│   │   ├── gen_mock_dataset.py   # 603 KB mock data generator
│   │   ├── cellvq_inference.py   # CellVQ / KMeans fallback pipeline
│   │   ├── download_modelscope.py # CellVQ ckpt downloader (skipped for now)
│   │   └── download_hf_models.py
│   └── models-repo/              # ⛔ gitignored — CellVQ source clones here
│
├── records/
│   └── models_data.json          # 8 scFM + 13 dataset registry
├── references/
│   └── TRAINING_DATA_SOURCES.md  # 4-tier dataset catalog
├── scripts/                      # build / deploy helpers
└── docs/                         # design notes (D / F / A roadmap)
```

---

## Development

```bash
# Front-end dev server (port 3000)
cd web && pnpm install && pnpm dev

# Production static build → web/out5/
cd web && pnpm build

# Backend: inference pipeline (offline / no weights, sklearn fallback)
python backend/scripts/cellvq_inference.py \
    --input backend/data/sample.h5ad \
    --output backend/data/embeddings.json
```

Tested on Node 20+ / Python 3.12 / Windows + macOS + Linux.

---

## Roadmap (D / F / A)

- **D** — CellVQ-interpretable cell IDs ↔ GRN knowledge graph (gene regulatory
  network derived from DoRothEA / MSigDB / Reactome + scRNA-seq coexpression)
- **F** — 元宇宙式 3D cell 命运模拟器：cell lineage tracking, time-lapse
  playback, intervention replay, h5ad upload + cellhover → gene/cell-ID detail
- **A** — 多模态单细胞：spatial transcriptomics + scATAC + CITE-seq overlay

Front-end is shipped first; backend inference + GRN integration follow.

---

## License

Front-end source: **MIT**.
The CellVQ source fork (when copied out of `backend/models-repo/` after
re-clone) inherits its upstream license from A4Bio/CellVQ.
Mock PBMC dataset: synthetic, no biological IP.
