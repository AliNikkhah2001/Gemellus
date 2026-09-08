# Gemellus

> **From peregrinus to civis, from accented to articulate.**
>
> A Roman-themed, open-source AI accent and pronunciation coach for advanced English learners.

Gemellus is a personal research project for building a serious pronunciation coach that can **listen to speech, align it at the phoneme level, diagnose what differs from a chosen target accent, explain why it sounds non-native, and generate focused drills**.

The name is inspired by **Gemellus**, a Pannonian auxiliary cavalryman who completed a long Roman military career and received Roman citizenship in AD 122. The project borrows that journey as a deliberately playful metaphor for linguistic integration: not erasing where you came from, but gaining command of another linguistic system through disciplined practice.

The Roman theme is for personality. The phonetics should remain scientific.

---

## 🏛 Mission

Most pronunciation apps eventually reduce speech to something like:

```text
Pronunciation score: 83%
```

Gemellus should instead be able to say things like:

```text
Vowel: /ɪ/ in "live"
Issue: realization is drifting toward /iː/
Evidence: F1/F2 position + phoneme posterior
Priority: high

Prosody:
un-stressed syllables are consistently too long,
so connected speech remains more fully articulated than the target.

Drill:
1. live / leave
2. ship / sheep
3. "I live near the city."
4. shadow native reference at 0.85× → 1.0× → 1.1× speed
```

The long-term goal is **transparent diagnosis**, not a mysterious accent score.

---

## ⚔️ Core principles

### I. *Mensura ante iudicium* — measure before judging

The system should derive feedback from measurable speech evidence:

- phoneme substitutions, insertions and deletions
- phone and syllable duration
- vowel formants (F1/F2/F3)
- pitch/F0 contours
- stress placement
- speech rate
- pause location and duration
- reduction and weak forms
- aspiration / voice onset time
- linking and connected speech
- coarticulation where reliable

The LLM should **explain measurements**, not hallucinate phonetics directly from audio.

### II. Accent is not intelligibility

A legitimate regional or foreign accent is not inherently an error.

Gemellus should distinguish:

- **intelligibility problems**
- **pronunciation deviations from a selected target accent**
- **personal voice characteristics**
- **legitimate accent variation**

The learner explicitly chooses a target such as:

- General American
- modern Standard Southern British English / SSBE

### III. Language choice is a separate subsystem

Pronunciation and lexical naturalness must not be mixed into one score.

Gemellus should track independent dimensions:

1. pronunciation / segmentals
2. prosody and fluency
3. collocations and natural word choice
4. grammar and discourse

---

# 🦅 Proposed architecture

```text
                         ┌─────────────────────┐
                         │   Microphone audio  │
                         └──────────┬──────────┘
                                    │
                       ┌────────────▼────────────┐
                       │ Audio preprocessing     │
                       │ - Silero VAD            │
                       │ - optional denoising    │
                       │ - normalization         │
                       └────────────┬────────────┘
                                    │
             ┌──────────────────────┴──────────────────────┐
             │                                             │
    ┌────────▼─────────┐                         ┌─────────▼─────────┐
    │ ASR / transcript │                         │ Acoustic analysis │
    │ Whisper          │                         │ Praat/Parselmouth │
    │ faster-whisper   │                         │ F0/F1/F2/F3       │
    └────────┬─────────┘                         │ duration/energy    │
             │                                   └─────────┬─────────┘
             │                                             │
    ┌────────▼──────────┐                                  │
    │ Canonical phones  │                                  │
    │ G2P / dictionary  │                                  │
    │ IPA / ARPABET     │                                  │
    └────────┬──────────┘                                  │
             │                                             │
    ┌────────▼──────────────────────┐                      │
    │ Forced alignment             │                      │
    │ MFA / Charsiu                │                      │
    │ word → phone → timestamps    │                      │
    └────────┬──────────────────────┘                      │
             │                                             │
    ┌────────▼──────────────────────┐                      │
    │ Pronunciation assessment     │◄─────────────────────┘
    │ Kaldi GOP / GOPT             │
    │ Wav2Vec2 phone recognition   │
    └────────┬──────────────────────┘
             │
   ┌─────────▼───────────────────────────────────────┐
   │ Target-accent comparison                       │
   │ - vowels / consonants                          │
   │ - duration / rhythm                            │
   │ - stress / reduction                           │
   │ - linking / connected speech                   │
   │ - pitch / intonation                           │
   └─────────┬───────────────────────────────────────┘
             │
    ┌────────▼───────────────────┐
    │ Coaching / reasoning LLM  │
    │ - explain deviations       │
    │ - prioritize problems      │
    │ - generate drills          │
    │ - track recurring patterns │
    └────────────────────────────┘
```

---

# 🏺 Open-source stack to investigate

| Layer | Candidate projects |
|---|---|
| Speech activity | Silero VAD |
| Optional enhancement | DeepFilterNet |
| ASR | faster-whisper / whisper.cpp |
| Forced alignment | Montreal Forced Aligner / Charsiu |
| G2P / phonemes | Phonemizer / g2p-en / CMUdict |
| Phone recognition | Wav2Vec2Phoneme / Charsiu |
| Pronunciation scoring | Kaldi GOP / GOPT |
| Acoustic phonetics | Praat / Parselmouth |
| Prosody / features | librosa / torchcrepe / openSMILE |
| Learner feedback research | ALMs4Learning / L2-Arctic-plus |
| Future accent conversion | Amphion / FACodec-style systems |

