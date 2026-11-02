"""Builds tunnel-vision/ads/tunnel-vision-300x250.json, a Lottie (bodymovin 5.7) banner.
Usage: python3 -I make_lottie.py <photo 600x500 jpg> <out json> <headline 1 png> <headline 2 png>"""
import base64, json, math, sys

photo, out = sys.argv[1], sys.argv[2]
W, H, FR, OP = 300, 250, 30, 240
INK = [0.027, 0.035, 0.043, 1]
BONE = [0.949, 0.937, 0.91]
CYAN = [0.361, 0.882, 0.902]

def ease(t, v):
    return {"t": t, "s": v if isinstance(v, list) else [v], "i": {"x": [0.2], "y": [1]}, "o": {"x": [0.7], "y": [0]}}

def anim(*frames):
    ks = [ease(t, v) for t, v in frames]
    ks[-1] = {"t": ks[-1]["t"], "s": ks[-1]["s"]}
    return {"a": 1, "k": ks}

def static(v):
    return {"a": 0, "k": v}

def tr(p=(0, 0), s=100, o=100, r=0, a=(0, 0)):
    return {
        "o": o if isinstance(o, dict) else static(o),
        "r": r if isinstance(r, dict) else static(r),
        "p": p if isinstance(p, dict) else static([p[0], p[1], 0]),
        "a": static([a[0], a[1], 0]),
        "s": s if isinstance(s, dict) else static([s, s, 100]),
    }

layers = []
def layer(ty, nm, ks, **extra):
    l = {"ddd": 0, "ind": len(layers) + 1, "ty": ty, "nm": nm, "sr": 1, "ks": ks, "ao": 0, "ip": 0, "op": OP, "st": 0, "bm": 0}
    l.update(extra)
    layers.append(l)

def rect_group(w, h, c, radius=0, opacity=100, pos=(0, 0)):
    return {"ty": "gr", "nm": "rect", "it": [
        {"ty": "rc", "d": 1, "s": static([w, h]), "p": static(list(pos)), "r": static(radius)},
        {"ty": "fl", "c": static(c), "o": static(opacity), "r": 1, "bm": 0},
        {"ty": "tr", "p": static([0, 0]), "a": static([0, 0]), "s": static([100, 100]), "r": static(0), "o": static(100), "sk": static(0), "sa": static(0)},
    ]}

def text(nm, t, size, color, font, pos, ks_extra=None, j=0, cl=None):
    doc = {"s": size, "f": font, "t": t, "j": j, "tr": 0, "lh": size * 1.0, "ls": 0, "fc": color}
    ks = tr(pos)
    if ks_extra:
        ks.update(ks_extra)
    extra = {"t": {"d": {"k": [{"s": doc, "t": 0}]}, "p": {}, "m": {"g": 1, "a": static([0, 0])}, "a": []}}
    if cl:
        extra["cl"] = cl
    layer(5, nm, ks, **extra)

# --- Top of stack first ---------------------------------------------------------
text("Spec label", "SPEC", 8, [0.95, 0.94, 0.91], "Archivo-Bold", (272, 245))

# End frame: CTA, lockup, meta.
pop = {"o": anim((168, 0), (178, 100)), "s": anim((168, [80, 80, 100]), (182, [100, 100, 100]))}
text("CTA label", "Shop the fits", 12.5, list(INK[:3]), "Archivo-ExtraBold", (0, 4.5), j=2,
     ks_extra={"p": static([226, 222, 0]), **pop})
layer(4, "CTA pill", {**tr((226, 222)), **pop}, shapes=[rect_group(104, 30, CYAN + [1], radius=15)])
fade = lambda t0: {"o": anim((t0, 0), (t0 + 12, 100)), "p": anim((t0, [16, 238, 0]), (t0 + 14, [16, 232, 0]))}
text("Lockup PUMA x prime video", "PUMA  ×  prime video", 12, BONE, "Archivo-Black", (16, 232), ks_extra=fade(164))
text("Meta", "Black Friday Gameday · 27 Nov · Live on Prime Video", 11, BONE, "Archivo-Bold", (16, 203),
     ks_extra={"o": anim((156, 0), (168, 100)), "p": anim((156, [16, 209, 0]), (170, [16, 203, 0]))})

# Headline: two lines arrive big, then settle small above the end frame. They are images rendered from
# Archivo Extra Condensed Black, because lottie-web spaces live text at the font's normal width.
k = 268 / 674 * 100
def head(nm, ref, y0, y1, y2, t0):
    layer(2, nm, {**tr(), "a": static([0, 0, 0]),
        "o": anim((t0, 0), (t0 + 14, 100)),
        "p": anim((t0, [16, y0 + 20, 0]), (t0 + 18, [16, y0, 0]), (132, [16, y0, 0]), (152, [16, y1, 0])),
        "s": anim((132, [k, k, 100]), (152, [k * 0.76, k * 0.76, 100]))}, refId=ref)
