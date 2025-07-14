## Brief overview
- All package publishing is fully automated; manual local publishing is disallowed.  
- Releases must be handled exclusively via the project's GitHub Actions workflow.

## GitHub Actions Publishing
- Trigger a release by creating and pushing a Git tag (e.g. `vX.Y.Z`) on the main branch.  
- The CI pipeline will build, test, lint, bump version, and publish to npm automatically.  
- Do not invoke `npm publish` or any publish-related commands manually.

## Local Development
- Use `npm run build`, `npm test`, `npm run lint`, and `npm run format` locally to validate changes.  
- Avoid running `npm publish` or creating release tags outside of CI.

## Version Management
- Do not edit the `version` field in `package.json` directly; version bumps are handled by CI.  
- Ensure release tags follow semantic versioning (e.g., `chore: release v1.2.3`).

## Other Guidelines
- Confirm that tests, linting, and coverage checks pass in CI before merging to the release branch.  
- After a successful release, update memory-bank documentation with release details.
