# Development Guide

This guide covers development practices, project structure, and how to contribute to the AIR Credential Issuance Template.

## 🏗️ Project Structure

```
air-credential-issuance-template/
├── app/                          # Next.js App Router
│   ├── (home)/                   # Main application pages
│   │   ├── api/                  # API routes
│   │   │   ├── auth/             # Authentication endpoints
│   │   │   └── user/             # User data endpoints
│   │   ├── _components/          # Page components
│   │   └── page.tsx              # Home page
│   └── globals.css               # Global styles
├── components/                    # Reusable UI components
│   ├── common/                   # Common components
│   └── ui/                       # Shadcn UI components
├── lib/                          # Core library code
│   ├── auth.ts                   # NextAuth configuration
│   ├── env/                      # Environment validation
│   ├── hooks/                    # React hooks
│   └── providers/                # Context providers
├── docs/                         # Documentation (committed to git)
├── .notes/                       # Development notes (not committed)
├── README.md                     # Main project documentation
└── package.json                  # Dependencies and scripts
```

## 🔧 Development Setup

### Prerequisites

1. **Node.js 18+**
2. **pnpm** (recommended) or npm
3. **Git** for version control
4. **Code editor** (VS Code recommended)

### Initial Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/MocaNetwork/air-credential-issuance-template.git
   cd air-credential-issuance-template
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start Development Server**
   ```bash
   pnpm dev
   ```

## 🎯 Authentication Methods

### Supported Methods

| Method | Route | Use Case |
|--------|-------|----------|
| **Wallet** | `/ethos` or `/wallet` | Web3, DeFi, NFT apps |
| **AIR Kit** | `/airkit` | Direct AIR Kit integration |
| **Spotify** | `/spotify` | Music, entertainment apps |
| **Twitter** | `/twitter` | Social media credentials |
| **Discord** | `/discord` | Community credentials |

### Adding New Authentication Methods

1. **Create Feature Branch**
   ```bash
   git checkout -b [provider]-integration
   ```

2. **Implement Authentication**
   - Add provider to `lib/auth.ts`
   - Create authentication hook in `lib/hooks/`
   - Update UI components in `app/(home)/_components/`

3. **Document Implementation**
   - Create setup guide in `docs/`
   - Update main README.md
   - Add environment variable documentation

4. **Test Thoroughly**
   - Follow QA procedures
   - Test all scenarios
   - Verify security

## 📁 File Organization

### Core Files

- **`lib/auth.ts`** - NextAuth configuration
- **`lib/env/index.ts`** - Environment variable validation
- **`lib/hooks/`** - React hooks for different auth methods
- **`lib/providers/index.tsx`** - Context providers

### API Routes

- **`app/(home)/api/auth/`** - Authentication endpoints
- **`app/(home)/api/user/`** - User data endpoints
- **`app/(home)/api/jwks.json`** - JWKS endpoint for AIR Kit

### UI Components

- **`app/(home)/_components/`** - Page-specific components
- **`components/common/`** - Shared components
- **`components/ui/`** - Shadcn UI components

## 🔒 Security Best Practices

### Environment Variables

- ✅ Never commit `.env.local` or `.env`
- ✅ Use `.env.example` for documentation
- ✅ Validate all environment variables with Zod
- ✅ Use different secrets for development/production

### Authentication Security

- ✅ Secure token storage in JWTs
- ✅ Token validation on all API calls
- ✅ Automatic token refresh
- ✅ Secure session management

### Data Privacy

- ✅ Minimal scope requests
- ✅ User consent for data access
- ✅ Secure data transmission
- ✅ No sensitive data logging

## 🧪 Testing Strategy

### Development Testing

1. **Local Testing**
   - Test authentication flows
   - Verify credential issuance
   - Check error handling
   - Test different user scenarios

2. **Integration Testing**
   - Test with real OAuth providers
   - Verify API integrations
   - Test credential storage
   - Check user data processing

### QA Checklist

- [ ] Authentication flow works
- [ ] User data is fetched correctly
- [ ] Credentials are issued successfully
- [ ] Error handling works properly
- [ ] Security measures are in place
- [ ] Performance is acceptable

## 🚀 Deployment

### Environment Configuration

