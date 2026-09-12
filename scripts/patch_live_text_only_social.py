from pathlib import Path
import re
p=Path('index.html')
s=p.read_text(encoding='utf-8')
for pat in [r'<meta property="og:image"[^>]*>',r'<meta property="og:image:secure_url"[^>]*>',r'<meta property="og:image:type"[^>]*>',r'<meta property="og:image:width"[^>]*>',r'<meta property="og:image:height"[^>]*>',r'<meta property="og:image:alt"[^>]*>',r'<meta name="twitter:image"[^>]*>',r'<meta name="twitter:image:alt"[^>]*>']:
    s=re.sub(pat,'',s)
s=s.replace('<meta name="twitter:card" content="summary_large_image">','<meta name="twitter:card" content="summary">')
s=re.sub(r'<meta property="og:title" content="[^"]*">','<meta property="og:title" content="BHOC Veterinary Evidence">',s,count=1)
s=re.sub(r'<meta property="og:description" content="[^"]*">','<meta property="og:description" content="Veterinary evidence on Oxyglobin, HBOC, oxygen biology and BHOC Veterinary.">',s,count=1)
s=re.sub(r'<meta name="twitter:title" content="[^"]*">','<meta name="twitter:title" content="BHOC Veterinary Evidence">',s,count=1)
s=re.sub(r'<meta name="twitter:description" content="[^"]*">','<meta name="twitter:description" content="Veterinary evidence on Oxyglobin, HBOC, oxygen biology and BHOC Veterinary.">',s,count=1)
p.write_text(s,encoding='utf-8')
