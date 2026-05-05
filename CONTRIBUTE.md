# Contributing Guide

This document explains how to contribute to `mjc-chatbot` using the branch strategy of this project.

## Branch strategy

- `main`: production branch (stable code only).
- `develop`: integration branch for ongoing development.
- `feature/*`: feature branches created from `develop`.

## Contribution workflow

1. Clone the repository:
   - `git clone https://github.com/Club-IA-plus/mjc-chatbot`
   - `cd mjc-chatbot`
2. Switch to `develop`:
   - `git checkout develop`
3. Update your local `develop` before starting:
   - `git pull origin develop`
4. Create your feature branch from `develop`:
   - `git checkout -b feature/<short-feature-name>`
5. Work on your changes and commit regularly.
6. Push your branch:
   - `git push -u origin feature/<short-feature-name>`
7. Open a Merge Request from `feature/<short-feature-name>` to `develop`.

## Merge rules

- Feature branches are merged into `develop` first.
- `main` is reserved for production releases.
- Do not create direct commits on `main`.