1. **Development**
   - Local development with `.env.local`
   - Use development OAuth app settings
   - Test with development AIR Kit settings

2. **Staging**
   - Production-like environment
   - Test with staging OAuth apps
   - Verify all integrations work

3. **Production**
   - Production environment variables
   - Production OAuth app settings
   - Production AIR Kit configuration

### Deployment Platforms

- **Vercel** (Recommended)
  - Automatic deployments from git
  - Environment variable management
  - Built-in Next.js optimization

- **Netlify**
  - Static site hosting
  - Environment variable management
  - Custom build settings

- **Railway**
  - Full-stack application hosting
  - Database integration
  - Environment management

- **Docker**
  - Containerized deployment
  - Multi-environment support
  - Scalable infrastructure

## 📚 Documentation Standards

### Documentation Structure

- **`README.md`** - Main project documentation
- **`docs/`** - Detailed guides and setup instructions
- **`.notes/`** - Development notes (not committed)

### Writing Guidelines

1. **Clear Instructions**
   - Step-by-step setup guides
   - Code examples and snippets
   - Screenshots where helpful

2. **Troubleshooting**
   - Common issues and solutions
   - Error message explanations
   - Debug mode instructions

3. **Security Considerations**
   - Security best practices
   - Privacy considerations
   - Production security guidelines

## 🔄 Git Workflow

### Branch Strategy

- **`main`** - Stable, production-ready code
- **`[provider]-integration`** - Feature branches for new auth methods
- **`hotfix/`** - Critical bug fixes

### Commit Guidelines

1. **Clear Commit Messages**
   ```
   feat: add Spotify OAuth integration
   fix: resolve authentication token refresh issue
   docs: update setup guide for new environment variables
   ```

2. **Atomic Commits**
   - One feature per commit
   - Include tests with features
   - Update documentation with changes

### Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/spotify-integration
   ```

2. **Implement Changes**
   - Write code
   - Add tests
   - Update documentation

3. **Create Pull Request**
   - Clear description
   - Link to issues
   - Request reviews

4. **Code Review**
   - Security review
   - Code quality review
   - Documentation review

## 🛠️ Development Tools

### Recommended VS Code Extensions

- **ES7+ React/Redux/React-Native snippets**
- **TypeScript Importer**
- **Tailwind CSS IntelliSense**
- **GitLens**
- **Prettier**
- **ESLint**

### Development Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build           # Build for production
pnpm start           # Start production server

# Code Quality
pnpm lint            # Run ESLint
pnpm type-check      # Run TypeScript checks
pnpm format          # Format code with Prettier

# Testing
pnpm test           # Run tests
pnpm test:watch      # Run tests in watch mode
```

## 🆘 Troubleshooting

### Common Development Issues

1. **Environment Variables**
   - Check `.env.local` exists
   - Verify variable names match schema
   - Restart development server after changes

2. **Authentication Issues**
   - Verify OAuth app configuration
   - Check redirect URIs
   - Test with different browsers

3. **Build Issues**
   - Clear `.next` folder
   - Reinstall dependencies
   - Check TypeScript errors

4. **API Issues**
   - Check network connectivity
   - Verify API credentials
   - Check rate limits

### Debug Mode

Enable debug logging:

```bash
NODE_ENV=development
DEBUG=next-auth:*
```

## 📈 Performance Optimization

### Code Splitting
- Use dynamic imports for heavy components
- Lazy load authentication providers
- Optimize bundle size

### Caching
- Implement proper caching strategies
- Use Next.js built-in caching
- Optimize API calls

### Monitoring
- Add error tracking
- Monitor performance metrics
- Set up alerts for issues

## 🎉 Contributing

### How to Contribute

1. **Fork the Repository**
2. **Create Feature Branch**
3. **Implement Changes**
4. **Add Tests**
5. **Update Documentation**
6. **Create Pull Request**

### Contribution Guidelines

- Follow existing code style
- Add tests for new features
- Update documentation
- Ensure security best practices
- Request reviews from maintainers

---

## 📞 Support

### Getting Help

- **GitHub Issues** - Bug reports and feature requests
- **Documentation** - Check `docs/` folder for guides
- **Community** - Join discussions and ask questions

### Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [AIR Kit Documentation](https://docs.air3.com/)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [MOCA Network](https://moca.network/)
