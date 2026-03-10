# Worktree Integration Guide

Each product built through the LaunchCraft pipeline should use an isolated git worktree to prevent interference between projects.

## Why Worktrees

- Multiple products can be in different pipeline stages simultaneously
- Failed experiments don't pollute other work
- Easy cleanup: delete the worktree, branch is gone

## Usage

Before starting a new product through the pipeline:

```bash
# Create a worktree for the new product
git worktree add ../<product-name> -b product/<product-name>

# Work in the isolated directory
cd ../<product-name>

# Run pipeline skills there
# /user-story → /design-doc → /tdd-testing → /impl → /test-report → /launch
```

## After Launch

```bash
# If launched successfully, merge back
git checkout main
git merge product/<product-name>

# Clean up worktree
git worktree remove ../<product-name>
```

## If Abandoned

```bash
# Just remove the worktree
git worktree remove --force ../<product-name>
git branch -D product/<product-name>
```

## Convention

- Branch naming: `product/<product-name>`
- Worktree location: sibling directory `../<product-name>`
- One worktree per product, one product per worktree
