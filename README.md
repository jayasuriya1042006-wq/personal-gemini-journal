# Personal Gemini Journal

> A security-first, private reflective journal powered by Google Gemini and Google Cloud Firestore. Built with zero-compromise tenant isolation, server-side credential security, and thoughtful emotional growth analytics.

## Overview
**Personal Gemini Journal** is an AI-enhanced mental wellness and journaling platform built for the **Hack2skill Gen AI Academy Hackathon**. It provides an introspective sanctuary where users can document their lives, receive constructive philosophical inquiries and mindful reflections powered by Gemini, synthesize longitudinal emotional trends, and converse with a context-aware reflective AI companion.

---

## Live Links & Demo
- **Live Deployed App**: [https://ais-pre-vgdp5acyxny75ycoap5czo-322069626039.asia-southeast1.run.app](https://ais-pre-vgdp5acyxny75ycoap5czo-322069626039.asia-southeast1.run.app)
- **Live Development Preview**: [https://ais-dev-vgdp5acyxny75ycoap5czo-322069626039.asia-southeast1.run.app](https://ais-dev-vgdp5acyxny75ycoap5czo-322069626039.asia-southeast1.run.app)

---

## Key Features

### 1. Mindful AI Reflections (Google Gemini)
- Instantly analyzes journal narratives and selected emotional moods to produce empathetic, constructive reflections.
- Generates 3 thought-provoking philosophical inquiries to spur deeper self-discovery.
- Crafts uplifting, grounding affirmations tailored to each unique entry.

### 2. Longitudinal AI Synthesis & Growth Analytics
- Synthesizes trends across weeks of entries to map the user's emotional landscape.
- Detects recurring personal themes, cognitive habits, and emerging growth areas without exposing raw entries to third parties.

### 3. Contextual Reflective Chat
- A dedicated, empathetic dialogue space that contextualizes conversations around the user's journal entries.
- Answers questions, helps reframe negative self-talk, and guides introspective meditation.

### 4. Zero-Trust Security Architecture
- **Server-Side AI Proxy**: Gemini API keys are never exposed to the client bundle or browser network requests.
- **Strict Firestore Tenant Isolation**: Security rules enforce that users can only read, write, update, and query their own journal records.
- **Cryptographic Firebase Admin Token Verification**: All backend AI routes cryptographically verify Firebase Auth ID tokens before processing requests.
- **Prompt Injection Defense & Input Sanitization**: Defends against indirect prompt injection and Unicode control character tampering.

---

## Tech Stack & Architecture

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Motion animations.
- **Backend / API**: Node.js, Express, TypeScript, `@google/genai` SDK (`gemini-3.1-flash-lite`, `gemini-3.6-flash`).
- **Database & Auth**: Google Cloud Firestore (multi-tenant rules), Firebase Authentication.
- **Security**: Google Cloud Secret Manager integration, Firebase Admin SDK JWT verification.
- **Hosting**: Google Cloud Run containers.

---

## Submission Details (Hack2skill Gen AI Academy)
- **Project Name**: Personal Gemini Journal
- **Track / Theme**: Gen AI Academy / Productivity & Mental Wellness
- **Models Utilized**: Google Gemini (`gemini-3.1-flash-lite`, `gemini-3.6-flash`) via the `@google/genai` SDK
- **Backend Framework**: Node.js & Express with Google Cloud Firestore
