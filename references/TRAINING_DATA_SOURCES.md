# CellUniverse — 训练集与数据源参考

> 一次性盘点"训练集从哪里来",省得每次重复回答。

## 1. 单细胞 (scRNA-seq) 公共数据库 — 我们 scFM 的训练数据

### Tier 1 · 规模化 (10M+ cells) — CellUniverse 优先用
| 名称 | 规模 | 物种 | 申请 | URL |
|---|---|---|---|---|
| **CZ CELLxGENE Discover Census** | **65M+ cells** | 人 + 鼠 + 其它 | 完全公开,无审批 | `https://chanzuckerberg.github.io/cell-census/` |
| **Tabula Sapiens** | 24M cells | 24 种人体组织 / 人类 | 完全公开 | `https://tabula-sapiens-portal.ds.czbiohub.org/` |
| **Human Cell Atlas** | 50M+ cells,分批次 | 人类多种组织 | 注册申请 | `https://www.humancellatlas.org/` |

### Tier 2 · 专门化(perturbed / 疾病 / 发育)
| 名称 | 规模 | 类型 | URL |
|---|---|---|---|
| **Tahoe-100M** | 100M cells, 50 cancer lines × 1100 drugs | 药物扰动 | `https://www.tahoebio.com/` |
| **Replogle-Nadig** | 5M+ cells, genome-wide CRISPRi | 基因扰动 | `https://replogle.org/` |
| **Parse-PBMC** | ~5M cells,cytokine perturbation | 细胞因子扰动 | https://parsebiosciences.com/ |
| **GTEx** | 几十万 cells, 各种人体组织 | 正常 | `https://gtexportal.org/` |
| **Allen Brain Map** | 几百万 cells, 脑区 | 神经 | `https://portal.brain-map.org/` |

### Tier 3 · 跨物种 (TranscriptFormer 训练用)
| 名称 | 物种 |
|---|---|
| zebrafish scAtlas | 斑马鱼 |
| Mouse Cell Atlas | 小鼠 |
| Tabula Muris | 小鼠 |
| CelEsTI (Worm) | 蠕虫 C. elegans |
| Fly Cell Atlas | 果蝇 |
| ZFIN (zebrafish) | 斑马鱼 |

### Tier 4 · 中国机构数据(商业授权)
| 机构 | 内容 |
|---|---|
| **华大 BGIAZ** | 中国人队列 + 罕见病 + 肿瘤 |
| **诺禾致源** | 临床肿瘤测序 |
| **思路迪** | 肿瘤伴随诊断 |
| **燃石医学** | ctDNA + scRNA |
| **世和基因** | 实体瘤 |
| **吉因加** | 实体瘤 + 液体活检 |

> 合作模式:数据出借 / 联合开发 / 上市后产品回扣。需签 BD 协议 (6–9 个月)。

## 2. 基因组 + 调控数据库 (我们扩展时用)

| 层级 | 数据 | 来源 |
|---|---|---|
| Gene metadata | NCBI Gene, Ensembl, HGNC | 公开 |
| Protein embedding | **ESM-2** (650M 参数蛋白质 LLM) | Meta AI,免费 Python API |
| 调控网络 (GRN) | DoRothEA, RegNetwork, OmniPath | 公开 |
| Transcription factor motifs | JASPAR | 公开 |
| 染色质 (3D) | 4DN Hi-C / Micro-C | 注册申请 |
| 启动子 / enhancer | ENCODE | 公开 |
| 通路 | MSigDB Hallmark, KEGG, Reactome | 公开 |

## 3. 评估 & 对比数据集

| 名称 | 用途 |
|---|---|
| **Tahoe-100M MoA-fine** | 测试药物 MoA 预测 |
| **Cell-Eval (State 团队)** | 测试扰动效应预测,3 维度(PCC / DEG / magnitude) |
| **scEval (Yale)** | 8 任务 29 数据集 FMs vs 传统方法对照 |
| **scGraph-OntoRWR** | 基于 Cell Ontology 的相关图测度 |
| **LCAD** | 本体论最近共同祖先距离(分类错误的生物学严重性) |
| **PMLB / Tabula Sapiens v2** | 看 zero-shot 泛化 |

## 4. 我们 CellUniverse 的 fetch 计划(下一步)

```
Phase 1 (now):
  scanpy.datasets.pbmc68k()           — 真实 PBMC 数据,30 分钟接进来替换 mock
  scanpy.tl.pca(adata) + 3D scatter    — 主成分分析出的真实 3D 嵌入

Phase 2 (CellVQ ready 后):
  CellVQ.quantize() 嵌入 pre-trained CellVQ 模型
  真实 CellVQ 12-bit 二进制码

Phase 3 (BD 进来后):
  中国临床合作数据 → finetune 在 TF-Sapiens 上
  CellVQ-graph 集成(用 CellVQ 的代码作为图节点)
  GRN 知识图谱叠加(Force-directed 边)
```

## 5. CellUniverse 已经接入的(文件层面)

| 文件 | 来源 |
|---|---|
| `web/public/data/pbmc-demo.json` | 模拟 (待替换) |
| (后续待加) `web/public/data/pbmc-68k-real.json` | scanpy.datasets.pbmc68k() |
| (后续待加) `web/public/data/cellvq-pbmc.json` | CellVQ inference |
| (后续待加) `web/public/data/gene-graph.json` | DoRothEA + RegNetwork 合 |

---

**版本**: 2026-09-20 · **作者**: MiniMax Code · **许可**: MIT
