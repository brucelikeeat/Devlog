<div align="center">

# Devlog

**Turn your code into content.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![GitHub Stars](https://img.shields.io/github/stars/yourusername/devlog?style=social)](https://github.com/yourusername/devlog)

Devlog is an AI-powered developer growth platform that automatically converts **GitHub development activity** into a **clean development timeline and high-quality social media content**.

[Getting Started](#installation) · [Features](#core-features) · [Architecture](#architecture-overview) · [Roadmap](#roadmap) · [Contributing](#contributing)

</div>

---

## Who This Is For

Devlog is built for:

- **Indie founders & solo SaaS builders** who want to share their journey without spending hours writing content.
- **Open-source maintainers** who want a clear development log and occasional public updates.
- **Privacy-conscious teams** who want internal documentation of progress without leaking core IP.

## The Problem

Many developers want to build in public or simply keep a clean record of what they ship, but struggle with:

- Consistently writing updates
- Adapting posts for different platforms
- Maintaining social presence while coding
- Turning technical progress into engaging content
- Keeping sensitive details and proprietary work private

## The Solution

Devlog analyzes your **commits, pull requests, releases, and milestones** — then automatically generates **platform-optimized posts** for X (Twitter), LinkedIn, Reddit, Indie Hackers, and developer blogs.

```
Git commit → AI analysis → content generation → scheduled posting
```

Build in public effortlessly. Stay focused on shipping product.

---

## Core Features

### GitHub Activity Intelligence

Connects directly to your GitHub repository and monitors commits, pull requests, issues, releases, and milestone completions. The system identifies **meaningful product progress** rather than simple code changes.

```
Commit:    "Implemented startup scoring algorithm"

AI Output: Feature milestone detected — new product capability added

Generated: Day 14 building my AI startup validator.
           Just shipped the scoring engine.
           The system now evaluates ideas across:
           • Market size
           • Competition
           • Founder advantage
           • Execution complexity
```

### AI Post Generator

Each detected event generates posts for multiple platforms with **tone-optimized content**.

| Platform | Style |
|----------|-------|
| **X (Twitter)** | Concise threads, hook-driven |
| **LinkedIn** | Professional storytelling |
| **Reddit** | Community discussion |
| **Indie Hackers** | Founder narrative |
| **Dev.to / Hashnode** | Technical blog format |
| **Product Hunt** | Launch update *(planned)* |

### Content Editing Interface

Review and edit generated posts before publishing:

- Rich text editing with markdown support
- Tone adjustment and AI regeneration
- Image generation support
- Thread splitting for X

### Multi-Platform Publishing

Publish to multiple platforms simultaneously with supported integrations:

- **X API** · **LinkedIn API** · **Reddit API** · **Dev.to** · **Hashnode**
- Publish instantly, schedule posts, or create content queues

### Interactive Dev Timeline & Content Calendar

Two complementary views over your work:

- **Dev Timeline** – a smooth, interactive timeline of your commits, PRs, and milestones so you can review your build journey at a glance (even if you never post publicly).
- **Content Calendar** – a visual calendar for scheduling content with drag-and-drop, multi-platform visibility, queue system, and recurring updates.

Example schedule:

```
Mon — Private devlog entry
Wed — Public feature update
Fri — Build in public thread
```

### Privacy Controls

Per-repo privacy levels so you stay in control:

- **High privacy** – uses commit messages and high-level summaries only, no code or implementation details in generated text.
- **Medium** – describes behavior and impact without exposing sensitive internals (no file paths or algorithm details).
- **Low** – best for open-source / public marketing; allows more specific feature mentions and links.

Devlog never auto-posts without your review. You decide how much detail is revealed and where it is shared.

### Developer Growth Analytics

Track content performance across platforms — engagement rate, follower growth, post impressions, and best performing content. Understand what posts attract users, what drives engagement, and which platforms work best.

---

## Product Vision

Devlog aims to become the **developer distribution engine**.

```
GitHub → AI growth engine → audience → customers
```

Help developers grow audiences, acquire early users, build communities, and launch products.

---

## Architecture Overview

```
                     ┌──────────────────┐
                     │    GitHub API     │
                     └────────┬─────────┘
                              │
                              ▼
                  ┌────────────────────────┐
                  │    Event Detection     │
                  │   (commit analysis)    │
                  └───────────┬────────────┘
                              │
                              ▼
                  ┌────────────────────────┐
                  │   AI Content Engine    │
                  │  (LLM prompt pipeline) │
                  └───────────┬────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
      ┌──────────────────┐       ┌──────────────────┐
      │  Content Editor  │       │ Content Calendar  │
      └────────┬─────────┘       └────────┬─────────┘
               │                          │
               ▼                          ▼
         ┌──────────────────────────────────────┐
         │  Multi-Platform Publishing System    │
         └──────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14, React, TypeScript, TailwindCSS, ShadCN UI, Framer Motion | Dashboard, content editor, analytics, calendar UI |
| **Backend** | Node.js, Express / Fastify, TypeScript | GitHub event processing, AI generation, API routing, platform integrations |
| **AI** | OpenAI API, Anthropic API, local model support *(future)* | Commit summarization, post generation, tone adaptation, thread formatting |
| **Database** | PostgreSQL | Users, repositories, generated posts, platform tokens, analytics |
| **Queue** | Redis, BullMQ | AI job processing, scheduled posts, event pipelines |
| **Infra** | Vercel, Railway / Fly.io, Supabase, Cloudflare | Frontend hosting, backend hosting, auth + database, edge security |

---

## Installation

### Prerequisites

- Node.js 18+
- PostgreSQL
- Redis

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/devlog
cd devlog

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

Add your keys to `.env`:

```env
OPENAI_API_KEY=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
DATABASE_URL=
REDIS_URL=
```

```bash
# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Development Workflow

```
1. GitHub webhook triggers
2. Event stored in database
3. AI analyzes commit
4. AI generates platform-specific posts
5. User reviews and edits content
6. Post scheduled or published
```

---

## MVP Scope

The first release includes:

- [x] GitHub repo integration
- [x] Commit detection
- [x] AI post generator
- [x] X + LinkedIn publishing
- [x] Content editor
- [x] Scheduling

**Estimated build time: 5–10 days**

---

## Roadmap

### Phase 1 — MVP
GitHub integration, AI post generator, multi-platform scheduling.

### Phase 2 — Growth Engine
Analytics dashboard, content strategy AI, viral post prediction, audience discovery.

### Phase 3 — Full Distribution Platform
Community features, developer leaderboard, automatic devlogs, visual content generation (screenshots, mockups, diagrams).

---

## Pricing (Planned)

Devlog will ship with a simple, pragmatic pricing model designed to balance adoption and sustainability.

### Free

- 1 repo connected
- Very limited monthly generation (e.g. 10–20 events/posts per month)
- No scheduling / calendar
- Optional “Made with Devlog” watermark

### Pro

- Unlimited (or high-cap) generation
- Scheduling + content calendar
- Tone presets + platform templates
- Multi-platform workflows and publishing improvements

### Trials

- No trial required initially, or a short Pro trial after a user is activated (e.g. after generating their first posts).
- If Devlog can reliably deliver a “first post in <2 minutes” experience, a 7-day Pro trial may be used instead of a permanent free tier.

---

## Future Features

| Feature | Description |
|---------|-------------|
| **AI Growth Strategy** | AI suggests what to post, when to post, and content themes |
| **Viral Post Generator** | Predicts virality score and engagement potential |
| **Founder Leaderboard** | Public ranking by consistency, engagement, and growth |
| **Automatic Devlogs** | AI-generated weekly progress reports |
| **Visual Content Generation** | Feature screenshots, product mockups, diagrams |
| **Audience Discovery** | Identify potential users by interest, engagement, and topic relevance |

---

## FAQ

### Will this leak my core technology or IP?

No. Devlog is designed with **privacy-first controls**. You can configure per-repo privacy levels so that content is generated from **high-level summaries rather than raw code**, and nothing is ever auto-posted without your explicit review and approval.

### Is Devlog only for public posting?

No. Devlog supports an **internal-only mode** where it acts as a private development journal and interactive timeline. You can use it solely to document your build journey and export summaries, even if you never publish to any social platform.

### How does Devlog adapt to different platforms?

Each platform can use a different tone and framing. For example, Reddit-focused posts are generated in a **feedback-seeking, non-promotional style** (“Here’s what I built today, would love feedback”) while X and LinkedIn posts can be more announcement- or story-driven. Tone presets and platform-specific modes help keep your brand authentic instead of spammy.

---

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

```bash
# Fork the repository
# Create your feature branch
git checkout -b feature/your-feature

# Commit your changes
git commit -m "Add your feature"

# Push and open a pull request
git push origin feature/your-feature
```

**Areas where we need help:**

- Platform integrations
- AI prompt engineering
- UI/UX improvements
- Analytics pipelines

---

## License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

Built by developers who believe **distribution is as important as code.**

If you find this project useful, please consider giving it a star.

</div>
