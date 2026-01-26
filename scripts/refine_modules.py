import json
import os
from pathlib import Path
import re

INPUT = Path('public/modules-tgsit-detailed.json')
OUT = Path('public/modules-tgsit-detailed-refined.json')
THUMB_DIR = Path('public/images/modules')
THUMB_DIR.mkdir(parents=True, exist_ok=True)

def slugify(s):
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", '-', s)
    s = re.sub(r"-+", '-', s)
    return s.strip('-')


def title_case(s):
    return ' '.join([w.capitalize() for w in s.split()])


def first_sentences(text, n=2):
    if not text: return ''
    # naive sentence split
    parts = re.split(r'(?<=[.!?])\s+', text.strip())
    return ' '.join(parts[:n]).strip()


if not INPUT.exists():
    print('Input file not found:', INPUT)
    raise SystemExit(1)

raw = json.loads(INPUT.read_text(encoding='utf8'))
modules = raw.get('modules', [])
new_modules = []

for i, m in enumerate(modules, start=1):
    title = m.get('title','').strip()
    title = title_case(title)
    slug = slugify(title or f'modulo-{i}')
    desc = (m.get('description') or m.get('excerpt') or '').strip()
    if not desc:
        desc = first_sentences(m.get('excerpt',''), 2)
    # objectives
    objectives = m.get('objectives') or []
    if not objectives:
        # extract short objectives from first sentences
        s = first_sentences(desc, 2)
        objectives = [s] if s else []
    # duration
    duration = m.get('durationMin') or (max(20, min(90, int(len(desc.split())/30*10))) if desc else 30)
    resources = m.get('resources') or []
    # normalize resource urls
    norm_resources = []
    for r in resources:
        if not r: continue
        rr = r.strip()
        if rr.startswith('/'):
            rr = rr
        elif rr.startswith('http://') or rr.startswith('https://'):
            rr = rr
        else:
            rr = '/' + rr
        norm_resources.append(rr)
    # excerpt
    excerpt = (m.get('excerpt') or first_sentences(desc, 2)).strip()
    # quiz keep
    quiz = m.get('quiz') or []
    # generate thumbnail svg
    svg_path = THUMB_DIR / f'{slug}.svg'
    svg_text = f'''<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
  <rect width="100%" height="100%" fill="#f4f6fb"/>
  <rect x="0" y="0" width="100%" height="120" fill="#e6eefc"/>
  <text x="20" y="70" font-size="28" font-family="Arial, Helvetica, sans-serif" fill="#2b4865">{title}</text>
  <text x="20" y="110" font-size="14" font-family="Arial, Helvetica, sans-serif" fill="#556b86">{excerpt[:140].replace('\n',' ') + ( '...' if len(excerpt)>140 else '')}</text>
  <g transform="translate(20,150)">
    <rect x="0" y="0" width="220" height="130" rx="6" fill="#fff" stroke="#e1e8f2" />
    <text x="12" y="30" font-size="16" fill="#23415a">Duración: {duration} min</text>
    <text x="12" y="56" font-size="14" fill="#4b667a">Objetivos: {len(objectives)}</text>
    <text x="12" y="82" font-size="14" fill="#4b667a">Preguntas: {len(quiz)}</text>
  </g>
</svg>'''
    svg_path.write_text(svg_text, encoding='utf8')

    nm = {
        'title': title,
        'slug': slug,
        'description': desc,
        'excerpt': excerpt,
        'objectives': objectives,
        'durationMin': duration,
        'resources': norm_resources,
        'videoUrl': m.get('videoUrl') or '',
        'pdfPage': m.get('pdfPage'),
        'quiz': quiz,
        'thumbnail': f'/public/images/modules/{slug}.svg',
        'order': m.get('order') or i
    }
    new_modules.append(nm)

out = {
    'courseId': raw.get('courseId','tgsit-reparacion-bios'),
    'title': raw.get('title',''),
    'description': raw.get('description',''),
    'modules': new_modules
}

OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding='utf8')
print('Refined modules written to', OUT)
print('Thumbnails written to', THUMB_DIR)
