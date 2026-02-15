# SpendStats

SpendStats is a full-stack financial analytics platform that converts unstructured bank statement PDFs into structured transaction data and visualizes actionable financial insights.

## Overview

The system processes uploaded bank statement PDFs entirely on the backend. Raw transaction data is extracted using `pdf2json`, then passed to the Groq API for full transaction structuring. Structured records are stored in a normalized relational schema and exposed via REST APIs for analytical rendering.

## Architecture

- PDF parsing performed server-side using pdf2json
- Full transaction structuring via Groq LLM API
- Normalized schema: Users → Statements → Transactions
- Secure multi-user isolation via OAuth authentication
- Analytical dashboards built over structured transaction queries

## Core Capabilities

- End-to-end PDF ingestion and processing pipeline
- LLM-driven financial data structuring
- Multi-tenant architecture
- Transaction categorization, filtering, and CRUD operations
- Scalable relational storage using PostgreSQL

SpendStats focuses on reliable backend processing and structured financial data modeling rather than simple file parsing or UI rendering.
