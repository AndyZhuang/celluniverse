"""
从 ModelScope(达摩院国内托管)拉 scFM 权重

为什么用 modelscope 而不是 HF:
- 国内阿里 CDN,速度通常 50MB/s+
- HF Mirror(HF 镜像)经常 401 限流
- ModelScope + HuggingFace 双轨:很多 scFM 作者都会同步发两边

用法:
    python scripts/download_modelscope.py
"""
import json
import os
import time
import urllib.request
from pathlib import Path

OUT = Path(__file__).parent.parent / "models"
OUT.mkdir(exist_ok=True, parents=True)


# 列表 (repo path, files, local_dir)
TASKS = [
    {
        "source": "modelscope",
        "owner": "wj1006",
        "name":  "CellVQ",
        "files": ["models.ckpt", "README.md"],   # models.ckpt 4.1GB
        "dir":   "cellvq",
        "note":  "CellVQ 主模型 — 一定要下"
    },
    # 后续接 scGPT (Bowang-lab 已发 modelscope) 等
    {
        "source": "modelscope",
        "owner": "wangzihao",
        "name":  "scGPT",
        "files": ["config.json", "best_model.pt", "scGPT_human"],
        "dir":   "scgpt",
        "note":  "scGPT 需查确切路径"
    },
]


def ms_file_url(owner, name, path):
    """构造 ModelScope file 下载 URL."""
    return f"https://modelscope.cn/api/v1/models/{owner}/{name}/resolve/{path}"


def list_repo(owner, name):
    """GET file list JSON."""
    url = f"https://www.modelscope.cn/api/v1/models/{owner}/{name}/repo/files"
    req = urllib.request.Request(url, headers={"User-Agent":"HeliaCell/0.1"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())


def download(url, dest):
    """Stream 下载到本地."""
    if dest.exists() and dest.stat().st_size > 100:
        print(f"  skip cached ({dest.stat().st_size/1024/1024:.1f} MB)")
        return dest
    print(f"  -> {dest.name} (from {url[:80]}...)")
    sys.stdout.flush()
    req = urllib.request.Request(url, headers={"User-Agent":"HeliaCell/0.1"})
    with urllib.request.urlopen(req, timeout=60) as r:
        total = int(r.headers.get('Content-Length', 0))
        chunk = 1024 * 1024
        downloaded = 0
        with open(dest, 'wb') as f:
            while True:
                buf = r.read(chunk)
                if not buf:
                    break
                f.write(buf)
                downloaded += len(buf)
                if total:
                    pct = downloaded / total * 100
                    print(f"\r  {downloaded/1024/1024:.1f}/{total/1024/1024:.1f} MB ({pct:.1f}%)", end="", flush=True)
        print()
    return dest


def main():
    import sys
    log = []
    for task in TASKS:
        if task["source"] != "modelscope":
            continue
        print(f"\n=== [{task['dir']}] {task['owner']}/{task['name']} ===")
        out_dir = OUT / task["dir"]
        out_dir.mkdir(exist_ok=True, parents=True)
        try:
            repo = list_repo(task["owner"], task["name"])
            avail = {f["Path"]: f for f in repo["Data"]["Files"]}
            for fname in task["files"]:
                if fname in avail:
                    t0 = time.time()
                    size = avail[fname]["Size"]
                    print(f"\n[{fname}]  {size/1024/1024:.1f} MB")
                    sys.stdout.flush()
                    url = ms_file_url(task["owner"], task["name"], fname)
                    dest = out_dir / fname
                    download(url, dest)
                    elapsed = time.time() - t0
                    log.append({"file": fname, "size_mb": round(size/1024/1024, 2), "elapsed_s": elapsed, "status": "ok"})
                else:
                    log.append({"file": fname, "status": "not_in_repo"})
                    print(f"  ✗ {fname} not in repo")
        except Exception as e:
            log.append({"task": task["dir"], "error": str(e)[:200], "status": "fail"})
            print(f"  ✗ {e}")

    log_path = OUT / "_modelscope_log.json"
    log_path.write_text(json.dumps(log, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\n=== {len(log)} entries, log -> {log_path} ===")


if __name__ == "__main__":
    main()
