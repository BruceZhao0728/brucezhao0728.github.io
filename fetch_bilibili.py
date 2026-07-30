#!/usr/bin/env python3
"""
Bilibili Video Fetcher
从 Bilibili API 获取用户视频列表，生成静态 JSON 文件供前端使用。

依赖:
    pip install requests

用法:
    python fetch_bilibili.py [UID]

    如果不传 UID，默认使用下方 BILIBILI_UID 的值。

生成文件:
    data/bilibili-videos.json
"""

import hashlib
import json
import os
import sys
import time
import urllib.parse

import requests

# ========================================
# 配置 - 修改为你的 Bilibili UID
# ========================================
BILIBILI_UID = "1989971992"
VIDEO_COUNT = 12  # 最多获取的视频数量

# 脚本所在目录
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(SCRIPT_DIR, "data")
OUTPUT_FILE = os.path.join(DATA_DIR, "bilibili-videos.json")

# WBI 混排置换表 (自 2023 年 3 月至今未变)
MIX_ORDER = [
    46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35,
    27, 43, 5, 49, 33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13,
    37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4,
    22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11, 36, 20, 34, 44, 52
]

# WBI 签名时需要过滤的特殊字符
WBI_FILTER_CHARS = set("!'()*")


def wbi_encode(value):
    """
    WBI 签名专用的 URL 编码。
    使用小写十六进制编码（urllib.parse.quote 默认行为）。
    """
    value = str(value)
    # 过滤 !'()* 字符
    value = "".join(c for c in value if c not in WBI_FILTER_CHARS)
    return urllib.parse.quote(value, safe="")


def get_wbi_keys(session):
    """
    从 Bilibili nav 接口获取 WBI 签名密钥对。
    即使未登录（code=-101），wbi_img 数据仍然会返回。
    """
    resp = session.get(
        "https://api.bilibili.com/x/web-interface/nav",
        headers={"Referer": "https://www.bilibili.com/"},
    )
    data = resp.json()
    wbi_img = data.get("data", {}).get("wbi_img", {})

    img_url = wbi_img.get("img_url", "")
    sub_url = wbi_img.get("sub_url", "")

    # 从 URL 中提取文件名（不含扩展名）
    img_key = os.path.splitext(os.path.basename(
        urllib.parse.urlparse(img_url).path))[0]
    sub_key = os.path.splitext(os.path.basename(
        urllib.parse.urlparse(sub_url).path))[0]

    if not img_key or not sub_key:
        return None

    return img_key, sub_key


def mix_wbi_key(img_key, sub_key):
    """混合 img_key 和 sub_key 生成 WBI 签名密钥"""
    combined = img_key + sub_key
    result = ""
    for pos in MIX_ORDER:
        if pos < len(combined):
            result += combined[pos]
    return result[:32]


def sign_wbi_params(params, mix_key):
    """
    对请求参数进行 WBI 签名，返回添加了 w_rid 和 wts 的参数字典。
    使用 Bilibili 官方规范的大写十六进制编码。
    """
    sp = dict(params)
    sp["wts"] = int(time.time())

    # 按 key 字母序排序，使用 WBI 专用编码构建查询字符串
    sorted_keys = sorted(sp.keys())
    qs_parts = []
    for k in sorted_keys:
        encoded_k = wbi_encode(k)
        encoded_v = wbi_encode(sp[k])
        qs_parts.append(f"{encoded_k}={encoded_v}")
    query_string = "&".join(qs_parts)

    # MD5 签名（小写十六进制）
    sign_str = query_string + mix_key
    sp["w_rid"] = hashlib.md5(sign_str.encode("utf-8")).hexdigest()

    return sp


def format_count(num):
    """格式化数字为中文计数"""
    if num is None:
        return "0"
    num = int(num)
    if num >= 10000:
        return f"{num / 10000:.1f}万"
    return str(num)


def format_duration(value):
    """
    格式化时长。
    Bilibili API 返回的 length 字段有两种格式：
    - 纯数字字符串（秒数），如 "245"
    - 已格式化的 mm:ss，如 "04:05"
    """
    if value is None or value == "":
        return "0:00"
    value = str(value).strip()
    if ":" in value:
        return value
    seconds = int(value)
    h = seconds // 3600
    m = (seconds % 3600) // 60
    s = seconds % 60
    if h > 0:
        return f"{h}:{m:02d}:{s:02d}"
    return f"{m}:{s:02d}"


def _parse_vlist(data, uid):
    """解析 Bilibili API 返回的视频列表"""
    vlist = data.get("data", {}).get("list", {}).get("vlist", [])
    if not vlist:
        return []

    videos = []
    for v in vlist:
        bvid = v.get("bvid", "")
        cover = v.get("pic", "")
        if cover.startswith("http://"):
            cover = cover.replace("http://", "https://", 1)

        videos.append({
            "bvid": bvid,
            "aid": v.get("aid", 0),
            "title": v.get("title", ""),
            "description": v.get("description", ""),
            "cover": cover,
            "playCount": v.get("play", 0),
            "danmakuCount": v.get("video_review", 0),
            "commentCount": v.get("comment", 0),
            "duration": format_duration(v.get("length", 0)),
            "durationSeconds": v.get("length", 0),
            "created": v.get("created", 0),
            "url": f"https://www.bilibili.com/video/{bvid}",
            "authorName": v.get("author", ""),
            "mid": v.get("mid", uid),
        })

    return videos


