# Contributing to AI Website Builder Backend

Thank you for your interest in contributing to the AI Website Builder Backend! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL 15+
- Docker (optional)
- Git

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/ai-website-builder-backend.git
   cd ai-website-builder-backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   ```bash
   # Start development database
   docker-compose -f docker-compose.dev.yml up -d
   
   # Generate Prisma client
   npm run prisma:generate
   
   # Run migrations
   npm run prisma:migrate
   
   # Seed database
   npm run db:seed
   ```

5. **Start Development Server**
   ```bash
   npm run start:dev
   ```

## 📋 Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow NestJS conventions and patterns
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Follow the existing code structure and organization

### Git Workflow

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write clean, readable code
   - Add tests for new functionality
   - Update documentation as needed

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

4. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Format

We use conventional commits:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add user authentication middleware
fix: resolve database connection timeout issue
docs: update API documentation for new endpoints
```

## 🧪 Testing

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

### Writing Tests

- Write unit tests for services and utilities
- Write integration tests for controllers
- Write E2E tests for critical user flows
- Aim for >80% code coverage
- Use descriptive test names

Example:
```typescript
describe('WebsiteService', () => {
  describe('create', () => {
    it('should create a new website with valid data', async () => {
      // Test implementation
    });

    it('should throw error for invalid data', async () => {
      // Test implementation
    });
  });
});
```

## 🔍 Code Quality

### Linting and Formatting

```bash
# Run ESLint
npm run lint

# Fix linting issues
npm run lint -- --fix

# Format code
npm run format
```

### Pre-commit Hooks

We recommend setting up pre-commit hooks:

```bash
# Install husky
npm install --save-dev husky

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run lint && npm run test"
```

## 📝 Documentation

### API Documentation

- Update Swagger decorators when adding new endpoints
- Include proper descriptions and examples
- Document request/response schemas
- Add error response documentation

### Code Documentation

- Add JSDoc comments for public methods
- Document complex business logic
- Update README.md for new features
- Keep CONTRIBUTING.md up to date

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Description**: Clear description of the issue
2. **Steps to Reproduce**: Detailed steps to reproduce the bug
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: OS, Node.js version, etc.
6. **Logs**: Relevant error logs or console output
7. **Screenshots**: If applicable

## ✨ Feature Requests

When requesting features, please include:

1. **Description**: Clear description of the feature
2. **Use Case**: Why this feature would be useful
3. **Proposed Solution**: How you think it should work
4. **Alternatives**: Other solutions you've considered
5. **Additional Context**: Any other relevant information

## 🔄 Pull Request Process

### Before Submitting

1. **Update Documentation**
   - Update README.md if needed
   - Add/update API documentation
   - Update inline code comments

2. **Run Tests**
   ```bash
   npm run test
   npm run test:e2e
   npm run lint
   ```

3. **Check Coverage**
   ```bash
   npm run test:cov
   ```

### PR Template

When creating a PR, please include:

- **Description**: What changes were made and why
- **Type**: Bug fix, feature, documentation, etc.
- **Testing**: How the changes were tested
- **Breaking Changes**: Any breaking changes
- **Checklist**: Completed tasks

### Review Process

1. **Automated Checks**: CI/CD pipeline runs tests and linting
2. **Code Review**: At least one maintainer reviews the code
3. **Testing**: Changes are tested in development environment
4. **Approval**: Maintainer approves and merges the PR

## 🏗️ Architecture Guidelines

### Module Structure

Follow the existing module structure:

```
src/modules/[module-name]/
├── dto/                   # Data Transfer Objects
├── [module-name].controller.ts
├── [module-name].service.ts
├── [module-name].module.ts
└── [module-name].spec.ts  # Tests
```

### Service Patterns

- Use dependency injection
- Keep services focused on single responsibility
- Use proper error handling
- Add logging for important operations

### Controller Patterns

- Keep controllers thin
- Use DTOs for request/response validation
- Add proper HTTP status codes
- Include Swagger documentation

## 🚀 Release Process

### Versioning

We use semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

1. Update version in package.json
2. Update CHANGELOG.md
3. Run full test suite
4. Update documentation
5. Create release tag
6. Deploy to production

## 🤝 Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow the golden rule

### Getting Help

- Check existing issues and discussions
- Ask questions in GitHub Discussions
- Join our community Discord (if available)
- Read the documentation thoroughly

## 📞 Contact

- **Maintainer**: [Your Name] ([email@example.com](mailto:email@example.com))
- **GitHub Issues**: [Create an issue](https://github.com/your-username/ai-website-builder-backend/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/ai-website-builder-backend/discussions)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to AI Website Builder Backend! 🎉