---

# 📜 Datasets

Initial research targets:

- **SpeechOcean762** — expert-scored pronunciation data
- **L2-ARCTIC** — non-native English with phonetic/mispronunciation annotations
- **L2-Arctic-plus** — structured explanatory feedback for learner speech
- **Speech Accent Archive** — same-passage accent comparisons
- **VCTK** — native English reference speech, particularly useful for UK variation
- **Common Voice English** — large-scale accent diversity
- **LibriTTS** — large native English speech corpus
- **AccentDB** — accent-classification experiments

Dataset licenses must be checked independently before any redistribution or commercial use.

---

# 🛡 MVP — *Cohors I Gemelliana*

The first useful version should require **no custom model training**.

```text
record sentence
      ↓
Silero VAD
      ↓
faster-whisper
      ↓
known prompt text
      ↓
Montreal Forced Aligner
      ↓
┌───────────────┬──────────────────┐
│ Kaldi GOP     │ Parselmouth      │
│ phone scores  │ F0/formants/time │
└───────┬───────┴────────┬─────────┘
        └──────┬─────────┘
               ↓
       structured diagnosis
               ↓
              LLM
               ↓
       learner-facing report
```

Example internal result:

```json
{
  "word": "thinking",
  "phonemes": [
    {
      "expected": "θ",
      "observed": "s",
      "confidence": 0.84,
      "gop": -2.31
    }
  ],
  "prosody": {
    "stress_expected": 1,
    "stress_detected": 1,
    "duration_ratio": 1.12
  },
  "feedback": {
    "priority": "high",
    "issue": "Initial /θ/ is being realized close to /s/.",
    "instruction": "Keep the tongue tip lightly between the teeth and maintain turbulent airflow.",
    "minimal_pairs": ["thin / sin", "think / sink", "thick / sick"]
  }
}
```

---

# 🏛 Roman UI vocabulary (optional, intentionally silly)

The UI can use the theme without making the technical terminology obscure.

| Normal concept | Gemellus theme |
|---|---|
| Dashboard | **Forum** |
| Daily training | **Exercitatio** |
| Drill set | **Cohort** |
| Target accent | **Provincia** |
| Progress | **Cursus Honorum** |
| Achievement | **Corona** |
| Persistent weakness | **Hostis** |
| Mastered sound | **Provincia Pacata** |
| Weekly report | **Acta Gemelli** |
| Personal model/profile | **Tabula Gemelli** |
| Advanced diagnostic mode | **Censor** |

The system should never sacrifice clarity for the joke. “Censor” can have a subtitle like **Advanced phonetic diagnostics**.

---

# 🗺 Roadmap

## Phase I — *Tiro*

- [ ] Python project skeleton
- [ ] microphone/file recording input
- [ ] VAD
- [ ] Whisper transcription
- [ ] user-provided target sentence
- [ ] forced alignment
- [ ] IPA/ARPABET representation
- [ ] basic word + phoneme timeline

## Phase II — *Miles*

- [ ] Kaldi GOP baseline
- [ ] GOPT integration
- [ ] phone substitution diagnostics
- [ ] formant extraction
- [ ] F0/intensity/duration analysis
- [ ] learner-facing HTML/API report

## Phase III — *Centurio*

- [ ] native-reference recordings
- [ ] target-accent distributions
- [ ] normalized vowel-space comparison
- [ ] stress and reduction analysis
- [ ] pause/rhythm metrics
- [ ] connected-speech diagnostics
- [ ] recurring personal error profile

## Phase IV — *Tribunus*

- [ ] adaptive drill generation
- [ ] minimal-pair curriculum
- [ ] shadowing mode
- [ ] speed ladder: 0.85× / 1.0× / 1.1×
- [ ] collocation and natural-word-choice subsystem
- [ ] longitudinal progress analytics

## Phase V — *Imperator*

- [ ] personalized pronunciation calibration
- [ ] fine-tuned error model if justified by collected data
- [ ] audio-language-model experiments
- [ ] accent-converted self-reference audio
- [ ] expert-human validation study

---

# 🧪 Evaluation

Gemellus should not declare itself correct because its own score looks plausible.

The eventual evaluation protocol should compare system outputs against trained human raters for:

- phone-level error detection
- error-category agreement
- word stress
- prosody/fluency
- overall intelligibility
- similarity to the explicitly selected target accent
- usefulness of generated feedback

Longitudinally, the important question is not merely whether scores correlate with experts, but whether repeated use **improves expert-rated speech**.

---

# 🦁 Project philosophy

Gemellus is not about pretending that one English accent is objectively superior.

It is for learners who **deliberately want control over a target accent** and want much more precise feedback than “good pronunciation.”

The historical metaphor is similarly limited and playful: the Roman Gemellus did not erase his Pannonian origin when he gained Roman citizenship. Likewise, acquiring native-like control of another language does not require deleting an earlier identity.

> **Non accentum deleamus; imperium in eum capiamus.**  
> Let us not erase the accent; let us gain command over it.

*(The Latin motto is intentionally playful rather than an ancient quotation.)*

---

## Status

**Research / pre-MVP.**

The immediate objective is to build a completely local prototype that accepts a known English sentence plus a recording and returns aligned phones, basic acoustic measurements, pronunciation scores, and an evidence-backed coaching report.
