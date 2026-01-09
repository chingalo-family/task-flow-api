# Contributing to Task Flow API

Thank you for your interest in contributing to Task Flow API! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Commit Guidelines](#commit-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Testing Guidelines](#testing-guidelines)
8. [Documentation](#documentation)
9. [Reporting Bugs](#reporting-bugs)
10. [Suggesting Features](#suggesting-features)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors. We expect everyone to:

- Be respectful and considerate
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Trolling or insulting/derogatory comments
- Public or private harassment
- Publishing others' private information
- Any conduct that could reasonably be considered inappropriate

---

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- Git
- Basic knowledge of TypeScript and Express.js
- Familiarity with Prisma ORM

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:

```bash
git clone https://github.com/YOUR-USERNAME/task-flow-api.git
cd task-flow-api
```

3. **Add upstream remote**:

```bash
git remote add upstream https://github.com/chingalo-family/task-flow-api.git
```

4. **Set up the development environment**:

```bash
./setup.sh
```

---

## Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
# Update your local main branch
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

**Branch Naming Conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests
- `chore/` - Maintenance tasks

### 2. Make Changes

- Write clean, readable code
- Follow the coding standards (see below)
- Add tests for new functionality
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run the development server
npm run dev

# Test your changes manually
# Use Swagger UI at http://localhost:3000/api-docs

# If tests exist, run them
npm test
```

### 4. Commit Your Changes

Follow the commit guidelines (see below):

```bash
git add .
git commit -m "feat: add user profile update endpoint"
```

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create a Pull Request

1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Select your branch
4. Fill out the PR template
5. Submit the PR

---

## Coding Standards

### TypeScript Style

- **Use TypeScript** for all new code
- **Define types** explicitly where not inferred
- **Avoid `any`** - use proper types or `unknown`
- **Use interfaces** for object shapes

**Example:**

```typescript
// Good
interface CreateUserData {
  username: string;
  email: string;
  password: string;
  name?: string;
}

async function createUser(data: CreateUserData): Promise<User> {
  // Implementation
}

// Bad
async function createUser(data: any) {
  // Implementation
}
```

### Code Formatting

- **Indentation**: 2 spaces (not tabs)
- **Quotes**: Single quotes for strings
- **Semicolons**: Required
- **Line length**: Maximum 100 characters
- **Trailing commas**: Use in multiline objects/arrays

**Example:**

```typescript
const userConfig = {
  username: 'johndoe',
  email: 'john@example.com',
  settings: {
    notifications: true,
    theme: 'dark',
  },
};
```

### File Structure

- **Controllers**: Request handling logic (`src/controllers/`)
- **Routes**: Route definitions (`src/routes/`)
- **Schemas**: Validation schemas (`src/schemas/`)
- **Middleware**: Custom middleware (`src/middleware/`)
- **Utils**: Helper functions (`src/utils/`)

**Naming Conventions:**

```
user.controller.ts    # Controllers
user.routes.ts        # Routes
user.schema.ts        # Validation schemas
auth.middleware.ts    # Middleware
email.ts              # Utilities
```

### Error Handling

Always use try-catch blocks and return appropriate HTTP status codes:

```typescript
export const getUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

### Validation

Use Zod schemas for request validation:

```typescript
import { z } from 'zod';

const createUserSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

// Use in route
router.post('/users', validate(createUserSchema), createUser);
```

---

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

### Examples

```bash
# Feature
git commit -m "feat(auth): add password reset functionality"

# Bug fix
git commit -m "fix(tasks): resolve subtask deletion issue"

# Documentation
git commit -m "docs: update API reference for team endpoints"

# Refactoring
git commit -m "refactor(controllers): extract common error handling"

# With body
git commit -m "feat(notifications): add real-time notifications

- Implement WebSocket connection
- Add notification delivery system
- Update notification schema"
```

### Commit Best Practices

- **Keep commits atomic**: One logical change per commit
- **Write clear messages**: Describe what and why, not how
- **Reference issues**: Include issue number if applicable
  ```
  fix(auth): resolve token expiration bug (#42)
  ```

---

## Pull Request Process

### Before Submitting

1. ✅ Code follows style guidelines
2. ✅ All tests pass
3. ✅ Documentation is updated
4. ✅ Commits follow convention
5. ✅ Branch is up to date with main

```bash
# Update your branch
git checkout main
git pull upstream main
git checkout your-branch
git rebase main
```

### PR Title

Follow the same format as commit messages:

```
feat(auth): add OAuth2 authentication
fix(tasks): resolve duplicate task creation
docs: add contribution guidelines
```

### PR Description

Use the provided template and include:

- **What**: What changes were made
- **Why**: Why these changes were necessary
- **How**: How the changes were implemented
- **Testing**: How to test the changes
- **Screenshots**: If UI changes (N/A for API)
- **Related Issues**: Link to related issues

**Example:**

```markdown
## Description
Adds password reset functionality to the authentication system.

## Changes
- Added forgot-password endpoint
- Added reset-password endpoint
- Implemented email sending with Nodemailer
- Added password reset token to User model
- Updated Prisma schema

## Testing
1. Request password reset: POST /api/auth/forgot-password
2. Check email for reset link
3. Reset password: POST /api/auth/reset-password

## Related Issues
Closes #123
```

### Review Process

1. **Automated checks** must pass (if configured)
2. **At least one approval** from maintainers
3. **All comments addressed** or resolved
4. **No merge conflicts** with main branch

### After Approval

- Maintainers will merge your PR
- Your branch will be deleted
- Changes will be included in the next release

---

## Testing Guidelines

### Manual Testing

1. **Test your endpoints** using Swagger UI:
   ```
   http://localhost:3000/api-docs
   ```

2. **Test with curl** or Postman:
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "password": "password"}'
   ```

3. **Test error cases**:
   - Invalid input
   - Unauthorized access
   - Missing required fields
   - Duplicate entries

### Database Testing

Use Prisma Studio to verify database changes:

```bash
npx prisma studio
```

### Test Data

Create test data for development:

```typescript
// Create test users, tasks, teams
// Document test data in your PR
```

---

## Documentation

### API Documentation

When adding or modifying endpoints:

1. **Update Swagger comments** in route files
2. **Update API Reference**: `docs/api-reference.md`
3. **Add examples** for request/response

### Code Documentation

Add JSDoc comments for complex functions:

```typescript
/**
 * Creates a new task with optional subtasks
 * @param userId - ID of the user creating the task
 * @param taskData - Task creation data
 * @returns Created task with subtasks
 */
async function createTask(
  userId: string,
  taskData: CreateTaskData
): Promise<Task> {
  // Implementation
}
```

### README Updates

Update README.md if:
- Adding new features
- Changing setup process
- Modifying dependencies
- Updating requirements

---

## Reporting Bugs

### Before Reporting

1. **Check existing issues** to avoid duplicates
2. **Try the latest version** to see if it's fixed
3. **Verify it's reproducible** consistently

### Bug Report Template

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., Ubuntu 20.04]
- Node.js version: [e.g., 18.0.0]
- npm version: [e.g., 8.0.0]

## Additional Context
- Error messages
- Screenshots
- Logs
```

---

## Suggesting Features

### Feature Request Template

```markdown
## Feature Description
Clear description of the proposed feature

## Use Case
Why this feature would be useful

## Proposed Solution
How you envision this working

## Alternatives Considered
Other approaches you've thought about

## Additional Context
Any other relevant information
```

---

## Development Resources

### Learning Resources

- **Express.js**: https://expressjs.com/
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Prisma**: https://www.prisma.io/docs/
- **Zod**: https://zod.dev/
- **JWT**: https://jwt.io/

### Project Documentation

- [Getting Started](./getting-started.md)
- [API Reference](./api-reference.md)
- [Database Schema](./database-schema.md)
- [Development Guide](./development.md)

---

## Communication

### GitHub Issues

- **Bug reports**: Use for bugs and errors
- **Feature requests**: Use for new features
- **Questions**: Use GitHub Discussions

### Response Time

- Maintainers typically respond within **2-3 business days**
- Complex PRs may take longer to review
- Be patient and respectful

---

## Recognition

Contributors will be:
- Listed in the project's contributors
- Credited in release notes for significant contributions
- Acknowledged in the README

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## Questions?

If you have questions about contributing:

1. Check the documentation
2. Search existing issues
3. Create a new discussion on GitHub
4. Reach out to maintainers

Thank you for contributing to Task Flow API! 🎉