head("Headline 1 EVERYBODY GETS", "img_h1", 56, 132, None, 10)
head("Headline 2 A TUNNEL WALK.", "img_h2", 94, 160, None, 52)

# Ceiling strip lights flick on in sequence.
for i in range(4):
    x = 34 + i * 77
    t0 = 2 + i * 4
    layer(4, f"Strip {i + 1}", {**tr((x, 1.5)), "o": anim((t0, 0), (t0 + 2, 100), (t0 + 4, 15), (t0 + 6, 100))},
          shapes=[rect_group(44, 3, CYAN + [1], radius=1.5)])

# Light bars rushing out of the vanishing point: you are walking down the tunnel.
VP = (118, 112)
for side, target in (("L", (-30, -20)), ("R", (330, -18))):
    ang = math.degrees(math.atan2(target[1] - VP[1], target[0] - VP[0]))
    for k in range(3):
        kfs_p, kfs_s, kfs_o = [], [], []
        for start in range(k * 14 - 42, OP, 42):
            end = start + 42
            kfs_p += [(max(start, 0), [VP[0], VP[1], 0]), (end, [target[0], target[1], 0])]
            kfs_s += [(max(start, 0), [8, 8, 100]), (end, [170, 170, 100])]
            kfs_o += [(max(start, 0), 0), (start + 10, 70), (end, 90)]
        def lin(fr):
            ks = [{"t": t, "s": v if isinstance(v, list) else [v], "i": {"x": [0.6], "y": [0.2]}, "o": {"x": [0.9], "y": [0.4]}, "h": 0} for t, v in fr]
            # Jump back to the vanishing point between passes.
            for a, b in zip(ks, ks[1:]):
                if b["t"] <= a["t"]:
                    b["t"] = a["t"] + 0.01
            return {"a": 1, "k": ks}
        layer(4, f"Rush {side}{k + 1}", {**tr(), "p": lin(kfs_p), "s": lin(kfs_s), "o": lin(kfs_o), "r": static(ang)},
              shapes=[rect_group(26, 2.4, CYAN + [1], radius=1.2)])

# Shade so type stays readable over the photograph.
grad = lambda s, e, stops: {"ty": "gf", "o": static(100), "r": 1, "bm": 0, "g": {"p": 2, "k": static(INK[:3] and [0, *INK[:3], 1, *INK[:3], *stops])}, "s": static(list(s)), "e": static(list(e)), "t": 1, "nm": "Gradient"}
shade_it = lambda s, e, stops: {"ty": "gr", "nm": "shade", "it": [
    {"ty": "rc", "d": 1, "s": static([W, H]), "p": static([W / 2, H / 2]), "r": static(0)},
    grad(s, e, stops),
    {"ty": "tr", "p": static([0, 0]), "a": static([0, 0]), "s": static([100, 100]), "r": static(0), "o": static(100), "sk": static(0), "sa": static(0)},
]}
layer(4, "Shade", tr(), shapes=[shade_it((0, 0), (W, 0), [0, 0.88, 1, 0]), shade_it((0, H), (0, 90), [0, 0.92, 1, 0])])

# Photograph pushes in slowly, like walking forward.
layer(2, "Tunnel photo", tr((W / 2, H / 2), s=anim((0, [57.5, 57.5, 100]), (OP, [50, 50, 100])), a=(300, 250)), refId="img_0")

data = {
    "v": "5.7.4", "fr": FR, "ip": 0, "op": OP, "w": W, "h": H, "nm": "TunnelVision_300x250_spec", "ddd": 0,
    "assets": [
        {"id": "img_h1", "w": 674, "h": 74, "u": "", "e": 1, "p": "data:image/png;base64," + base64.b64encode(open(sys.argv[3], "rb").read()).decode()},
        {"id": "img_h2", "w": 632, "h": 73, "u": "", "e": 1, "p": "data:image/png;base64," + base64.b64encode(open(sys.argv[4], "rb").read()).decode()},
        {"id": "img_0", "w": 600, "h": 500, "u": "", "e": 1,
                "p": "data:image/jpeg;base64," + base64.b64encode(open(photo, "rb").read()).decode()}],
    "fonts": {"list": [
        {"fName": "Archivo-Black", "fFamily": "Archivo", "fStyle": "Black", "ascent": 72},
        {"fName": "Archivo-ExtraBold", "fFamily": "Archivo", "fStyle": "Bold", "ascent": 72},
        {"fName": "Archivo-Bold", "fFamily": "Archivo", "fStyle": "Bold", "ascent": 72},
    ]},
    "layers": layers, "markers": [{"tm": 180, "cm": "end-frame", "dr": 60}],
}
with open(out, "w") as f:
    json.dump(data, f, separators=(",", ":"))
print("layers", len(layers), "bytes", len(json.dumps(data)))
