import os
import subprocess

CROPS = {
    # page: (width, height, x, y)
    2: (1280, 640, 20, 90),
    3: (1280, 640, 20, 90),   # Cell membrane specimen for membrane function question
    4: (800, 680, 60, 80),    # Endocytosis EM without yellow post-it note
    5: (1260, 770, 30, 20),   # Mitochondria, RER, lysosomes EM with 1,2,3
    6: (1300, 720, 10, 10),   # Mitochondria EM & 3D diagram
    7: (1300, 810, 10, 0),    # rER EM
    8: (1300, 810, 10, 0),    # Link to rER specimen for rER/SER function question
    9: (1300, 820, 10, 0),    # sER EM
    10: (750, 770, 50, 55),   # Golgi EM without yellow note
    11: (750, 770, 50, 55),   # Link to Golgi specimen for Golgi/peroxisome function question
    12: (1280, 800, 20, 10),  # Peroxisome single density crystalline core & Golgi
    13: (750, 750, 60, 30),   # Primary lysosome EM without yellow note
    14: (780, 760, 50, 20),   # Secondary lysosome EM without yellow note
    15: (780, 760, 50, 20),   # Link to Secondary lysosome for functions question
    16: (1200, 840, 50, 20),  # EM secondary lysosomes scans
    17: (1300, 790, 10, 0),   # Glycogen granules, peroxisomes & sER
    18: (1300, 530, 10, 420), # Ribosomes EM & 3D subunit diagram
    19: (1300, 530, 10, 420), # Link to Ribosome diagram for functions question
    20: (1200, 650, 60, 170), # Ribosome 3D diagram
    21: (1280, 730, 20, 10),  # Free ribosomes & polysomes EM
    22: (1280, 720, 20, 70),  # Cytoskeleton diagram
    23: (1280, 870, 20, 10),  # MT and MF EM
    24: (1280, 870, 20, 10),  # Link to MT and MF for functions question
    25: (1280, 550, 20, 420), # Microfilaments EM & actin strand
    26: (1280, 810, 20, 170), # Mitotic spindle EM
    27: (1280, 810, 20, 20),  # Centrioles EM & 3D pair
    28: (1280, 880, 20, 20),  # Centrioles & centrosome cell division
    29: (1280, 740, 20, 10),  # Centriole 9 triplets cross-section EM
    30: (1280, 740, 20, 10),  # Centriole 9 triplets for Centrosome functions question
    31: (1280, 430, 20, 10),  # Cilia shaft TS (9 doublets + 2 singlets)
    32: (680, 930, 610, 20),  # Basal bodies and cilia cross-section EM without left text
    33: (1280, 760, 20, 10),  # Cilia axoneme TS EM
    34: (1280, 870, 20, 10),  # Cilia longitudinal section LS EM
    35: (1280, 550, 20, 420), # Glycogen granules (alpha single vs beta clusters) EM
    36: (690, 930, 610, 20),  # Glycogen granules G, rER, mitochondria EM without left text
    37: (750, 560, 350, 420), # Stored food glycogen PAS stain histology
    38: (1280, 580, 20, 260), # Lipid droplets EM
    39: (1080, 750, 120, 70), # Glycogen & sER EM
    40: (1000, 750, 160, 70), # Lipids & cell membrane EM
    41: (1200, 530, 60, 440), # H&E stain histology without top text
    42: (550, 800, 560, 230), # Single, binucleated & multinucleated histology
    43: (600, 920, 680, 20),  # Vesicular nucleus in nerve vs deeply stained in lymphocytes
    44: (1200, 680, 150, 220),# Light and EM nucleus micrographs
    45: (800, 600, 290, 310), # H&E stain nucleus euchromatin/heterochromatin
    46: (680, 950, 640, 10),  # Nucleus EM heterochromatin types without left text
    47: (660, 920, 640, 20),  # EM nucleus with 1,2,3,4 without left text answers
    48: (1100, 800, 110, 80), # Unlabeled EM nucleus
    49: (600, 600, 10, 420),  # EM nucleus micrograph
    50: (1100, 800, 110, 80), # EM nucleus for euchromatin vs heterochromatin comparison question
    51: (720, 670, 610, 170), # TEM nuclear envelope and pores without left text
    53: (1220, 780, 50, 30),  # Normal male karyotype 46, XY without bottom caption
    54: (1220, 780, 50, 30),  # Normal female karyotype 46, XX without bottom caption
    55: (1250, 570, 35, 220), # Female and male karyotype fluorescent arrays
    56: (500, 550, 410, 270), # FISH for chromosome Y micrograph
    57: (1280, 800, 20, 150), # Chromosome groups table
    58: (680, 650, 550, 280), # Down syndrome karyotype without left text
    59: (560, 650, 710, 300), # Klinefelter syndrome karyotype without left text
    60: (750, 720, 520, 190), # Trisomy 13 karyotype without left text
    61: (720, 830, 570, 210), # Turner syndrome karyotype without left text
    62: (600, 750, 680, 140), # Monosomy 9p baby photo and karyotype without left text
    63: (1250, 460, 35, 120), # FISH deletion mutation without bottom text
    64: (1250, 510, 35, 50),  # FISH duplication mutation without bottom text
    65: (1250, 550, 35, 60),  # FISH insertion mutation without bottom text
    66: (1250, 550, 35, 60),  # FISH inversion mutation without bottom text
    67: (1250, 550, 35, 90),  # FISH translocation mutation without bottom text
    68: (700, 660, 550, 280), # Mosaic unbalanced translocation chr 21 without left text
    69: (1200, 680, 40, 310), # Mitotic prophase TEM without top text
    70: (600, 920, 740, 10),  # Mitotic division 4 stages diagrams without left text
    71: (1000, 660, 290, 320),# Metaphase chromosome EM without top text
    72: (650, 750, 600, 120), # Metaphase chromosome diagram
    73: (680, 800, 620, 210), # Mitosis metaphase EM without left text
    74: (660, 780, 630, 260), # Mitosis early telophase EM without left text
    75: (660, 780, 480, 230), # Mitosis telophase cleavage furrow EM
    76: (520, 780, 640, 250), # Cytokinesis EM without left text
    77: (480, 760, 610, 210), # Diakinesis crossing over in meiosis EM without left text
    78: (700, 700, 570, 80),  # Tetrad bivalent 3D diagram without left text
    79: (600, 480, 580, 150), # Metaphase I vs Metaphase II diagrams without text
    80: (400, 550, 720, 200), # Anaphase I of meiosis diagram without left text
    81: (600, 600, 600, 200), # Mitosis vs meiosis diagrams
    82: (1250, 400, 35, 230), # Mitosis vs meiosis table
    83: (650, 900, 640, 230), # Protein-secreting differentiated cell EM without left text
    84: (400, 700, 740, 320), # Steroid-secreting differentiated cell EM without left text
    85: (900, 680, 240, 170), # Stem cells in culture inverted microscope without text
    86: (1200, 680, 160, 160),# Adult stem cells TEM without bottom text
}

def main():
    os.makedirs('public/crops', exist_ok=True)
    count = 0
    for page, (w, h, x, y) in CROPS.items():
        src = f"public/slides/page-{page}.png"
        dst = f"public/crops/page-{page}-crop.png"
        if not os.path.exists(src):
            print(f"Skipping {src}, not found")
            continue
        cmd = ["convert", src, "-crop", f"{w}x{h}+{x}+{y}", "+repage", dst]
        res = subprocess.run(cmd, capture_output=True)
        if res.returncode == 0:
            count += 1
        else:
            print(f"Error cropping page {page}: {res.stderr.decode()}")
    print(f"Successfully generated {count} cropped micrographs in public/crops/")

if __name__ == '__main__':
    main()
