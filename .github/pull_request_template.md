# What human outcome does this change serve?

Describe the user's real-world decision, activity, or learning—not only the screen, route, or code being added.

## Vision-to-build trace

Reference [Vision-to-Build Contract](../docs/VISION_TO_BUILD_CONTRACT_v0.1.md).

- [ ] **Agency:** A person can correct, reject, shrink, defer, or otherwise own the proposed choice where relevant.
- [ ] **Context and relevance:** State exactly which user-confirmed context informs the feature. If it does not yet affect recommendations, say so.
- [ ] **Evidence and learning:** Distinguish recorded facts, inferred patterns, and unverified hypotheses. Never imply measured effectiveness without evidence.
- [ ] **Privacy:** Document every new field, access policy, external flow, retention/deletion consequence, and whether any real user data was used.
- [ ] **Resilience:** Explain the offline / no-AI / no-integration / missing-data behavior.
- [ ] **Transferable Method:** Explain how the feature supports users' own judgment over time rather than increasing app dependence.

## Verified behavior

**Scenario and user task:** 

**Source/branch and changes:** 

**Checks actually run:** 

**Checks not yet run:** 

**Known failure, accessibility, device and security risks:** 

**Does this change touch a protected database, medical/sensitive data, AI model, external account, deployment or public claims?**

## Next decision gate

- **What should improve in a user's real life?**
- **How would we observe improvement or failure?**
- **What is the next reversible test?**
- **What would make us stop, revise or remove this feature?**

**Scope boundary:** No production promotion, real data import, external beta or autonomous integration without separate authorization. A green Vercel build is not an acceptance test.
