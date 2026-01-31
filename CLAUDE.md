# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A cross-platform task management application with natural language processing. Users can create, prioritize, and schedule tasks using natural language commands. The system classifies tasks in real-time as the user types.

## Planned Technology Stack

- **Frontend**: SvelteKit
- **Backend/Database**: Supabase (PostgreSQL with real-time subscriptions)
- **LLM Integration**: OpenAI API (gpt-4o-mini with structured outputs)
- **Deployment**: Vercel

## Key Requirements

- Response time ≤ 0.5 seconds for all operations
- Real-time sync across all user devices
- Natural language interpretation for task creation, priorities, dates, and recurrence
- Real-time classification while user types (requires debouncing ~300ms)
- Completed tasks hidden from view but preserved in database with inactive status

## Target Platforms

Web (browser), Desktop (Windows/macOS/Linux), Mobile (Android/iOS)

## Architecture Notes

- Supabase Realtime handles cross-device synchronization
- LLM calls should use debouncing to meet latency requirements
- Row Level Security protects user data
- Edge Functions can handle LLM API calls if needed
