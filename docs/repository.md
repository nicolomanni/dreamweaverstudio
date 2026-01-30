# Shared Repository Model and Git Flow

In our project, we follow the [Shared repository model](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/getting-started/about-collaborative-development-models#shared-repository-model) for collaborative development on GitHub. This model allows multiple developers to work together on the same repository, coordinating their changes through pull requests.

## Shared Repository Model

In the Shared Repository Model:

- There's a single repository that serves as the central source of truth for the project.
- Each developer clones the repository to their local machine to work on features or fixes.
- Changes are made on feature branches, which are then merged back into the main branch via pull requests.

## Pull Requests for Versioning

We use pull requests to manage the versioning process and integrate changes into the main branch. Here's how it works:

1. **Feature Development**: Developers create feature branches off the staging branch to work on specific features or fixes.
2. **Pull Request Creation**: When a feature is ready, the developer opens a pull request to merge their changes back into the main branch.
3. **Code Review**: Other team members review the code changes in the pull request, providing feedback and ensuring code quality.
4. **Merge**: Once the pull request is approved, it's merged into the staging branch, making the changes part of the project's history.

## Git Flow

[Git Flow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) is a branching model that provides a robust framework for managing larger projects with multiple features and releases. It defines specific branch naming conventions and rules for branch management. Here's a high-level overview:

- **Staging Branch**: Represents the current staging environment. This branch is protected and must always be ahead of the Master branch (except in rare cases such as hotfixes). In this branch can be merged all the Feature|Release branches.
- **Master Branch**: Represents the official project history and always reflects a production-ready state. This is a protected branch - only the staging branch and, in emergencies, the hotfix branches, can be merged onto it.
- **Feature Branches**: Created off the staging branch for developing new features. Once the feature is complete, it's merged back into the staging branch.
- **Release Branches**: Created off the staging branch when preparing a new release. Release branches allow for final preparations before merging into the staging branch and deployment.
- **Hotfix Branches**: Created off the Master branch to quickly address critical issues in production. Once fixed, they're merged into both the main branches.

By following the Git Flow model and utilizing pull requests, we ensure a structured approach to versioning, collaboration, and release management in our [GitHub repository](https://github.com/Idle-Labs/idle-multiverse).
