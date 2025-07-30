# Contributing Guide

## Welcome

Thank you for your interest in contributing to TMF Shop! This guide will help you get started with contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our code of conduct:

- Be respectful and inclusive
- Use welcoming and constructive language
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a new branch** for your feature or bugfix
4. **Make your changes** following our coding standards
5. **Test your changes** thoroughly
6. **Submit a pull request**

## Development Workflow

### Branch Naming

Use descriptive branch names with prefixes:

- `feature/user-authentication`
- `bugfix/header-navigation-issue`
- `docs/api-documentation-update`
- `refactor/database-connection-logic`

### Commit Messages

Follow conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add user registration endpoint
fix(ui): resolve header navigation mobile responsiveness
docs(api): update authentication documentation
test(auth): add unit tests for login service
```

### Code Standards

#### TypeScript/JavaScript

- Use **TypeScript** for all new code
- Follow **ESLint** configuration
- Use **Prettier** for formatting
- Add **JSDoc comments** for public APIs
- Prefer **functional components** with hooks
- Use **async/await** instead of promises

#### CSS/Styling

- Use **Tailwind CSS** classes
- Follow **mobile-first** responsive design
- Use **semantic HTML** elements
- Maintain **accessibility** standards (ARIA labels, keyboard navigation)

#### Backend

- Follow **RESTful API** conventions
- Use **TypeORM** for database operations
- Implement proper **error handling**
- Add **input validation** for all endpoints
- Write **unit tests** for services and controllers

### Testing Requirements

All contributions must include appropriate tests:

#### Frontend Tests
```bash
npm run test
npm run test:coverage
```

Required test coverage:
- **Components**: Test user interactions and rendering
- **Hooks**: Test state changes and side effects
- **Utils**: Test pure functions with various inputs

#### Backend Tests
```bash
cd backend
npm run test
npm run test:coverage
```

Required test coverage:
- **Controllers**: Test HTTP responses and error handling
- **Services**: Test business logic
- **Middleware**: Test authentication and validation
- **Utils**: Test utility functions

### Pull Request Process

1. **Update documentation** if needed
2. **Add or update tests** for your changes
3. **Ensure all tests pass**
4. **Run linting and formatting**
5. **Update CHANGELOG.md** if applicable
6. **Create pull request** with descriptive title and description

#### Pull Request Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added new tests for changes
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

## Issue Reporting

### Bug Reports

Use the bug report template:

```markdown
**Bug Description**
Clear description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment**
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 91]
- Node.js version: [e.g. 18.0.0]
```

### Feature Requests

Use the feature request template:

```markdown
**Feature Description**
Clear description of the feature.

**Problem Statement**
What problem does this solve?

**Proposed Solution**
How should this feature work?

**Alternatives Considered**
Other solutions you've considered.

**Additional Context**
Screenshots, mockups, etc.
```

## Code Review Guidelines

### For Authors

- **Keep changes small** and focused
- **Provide context** in PR description
- **Respond promptly** to feedback
- **Test thoroughly** before requesting review

### For Reviewers

- **Be constructive** and respectful
- **Focus on code quality** and standards
- **Ask questions** for clarification
- **Approve** when standards are met

## Release Process

### Version Management

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

- [ ] All tests passing
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] Git tag created
- [ ] Release notes written

## Getting Help

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and discussions
- **Email**: [maintainer@example.com] for security issues

### Resources

- [Project README](../README.md)
- [API Documentation](../api/reference.md)
- [Development Setup](../getting-started/development.md)
- [Architecture Overview](../architecture/overview.md)

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- GitHub contributors page

Thank you for contributing to TMF Shop! 🎉
