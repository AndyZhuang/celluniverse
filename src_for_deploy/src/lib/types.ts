// HeliaCell - core types
// 数据契约:前端 + 后端 inference 共用

export type CellId = number;

export interface CellMetadata {
  id: CellId;
  /** 3D embedding 坐标 (UMAP/TNSE/PCA → padded) */
  x: number;
  y: number;
  z: number;
  /** CellVQ 离散码 (4-bit codebook = 16 种状态,11/12-bit codebook = 2K-4K) */
  code: number;
  /** 归属 cluster label */
  cluster: string;
  /** 细胞本体 (CL ontology) 标注 */
  cell_type: string;
  /** 是否高置信,用于可视化亮暗 */
  confidence?: number;
}

export interface ClusterInfo {
  name: string;
  /** cluster 整体颜色 (HCL) */
  color: string;
  /** 包含 cell ids */
  ids: CellId[];
  /** 描述 (cell ontology 中该 cluster 的本体字符串) */
  description?: string;
  parent?: string;
}

export interface GeneInfo {
  symbol: string;
  /** 该 cluster 整体上 avg expression,用于 cluster 排序 */
  cluster_score?: Record<string, number>;
}

export interface PathwayInfo {
  name: string;
  hall_mark: string;
  /** cell x pathway 活性矩阵 */
  activity: number[];
}

export interface DatasetSummary {
  id: string;
  name: string;
  description: string;
  source: string;
  n_cells: number;
  embedding_method: string;
  generated_by: 'cellvq' | 'transcriptformer' | 'uce' | 'scgpt' | 'mock';
  cell_ontology_version?: string;
}

export interface Dataset {
  summary: DatasetSummary;
  cells: CellMetadata[];
  clusters: Record<string, ClusterInfo>;
  /** 关注的基因 symbol 列表 */
  genes: GeneInfo[];
  /** cells x genes 表达矩阵 (稀疏,float in [0,1] log-normalised) */
  expression: Record<string, number[]>;
  /** 通路活动矩阵 */
  pathways: PathwayInfo[];
  /** 编辑时间 */
  updated_at: string;
}
