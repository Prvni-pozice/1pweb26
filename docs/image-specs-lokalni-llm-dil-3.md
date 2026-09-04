# Image specs — Lokální LLM, díl 3

Prompty pro fotorealistické ilustrace k článku
`/blog/ai-ve-firmach/lokalni-llm/lokalni-ai-server-bez-graficke-karty/`.

## Workflow

1. Vygenerovat obrázek (Claude Design / Midjourney / DALL-E).
2. Export PNG → konverze na **WebP, kvalita 85**, max. 250 KB.
3. Uložit do `public/img/blog/lokalni-llm-dil-3/`.
4. Vložit `<img>` do `content` uzlu v `src/data/site.json` — stejná šablona jako díl 2
   (`loading="lazy" width="1080" height="1350"`, `max-width:420px`, `border-radius:16px`).

## Společný styl (přilepit na konec každého promptu)

Kvůli konzistenci série musí všechny obrázky sdílet světlo i paletu:

```
Cinematic product photography, photorealistic, shot on 85mm lens, shallow depth of field.
Very dark scene, near-black background. Single cool key light from upper right,
plus lime-green (#98C800) practical light coming from the hardware itself.
Colour palette limited to: near-black, gunmetal grey, cool steel blue, and lime green.
No text, no letters, no numbers, no logos, no brand names anywhere in the image.
No people. Sharp focus on the subject, soft falloff into darkness. 4K, high detail.
--ar 4:5 --style raw --v 6
```

**Proč žádný text:** generátory komolí diakritiku a čísla; popisky patří do HTML vedle obrázku, ne do bitmapy.

---

## card-01.webp — úvodní záběr

| | |
|---|---|
| **Cesta** | `public/img/blog/lokalni-llm-dil-3/card-01.webp` |
| **Rozměry** | 1080 × 1350 px (4:5) |
| **Kam v článku** | Hned za perex |

```
Interior of an open desktop computer case photographed at a low three-quarter angle.
A large air CPU cooler with dense aluminium fins dominates the centre.
Two memory modules are seated in the RAM slots, their heat spreaders lit by a thin
lime-green light strip along the top edge. Two further RAM slots next to them sit empty.
The long PCI-Express slot in the foreground is conspicuously empty — no graphics card
anywhere in the machine, just bare motherboard and a clear line of sight through it.
The emptiness where the GPU would be is the subject of the photograph.
```

---

## card-02.webp — propustnost paměti jako úzké hrdlo

| | |
|---|---|
| **Cesta** | `public/img/blog/lokalni-llm-dil-3/card-02.webp` |
| **Rozměry** | 1080 × 1350 px (4:5) |
| **Kam v článku** | Sekce „Use-case 1: velký dense model" |

```
Extreme macro of a single DDR5 memory module standing on a dark motherboard.
Streams of lime-green light flow out of the memory chips toward the CPU socket,
but they are forced through a narrow gap between two dark metal walls — a visible
bottleneck, light compressed and slowed as it squeezes through.
Behind the gap the light spreads out again, thinner and dimmer.
Physical, tangible light — like fibre optics, not a UI graphic.
```

---

## card-03.webp — stotisícový kontext a prompt cache

| | |
|---|---|
| **Cesta** | `public/img/blog/lokalni-llm-dil-3/card-03.webp` |
| **Rozměry** | 1080 × 1350 px (4:5) |
| **Kam v článku** | Sekce „A co stotisícový kontext?" |

```
A vast dark server hall seen from inside, receding into blackness.
Instead of servers, the racks hold thousands of thin translucent glass sheets stacked
edge to edge, each one a page of a document, faintly lit from within in lime green.
One single sheet at the front is pulled slightly out and lit brightly — the new question.
The rest of the archive glows softly, already warm, already loaded — the cache.
Cold blue rim light from above, deep atmospheric haze between the racks.
```

---

## card-04.webp — Mixture-of-Experts

| | |
|---|---|
| **Cesta** | `public/img/blog/lokalni-llm-dil-3/card-04.webp` |
| **Rozměry** | 1080 × 1350 px (4:5) |
| **Kam v článku** | Sekce „Use-case 2: MoE model" |

```
A large dark wall made of hundreds of identical small metal modules in a precise grid,
photographed at a slight angle so the grid recedes into darkness.
Only three modules are lit — glowing lime green from within, casting light onto their
neighbours. Every other module is cold, dark, dormant metal.
The scale of the dark grid versus the three lit cells is the point of the image.
```

---

## card-05.webp — past se čtyřmi sloty

| | |
|---|---|
| **Cesta** | `public/img/blog/lokalni-llm-dil-3/card-05.webp` |
| **Rozměry** | 1080 × 1350 px (4:5) |
| **Kam v článku** | Sekce „Jenže rozšiřitelnost, se kterou jsme počítali, nefunguje" |

```
Close macro along a motherboard, four memory slots in a row seen almost at eye level.
The two nearest slots hold memory modules lit with a bright, fast-moving lime-green
light streak running along them. The two far slots are empty, dark, dust in the sockets.
A faint second light streak tries to cross into the empty slots and visibly slows,
dimming and fraying as it goes — speed lost, not gained.
Sense of a road narrowing rather than widening.
```

---

## card-06.webp — spektrum platforem

| | |
|---|---|
| **Cesta** | `public/img/blog/lokalni-llm-dil-3/card-06.webp` |
| **Rozměry** | 1080 × 1350 px (4:5) |
| **Kam v článku** | Sekce „Co z toho plyne pro firmy" |

```
Four different computers standing side by side on a dark reflective floor in a black studio,
photographed straight on, receding slightly in scale from left to right:
a large open workstation packed with heavy graphics cards, fans blazing;
a small square aluminium desktop cube, minimal, no visible ports lit;
a flat compact mini-PC with a low profile;
and a plain ordinary mid-tower beige-grey PC, unremarkable, clearly the cheapest.
Each machine is lit by its own light: the first cold white and intense, the last a calm
lime green. The ordinary one is closest to camera and in sharpest focus.
```

---

## Volitelné — card-07.webp, teaser čtvrtého dílu

| | |
|---|---|
| **Cesta** | `public/img/blog/lokalni-llm-dil-3/card-07.webp` |
| **Rozměry** | 1080 × 1350 px (4:5) |
| **Kam v článku** | Sekce „Jenže rychlost nakonec vůbec nebyla ta správná otázka" |

```
Four identical dark metal machines on a starting line in a black space, shot from the front
at a low angle like a race. Three of them blur forward with bright motion streaks.
The fourth stands perfectly still, sharp and calm, lit in lime green — and it is the only
one whose light reaches the finish line ahead of the blurred ones.
Contradiction between visible speed and actual result.
```

---

## Náhledovka

Stávající `thumb.webp` je typografická (zelená plocha, Roboto Black), stejně jako u dílů 1 a 2.
Pokud se má sjednotit s fotorealistickou sérií, použít **card-01** ořezaný na 800 × 600 (4:3)
a nechat vlevo tmavou plochu na případný text.