def _create_session():
    """创建一个预热的 session，先访问 B 站首页获取基础 cookies"""
    session = requests.Session()
    session.headers.update({
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36"
        ),
    })

    # 预热：先访问 B 站首页获取 Cookie
    try:
        print("  预热会话（访问 B 站首页）...")
        session.get("https://www.bilibili.com/", timeout=10)
    except Exception:
        pass

    return session


def fetch_videos(uid, count=12, max_retries=5):
    """
    从 Bilibili 获取用户视频列表，带回退和重试机制。
    """
    # 1. 预热 session
    session = _create_session()
    time.sleep(1)

    # 2. 获取 WBI 密钥
    print("  正在获取 WBI 密钥...")
    keys = get_wbi_keys(session)

    if not keys:
        raise RuntimeError("无法获取 WBI 密钥")

    img_key, sub_key = keys
    mix_key = mix_wbi_key(img_key, sub_key)
    print("  WBI 密钥已获取")

    # 3. 请求之间暂缓
    time.sleep(1.5)

    # 4. 尝试请求
    base_params = {
        "mid": uid,
        "ps": count,
        "tid": 0,
        "pn": 1,
        "keyword": "",
        "order": "pubdate",
    }

    last_error = None
    for attempt in range(1, max_retries + 1):
        if attempt > 1:
            wait = attempt * 6  # 6s, 12s, 18s...
            print(f"  第 {attempt} 次重试（等待 {wait}s）...")
            time.sleep(wait)
            # 重建 session 和密钥
            session = _create_session()
            keys = get_wbi_keys(session)
            if keys:
                mix_key = mix_wbi_key(keys[0], keys[1])

        # 签名参数
        signed = sign_wbi_params(base_params, mix_key)
        final_parts = []
        for k in sorted(signed.keys()):
            final_parts.append(
                f"{urllib.parse.quote(str(k))}={urllib.parse.quote(str(signed[k]))}"
            )
        url = "https://api.bilibili.com/x/space/wbi/arc/search?" + "&".join(final_parts)

        print(f"  正在获取视频列表 (attempt {attempt}/{max_retries})...")
        resp = session.get(
            url,
            headers={"Referer": "https://space.bilibili.com/"},
        )

        # 412: Cloudflare/WAF 拦截
        if resp.status_code == 412:
            print(f"  收到 412 (风控)，等待后重试...")
            last_error = RuntimeError("HTTP 412 (风控拦截)")
            continue

        if resp.status_code != 200:
            raise RuntimeError(f"HTTP {resp.status_code}")

        data = resp.json()
        code = data.get("code", -1)

        if code == 0:
            videos = _parse_vlist(data, uid)
            print(f"  成功获取 {len(videos)} 个视频")
            return videos

        if code == -352:
            print("  签名验证失败 (-352)")
            last_error = RuntimeError(f"API 错误码 {code}: {data.get('message', '')}")
            continue

        # 其他 API 错误
        raise RuntimeError(f"API 错误码 {code}: {data.get('message', '未知错误')}")

    raise last_error or RuntimeError("超过最大重试次数")


def main():
    uid = sys.argv[1] if len(sys.argv) > 1 else BILIBILI_UID

    if not uid or uid == "YOUR_UID_HERE":
        print("错误: 请先配置 Bilibili UID！")
        print(f"编辑此脚本文件，修改 BILIBILI_UID 变量，")
        print(f"或通过命令行传入: python fetch_bilibili.py <你的UID>")
        sys.exit(1)

    print("Bilibili 视频数据获取工具")
    print("=" * 40)
    print(f"UID: {uid}")

    try:
        videos = fetch_videos(uid, VIDEO_COUNT)
    except Exception as e:
        print(f"\n获取视频失败: {e}")
        videos = []
        output = {
            "uid": uid,
            "updated": int(time.time()),
            "updatedStr": time.strftime("%Y-%m-%d %H:%M:%S"),
            "count": 0,
            "videos": [],
            "error": str(e),
        }
    else:
        output = {
            "uid": uid,
            "updated": int(time.time()),
            "updatedStr": time.strftime("%Y-%m-%d %H:%M:%S"),
            "count": len(videos),
            "videos": videos,
        }

    # 确保 data 目录存在
    os.makedirs(DATA_DIR, exist_ok=True)

    # 写入 JSON 文件
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n数据已写入: {OUTPUT_FILE}")
    print(f"视频数量: {output['count']}")
    print(f"更新时间: {output['updatedStr']}")

    if videos:
        print("\n视频列表:")
        for i, v in enumerate(videos, 1):
            print(f"  {i}. {v['title']}  (播放 {format_count(v['playCount'])})")


if __name__ == "__main__":
    main()
