# GitHub Pro and repository operations

Sources checked: 2026-09-26, America/Vancouver. The owner reports GitHub Pro; actual usage remaining and billing controls have not been inspected. The repository was public at bootstrap.

## Use what is useful, not everything that is available

GitHub's [plan documentation](https://docs.github.com/en/get-started/learning-about-github/githubs-plans) lists Pro's private-repository protected branches, code owners, required reviewers, and insights. These capabilities remain useful if the owner later chooses private development. Many public-repository capabilities are already available on Free.

The [included-usage table](https://docs.github.com/en/billing/reference/product-usage-included) lists 3,000 Actions minutes, 1 GB Actions storage, 180 Codespaces core-hours, and 20 GB Codespaces storage for Pro. These are account allowances, not dedicated Foundry resources or remaining balances. Standard GitHub-hosted runners for public repositories have free usage under the plan documentation; do not generalize that to larger runners or every storage product. GitHub Pro is separate from Copilot and from Codex usage.

## Foundation artifacts

This package supplies a Work Order issue template, a pull request template, CODEOWNERS routing, and a small documentation-check workflow. CODEOWNERS describes routing; it does not enforce approvals without corresponding repository settings. The workflow uses a standard Linux hosted runner, a short timeout, read-only repository permission, a pinned checkout action, no model credentials, and no artifact uploads.

Only draft PRs and sanitized reports are expected initially. Human acceptance and merging stay separate. Do not enable auto-merge or require a status name until that exact check has run successfully and the owner approves the settings.

## Recommended settings, not applied by this package

Keep default-branch changes reviewable through pull requests. After the check is observed, consider requiring `docs-check`; disallow deletion/force-push for main. Decide how the owner's bypass/merge path works before activation. Preserve a recovery route instead of locking a solo maintainer out of their own repository.

A [pull request author cannot approve their own PR](https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/approving-a-pull-request-with-required-reviews). Multiple Codex sessions authenticated as Drew-Goddyn are not separate GitHub approvers. Record fresh-context Assessments as evidence; use owner acceptance initially. An independently authenticated reviewer or future narrowly scoped GitHub App is a separate integration decision, not an assumed Pro feature.

A single Project board may later show Backlog, Ready, Active, Review, Blocked, Accepted, with fields for lane, criticality, and estimated resource class. Treat the board as a view of Work Orders, not a lease system. It is not created by these files. Keep the wiki unused so instructions do not fork away from versioned docs.

## Security and spending

Follow GitHub's [secure-use guidance](https://docs.github.com/en/actions/reference/security/secure-use): pin action revisions, minimize token permissions, and do not run untrusted pull-request code in a privileged workflow. No `pull_request_target` execution of candidate code, secrets, deployment, or write-token automation belongs in this precursor workflow.

Do not register the personal development machine as a self-hosted Actions runner for this public repository. Locally launched Codex workers and self-hosted Actions runners are different mechanisms. Use hosted disposable runners for public CI and local explicitly launched sessions for Foundry work.

Codespaces is an optional future CPU-only fallback, not launched here. Its stopped storage can still consume allowance. The owner should inspect account usage and choose a metered-product budget with stop-usage behavior before paid experiments; files in this repo cannot enforce account billing. See [included usage and budget behavior](https://docs.github.com/en/billing/reference/product-usage-included).

Do not publish private experiment reports through Pages. GitHub's plan documentation notes that private Pages publication requires an Enterprise Cloud organization; a private source repository alone is not private website access.
