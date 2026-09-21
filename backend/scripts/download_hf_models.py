"""HugginFace 模型权重批量下载 — 走 hf-mirror."""
import os
import sys
import json
import time
from pathlib import Path

os.environ['HF_ENDPOINT'] = 'https://hf-mirror.com'
os.environ['HUGGINGFACE_HUB_ENDPOINT'] = 'https://hf-mirror.com'

from huggingface_hub import snapshot_download

ROOT = Path(__file__).parent.parent / "models-hf"
ROOT.mkdir(exist_ok=True, parents=True)
ROOT.mkdir(exist_ok=True, parents=True)

# 计划: 下载每个主要 scFM 的预训练权重
PLANS = [
    # repo_id, 允许的文件pattern,本地目录名
    ("ctheodoris/Geneformer", None, "Geneformer"),
    ("snap-stanford/UCE", None, "UCE"),
    ("czi-ai/transcriptformer", None, "TranscriptFormer"),
    ("jkobject/scGPT", None, "scGPT"),
    ("biomap-research/scFoundation", None, "scFoundation"),
    ("Xaira-Therapeutics/X-Cell", None, "X-Cell"),
    ("A4Bio/CellVQ", None, "CellVQ"),
    ("ONERAI/scLong", None, "scLong"),
]


def main():
    log = []
    for repo_id, allow_pattern, local_name in PLANS:
        try:
            t0 = time.time()
            print(f"[{time.time():.1f}] downloading {repo_id} -> {local_name}")
            sys.stdout.flush()
            local_dir = ROOT / local_name
            local_dir.mkdir(exist_ok=True)
            try:
                path = snapshot_download(
                    repo_id=repo_id,
                    local_dir=str(local_dir),
                    local_dir_use_symlinks=False,
                    allow_patterns=allow_pattern,
                    max_workers=2,
                )
                elapsed = time.time() - t0
                size = sum(f.stat().st_size for f in Path(path).rglob('*') if f.is_file()) / 1024 / 1024
                log.append({"repo": repo_id, "local": str(local_dir), "elapsed_s": elapsed, "size_mb": round(size, 1), "status": "ok"})
                print(f"  OK  {size:.1f} MB in {elapsed:.1f}s")
            except Exception as e:
                elapsed = time.time() - t0
                log.append({"repo": repo_id, "local": str(local_dir), "elapsed_s": elapsed, "error": str(e)[:200], "status": "fail"})
                print(f"  FAIL  {e}")
            sys.stdout.flush()
        except KeyboardInterrupt:
            break

    log_path = ROOT / "_download_log.json"
    log_path.write_text(json.dumps(log, indent=2, ensure_ascii=False), encoding='utf-8')
    print(f"\n=== {len(log)} downloads, log: {log_path} ===")


if __name__ == "__main__":
    main()
