# Anti-AI Humanizer Checklist for Technical Posts

Use this checklist during Phase 5 of the authoring process. AI-generated text destroys reader trust. Every post must pass this audit before publishing.

---

## 1. The Punctuation Hard Constraint

| Pattern | Rule | Fix |
|---|---|---|
| **Em dashes (`—`)** | **STRICTLY FORBIDDEN** | Replace with comma, period, colon, parentheses, or restructure into two sentences. |
| **En dashes (`–`)** | **STRICTLY FORBIDDEN** | Replace with comma, parentheses, or rewrite. |
| **Double hyphens (`--`)** | **STRICTLY FORBIDDEN** | Do not use `--` as a stand-in for an em dash. |
| **Curly quotes (`“`, `”`, `‘`, `’`)** | **FORBIDDEN** | Convert to straight ASCII quotes (`"`, `'`). |
| **Unicode ellipses (`…`)** | **FORBIDDEN** | Convert to standard triple dots (`...`). |

---

## 2. Banned AI Vocabulary Watchlist

Cut or replace these high-frequency AI words immediately:

| AI Word | Common AI Context | Human Replacement |
|---|---|---|
| *delve* | "Let's delve into..." | "Look at", "examine", or remove entirely |
| *tapestry* | "A rich tapestry of tools..." | "Collection", "ecosystem", "stack" |
| *testament* | "Is a testament to..." | "Shows", "demonstrates", "proves" |
| *crucial* / *pivotal* | "Plays a crucial role in..." | "Essential", "needed", "matters for" |
| *vibrant* | "A vibrant community..." | "Active", "large", or specify numbers |
| *underscore* / *highlight* | "Underscores the need for..." | "Shows", "emphasizes", "makes clear" |
| *landscape* | "In the evolving AI landscape..." | "In machine learning", "today", "in industry" |
| *intricate* / *intricacies* | "The intricate workings of..." | "Mechanics", "details", "inner workings" |
| *foster* / *garner* | "Fostered widespread adoption..." | "Gained", "drove", "earned" |
| *showcase* | "Showcases its capabilities..." | "Shows", "demonstrates", "displays" |
| *moreover* / *furthermore* | Piled-up transitional padding | Cut or replace with simple "also" |

---

## 3. Sentence Structure Tells

### Superficial `-ing` Analyses
- **Tell**: Tacking present participle phrases onto the end of sentences for fake depth.
- **AI**: *"...providing a unified interface, highlighting the importance of developer efficiency and ensuring seamless operations."*
- **Human**: *"...providing a unified interface that keeps operations fast."*

### Copula Avoidance
- **Tell**: Avoiding simple *is*, *are*, *has* in favor of grandiose verbs.
- **AI**: *"FastAPI serves as the backend engine and boasts extensive endpoint support."*
- **Human**: *"FastAPI is the backend engine with five primary endpoints."*

### Negative Parallelisms & Tailing Negations
- **Tell**: *"It's not just about X, it's about Y"* or trailing fragments like *"no guessing"*.
- **AI**: *"It's not just a parser; it's a foundation for understanding."*
- **Human**: *"The parser converts messy documents into clean structured data."*

### Rule-of-Three Overuse
- **Tell**: Forcing lists into threes to sound comprehensive.
- **AI**: *"It delivers speed, accuracy, and scalability."*
- **Human**: *"It is fast and keeps memory usage under 2GB."* (State the concrete details).

### Signposting & Announcements
- **Tell**: Announcing what you are about to do instead of doing it.
- **AI**: *"Let's dive into the code. Here is what you need to know."*
- **Human**: Start directly with the explanation or code snippet.

### Generic Upbeat Conclusions
- **Tell**: Bland cheerleading paragraphs at the end.
- **AI**: *"The future looks bright for AI tooling. As we move forward, exciting times lie ahead."*
- **Human**: Cut the cheerleading. End on concrete facts, the GitHub repository link, or the reference list.

---

## 4. Signs of Human Engineering Voice (Preserve These)

- **Exact measurements**: Specific memory sizes (`1.8GB`), latency numbers (`140ms`), or test failure counts.
- **Technical opinions**: Clear statements about what works and what was discarded.
- **Real bugs & gotchas**: Mentioning weird edge cases encountered during development (e.g. Hugging Face free tier memory limits, cold-start delays).
- **Sentence rhythm variation**: Alternating short, direct sentences with detailed technical explanations.
