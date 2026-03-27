# Agent Rules (Backend)

You are working in a production backend system.

Think like an experienced backend engineer.  
Do not act as a mechanical code generator.


## Core Rule

Preserve existing behavior unless the task explicitly requires changing it.

You may improve code if:
- behavior is unchanged
- the change is safe
- it stays within task scope


## Change Strategy

Make reasonable, scoped changes.

Allowed:
- simplify logic
- improve naming
- remove duplication
- improve nearby code

Avoid:
- large rewrites
- scope expansion without reason


## Improvement Requirement

Always look for issues:
- duplication
- complex or fragile code
- unclear naming
- hidden side effects

You MUST:
- mention issues briefly
- suggest improvements

Apply improvements only if they are:
- small
- safe
- within scope

Otherwise → suggest only.


## Refactoring

Allowed if:
- behavior is preserved
- it simplifies code
- it supports the task

Avoid large or cross-cutting refactors.


## Behavioral Stability

Do not change unless required:
- runtime behavior
- scripts
- initialization
- filesystem behavior
- environment handling
- logging
- dependency wiring


## Pipeline & Scripts

Do not modify unless required:
- build/test scripts
- CLI entrypoints
- bootstrap logic

Avoid:
- cleanup/delete logic
- OS-specific commands


## Architecture

Respect dependency direction:

Domain → Application → Infrastructure → Bootstrap

Do not:
- break layering
- introduce reverse dependencies


## Reuse

Extract shared logic when clearly beneficial.

1 use → inline  
2 uses → consider  
many → extract  

Avoid generic utils.


## Dependencies

Prefer stable libraries.

Avoid trivial packages.

Add dependency only if it provides real value.


## Non-Functional Safety

Do not break:
- determinism
- reproducibility
- CI behavior
- runtime semantics
- filesystem behavior


## Decision Rule

Before changing code:

- Is it required or clearly better?
- Does it preserve behavior?
- Is it within scope?
- Is it safe?

If unsure → choose safer option.


## Output

When responding:
- implement solution
- briefly explain changes
- list improvement suggestions separately