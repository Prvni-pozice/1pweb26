# Popisek k příspěvku (karusel, 10 slidů)

**Instagram / Facebook**

U lokální AI rozhoduje paměť, ne procesor.

Porovnali jsme běžné PC, Macy s Apple Silicon a nové AMD Ryzen AI Max+. U velkých jazykových modelů totiž nejde o to, jak rychle počítač počítá — ale jak rychle dokáže číst desítky gigabajtů vah z paměti.

RTX 5090 má 1 792 GB/s, ale jen 32 GB VRAM. Buď se model vejde, nebo ne — je to ostrá hrana, ne plynulý kompromis.
Mac Studio M3 Ultra: 819 GB/s a 96 GB jednotné paměti (od 149 990 Kč).
Ryzen AI Max+ 395: 256 GB/s, ale až 128 GB (PRO 495 až 192 GB).

A pak je tu obyčejné PC. Na 12jádrovém Zen 5 s dual-channel DDR5-5600 dal dense model 32B v Q4 3,54 tokenu/s — ale 80B MoE model 7,74 tokenu/s. Na stejném železe. Protože MoE aktivuje pro každý token jen zlomek parametrů.

Nejzajímavější sestava nakonec vyšla docela nudně: běžný Ryzen 9 a 128 GB DDR5.
A přesto ji zatím nemáme. Proč, je v článku.

Celý druhý díl série čtěte na prvni-pozice.com — odkaz v biu.

#lokalniAI #LLM #AI #hardware #MoE #AppleSilicon #AMD #NVIDIA #firemniAI

---

**LinkedIn (kratší verze)**

Při stavbě lokálního AI serveru se přirozeně porovnává výkon CPU a GPU. U velkých jazykových modelů ale bývá limitem něco jiného: propustnost paměti.

Dual-channel DDR5-5600 dá teoreticky 89,6 GB/s. RTX 5090 má 1 792 GB/s — ale jen 32 GB VRAM. Apple a AMD volí jiný kompromis: nižší propustnost výměnou za podstatně větší kapacitu (M3 Ultra 819 GB/s / 96 GB, Ryzen AI Max+ 395 256 GB/s / 128 GB).

Zajímavé je, co to udělá s architekturou MoE. Na obyčejném 12jádrovém Zen 5 s dual-channel pamětí dal dense 32B model 3,54 tokenu/s, zatímco 80B MoE model 7,74 tokenu/s.

Na papíře nám proto vyšla jako nejzajímavější poměrně nudná sestava: běžný Ryzen 9 a 128 GB standardní DDR5. Zatím jsme ji ale nekoupili — hardware je až druhá otázka. První je, k čemu ho použít.

Druhý díl série je na prvni-pozice.com.
