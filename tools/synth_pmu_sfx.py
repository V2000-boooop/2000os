#!/usr/bin/env python3
# synth_pmu_sfx.py — SFX PMU synthetises pour Vincent 2000 OS (offline, aucun telechargement).
# Ecrit directement dans public/media/nightdrive/sons/. Rejouer : python3 tools/synth_pmu_sfx.py
import numpy as np, wave, struct, os

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'media', 'nightdrive', 'sons')
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(2000)

def env(n, a=0.005, d=0.2, curve=4.0):
    t = np.arange(n) / SR
    at = np.clip(t / a, 0, 1)
    de = np.exp(-curve * np.clip((t - a), 0, None) / max(d, 1e-4))
    return at * de

def fades(x, ms=4):
    k = int(SR * ms / 1000)
    if len(x) > 2 * k:
        x[:k] *= np.linspace(0, 1, k); x[-k:] *= np.linspace(1, 0, k)
    return x

def norm(x, peak=0.9):
    m = np.max(np.abs(x)) or 1.0
    return x / m * peak

def save(name, x):
    x = fades(norm(x.astype(np.float32)))
    d = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    with wave.open(os.path.join(OUT, name), 'w') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(b''.join(struct.pack('<h', s) for s in d))
    print('OK', name, f'{len(x)/SR:.2f}s')

# 1) RICARD — tchin de verre : partiels inharmoniques metalliques, decay rapide
def glass():
    n = int(SR * 0.35); t = np.arange(n) / SR
    parts = [(2410, 1.0), (3625, 0.7), (5230, 0.5), (6890, 0.3)]
    x = sum(a * np.sin(2*np.pi*f*t) for f, a in parts)
    x *= env(n, a=0.001, d=0.12, curve=6)
    x += 0.15 * rng.standard_normal(n) * env(n, a=0.0005, d=0.01, curve=20)  # transient
    return x

# 2) TERMINAL — bip de borne retro : deux tons pulse qui montent (chiptune confirm)
def terminal():
    def pulse(f, dur):
        n = int(SR*dur); t = np.arange(n)/SR
        sq = np.sign(np.sin(2*np.pi*f*t))          # onde carree
        return 0.6*sq * env(n, a=0.002, d=dur*0.6, curve=3)
    return np.concatenate([pulse(660, 0.06), pulse(990, 0.09)])

# 3) TELE — paris : glitch numerique (zap descendant + burst de bruit filtre)
def tele():
    n = int(SR*0.28); t = np.arange(n)/SR
    sweep = np.sin(2*np.pi*(1200*np.exp(-6*t))*t) * env(n, a=0.001, d=0.12, curve=5)
    noise = rng.standard_normal(n)
    # pseudo bandpass : diff + moyenne glissante
    noise = np.convolve(np.diff(noise, prepend=0), np.ones(3)/3, 'same')
    burst = noise * (env(n, a=0.001, d=0.03, curve=12) * (rng.random(n) > 0.3))
    return 0.7*sweep + 0.5*burst

# 4) SUD-OUEST — journal : page qui tourne (deux souffles de bruit filtre)
def paper():
    def swish(dur, hp):
        n = int(SR*dur); ns = rng.standard_normal(n)
        ns = np.convolve(ns, np.ones(hp)/hp, 'same')     # lissage
        ns = ns - np.convolve(ns, np.ones(40)/40, 'same')  # highpass grossier
        e = np.sin(np.linspace(0, np.pi, n))**2
        return ns * e
    return np.concatenate([0.9*swish(0.18, 4), 0.15*np.zeros(int(SR*0.03)), 0.7*swish(0.16, 6)])

# 5) FDJ — grattage : bruit granulaire module (grattouillis)
def scratch():
    n = int(SR*0.5); ns = rng.standard_normal(n)
    ns = ns - np.convolve(ns, np.ones(25)/25, 'same')   # highpass -> aigu
    trem = (0.5 + 0.5*np.sign(np.sin(2*np.pi*38*np.arange(n)/SR + 2*rng.random())))
    trem *= (0.6 + 0.4*rng.random(n))                    # irregulier
    e = np.sin(np.linspace(0, np.pi, n))**1.5
    return ns * trem * e

# 6) AMBIANCE — lit de bar : hum grave + murmure (bruit filtre) + mouvement lent, loopable
def ambiance(dur=8.0):
    n = int(SR*dur); t = np.arange(n)/SR
    hum = 0.5*np.sin(2*np.pi*58*t) + 0.25*np.sin(2*np.pi*116*t + 0.5)
    lfo = 0.85 + 0.15*np.sin(2*np.pi*0.12*t)
    murmur = rng.standard_normal(n)
    murmur = np.convolve(murmur, np.ones(120)/120, 'same')  # lowpass -> sourd
    x = 0.4*hum*lfo + 0.6*murmur*0.5*lfo
    # loop seamless : crossfade debut/fin
    k = int(SR*0.5)
    x[:k] = x[:k]*np.linspace(0,1,k) + x[-k:][::-1]*np.linspace(1,0,k)
    return x

save('zone_pmu_ricard.wav',   glass())
save('zone_pmu_terminal.wav', terminal())
save('zone_pmu_tele.wav',     tele())
save('zone_pmu_sudouest.wav', paper())
save('zone_pmu_fdj.wav',      scratch())
save('ambiance_pmu.wav',      ambiance())
print('--- SFX PMU synthetises dans', os.path.normpath(OUT))
