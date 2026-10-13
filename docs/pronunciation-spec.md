# Pronunciation spec: Na'ama and Waya

Reference recordings approved by Oren, both generated with Microsoft Zira (en-US, SAPI):

- `docs/naama-a7-sapi-phonemes.wav` for Na'ama
- `docs/waya-pronunciation-zira.wav` for Waya

Reproduce these in any voice or engine using the specs below. Match the reference audio, not the spelling.

---

## Na'ama

**Respelling:** NAH-AH-MAH. Three syllables. Equal length and equal weight on each. No pause between syllables, but the two "ah" sounds are two separate syllables, not one long vowel.

**Vowel:** every vowel is the open "ah" of "father" / "spa". Never "ay" (as in "name"), never "a" as in "cat", never a schwa.

**Stress:** flat. Do not stress any syllable more than the others. If the engine forces a stress mark, put a primary stress on all three syllables.

**Syllable boundary:** the first "ah" ends and the second "ah" begins with a slight re-articulation, like the Hebrew ayin or a soft glottal stop. If the engine supports a glottal stop, use it. If not, rely on syllable boundaries alone and do not insert breaks.

**Speed:** about 15% slower than the engine's default.

### Phonetic notations

| Alphabet | Value |
|---|---|
| IPA | `/ˈnɑː.ˈɑː.ˈmɑː/` |
| IPA with glottal stop (if supported) | `/ˈnɑː.ˈʔɑː.ˈmɑː/` |
| ARPAbet / CMU | `N AA1 AA1 M AA1` |
| X-SAMPA | `"nA:"A:"mA:` |
| Microsoft SAPI (reference) | `n aa - aa - m aa` |
| Microsoft UPS | `N A . A . M A` |

### SSML, reference version (Microsoft SAPI / Windows voices)

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
  <prosody rate="-15%">
    <phoneme alphabet="x-microsoft-sapi" ph="n aa - aa - m aa">Naama</phoneme>
  </prosody>
</speak>
```

### SSML, IPA version (Azure Neural, Google Cloud TTS, most SSML engines)

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
  <prosody rate="-15%">
    <phoneme alphabet="ipa" ph="ˈnɑː.ˈɑː.ˈmɑː">Naama</phoneme>
  </prosody>
</speak>
```

### Amazon Polly

```xml
<speak>
  <prosody rate="85%">
    <phoneme alphabet="x-sampa" ph='"nA:"A:"mA:'>Naama</phoneme>
  </prosody>
</speak>
```

### ElevenLabs and other engines without phoneme support

Use the respelling as the input text: `Nah-ah-mah`. If that merges the middle syllables, try `Nah ah mah` or `Na'ah'ma`. Lower the stability setting so the voice follows the spelling closely.

### Avoid

- NAY-ma or NAH-ma (two syllables)
- na-ah-MAH or NAH-ah-ma (one syllable stressed)
- NAAAMA with the two "ah" sounds merged into one long vowel
- Any audible silence or pause between syllables
- Any "u", "oo" or "uh" vowel in the middle

---

## Waya

**Respelling:** WEIGH-ya. One word, two syllables, no pause. Stress on the first syllable. Rhymes with "payer".

**Speed:** about 10% slower than default.

| Alphabet | Value |
|---|---|
| IPA | `/ˈweɪ.jə/` |
| ARPAbet / CMU | `W EY1 Y AH0` |
| X-SAMPA | `"weIj@` |
| Microsoft SAPI | `w ey 1 - y ax` |

### SSML, reference version

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
  <prosody rate="-10%">
    <phoneme alphabet="ipa" ph="ˈweɪjə">Waya</phoneme>
  </prosody>
</speak>
```

### Avoid

- WAH-ya or WY-ya
- Three syllables (way-ah-ya)
- A pause or glottal stop between the syllables
- Stress on the second syllable
