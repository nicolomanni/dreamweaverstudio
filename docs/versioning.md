# Versioning Guidelines

In our workspace, we follow specific guidelines for commit messages to ensure clarity and consistency in our versioning and release processes. Please adhere to the following guidelines when making commits:

## Commit

We follow the Conventional Commits specification for our commit messages. This allows us to automatically generate changelogs and determine version bumps based on the types of changes made in each commit.

Refer to the [Conventional Commits specification](https://www.conventionalcommits.org/en/v1.0.0/#specification) for detailed information.

The commit message **must** be structured as follows:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Here's a summary of the commit types based on the [Angular Guidelines](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines):

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation changes
- **style**: Changes that do not affect the meaning of the code (e.g., formatting, white-space, etc.)
- **refactor**: Code refactorings that neither fixes a bug nor adds a feature
- **perf**: Performance improvements
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to our CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

## Release

We use [Nx release](https://nx.dev/recipes/nx-release/get-started-with-nx-release) to automate our release process. Nx release helps us manage versioning, generate changelogs, and publish releases.

By following these guidelines and using Nx release, we ensure that our versioning and release processes are streamlined and consistent across our projects.
