# AIR Credential Issuance Template

A modern, flexible template for issuing verifiable credentials using AIR Kit. Supports multiple authentication methods including crypto wallets, AIR Kit user sessions, and third-party OAuth providers (Spotify, etc.).

## 🚀 Quick Start

This template features a **modular authentication system** supporting multiple methods:

- **🔗 Crypto Wallet** - Connect via MetaMask, WalletConnect, etc.
- **🆔 AIR Kit User ID** - Direct AIR Kit authentication  
- **🎵 Spotify OAuth** - Authenticate with Spotify and issue music taste credentials
- **𝕏 Twitter/X OAuth** - Authenticate with Twitter and issue profile credentials
- **🔧 Custom OAuth** - Easily extensible for Facebook, GitHub, and more

> **✨ New**: [Modular Authentication System](docs/MODULAR_AUTH_SYSTEM.md) - Easy to extend with new providers!

> **📚 Need detailed setup instructions?** See the [Documentation](#-documentation) section below or check the [`docs/`](docs/) folder for comprehensive guides.

## Getting Started

### Prerequisites

1. **Development Environment**
   - Install [Node.js](https://nodejs.org/) (v18 or later).
   - Use [pnpm](https://pnpm.io/) (recommended) or npm.
  
2. **Set up a Reown Account (Optional)**
   - To use RainbowKit for Wallet Connect, a Reown Project ID is needed. See [instructions here](#setting-up-reown-account).

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/MocaNetwork/air-credential-issuance-template.git
   cd air-credential-issuance-template
   ```

2. Install dependencies:
   ```bash
   pnpm install
   # or
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Update `.env.local` with your configuration.

4. Start the development server:
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Customizing the Issuer Template

### 1. Set up your issuance details
   1. Log in or Sign up for a Partner Account at [Sandbox Developer Dashboard](https://developers.sandbox.air3.com/dashboard). You may obtain your Partner Id and Issuer DID from Account -> General Settings.
   2. Under the Issuer section, Create an Issuance Program and create/choose a Schema that's appropriate for your application. Make note of the Schema details and the Issuance Program ID.


### 2. Choose Your Authentication Method

| Method | Identifier | Use Case | Configuration |
|--------|------------|----------|---------------|
| **🔗 Wallet** | Wallet Address | Web3 users, DeFi applications | `NEXT_PUBLIC_AUTH_METHOD=wallet` |
| **🆔 AIR Kit** | AIR Kit User ID | Direct AIR Kit integration | `NEXT_PUBLIC_AUTH_METHOD=airkit` |
| **🎵 Spotify** | Spotify User ID | Music applications, entertainment | `NEXT_PUBLIC_AUTH_METHOD=spotify` |
| **𝕏 Twitter** | Twitter User ID | Social media credentials, profile data | `NEXT_PUBLIC_AUTH_METHOD=twitter` |
| **🔧 Custom** | Your User ID | Custom OAuth providers | `NEXT_PUBLIC_AUTH_METHOD=custom` |

> **📚 Documentation**: See [docs/AUTHENTICATION_SETUP.md](docs/AUTHENTICATION_SETUP.md) for detailed setup guides for all authentication methods.

### 3. Set up Signing keys

Next, you'll need to set up a private key, which is used for user sessions for the issuance process. 

You may use your existing private key, or generate a new one. To generate a new ES256 private key, you may use the following command:
```bash
openssl ecparam -name prime256v1 -genkey -noout | openssl pkcs8 -topk8 -nocrypt | tr -d '\n'
```
Copy the middle part (between BEGIN and END lines) from the generated file and paste it as the value for `PARTNER_PRIVATE_KEY` in your `.env.local` file. (E.g., `PARTNER_PRIVATE_KEY="MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg..."`)

Example of how it should look in your `.env.local` file:
```bash
PARTNER_PRIVATE_KEY="MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg..."
```

**Note**: Keep the private key safe and never commit it as part of your source control.

> If you're not comfortable with using the private key directly within this template, then you may customize the user session validation and issuance Partner JWT in [api/auth/common/login.ts](app/(home)/api/auth/common/login.ts) and [api/user/user-data/route.ts](app/(home)/api/user/user-data/route.ts)

### 4. Retrieve User Data for issuance

Next, you'll need to customize the data retrieval for the logged in user and prepare for issuance.

1. Open [app/(home)/api/user/user-data/route.ts](app/(home)/api/user/user-data/route.ts)
2. Replace with real data fetching logic based on userId. You would likely want to retrieve the data by calling an API (backend to backend API call).
3. Transform the data to match your Schema.

### 5. Set up Environment Variables
Create a `.env.local` file and configure the  variables - see [Details](#environment-variables)

### 6. Set your JWKS URL

To complete the setup of your partner settings, you'll need to set up the JWKS URL setting for your Partner Account (Developer Dashboard > Account -> General Settings). 

Hence, you may need to deploy your application to get your JWKS URL. Once deployed, the JWKS URL is automatically generated by this app using the public key and hosted at `<your host url>/jwks.json`.

### 7. Develop, Test, and Deploy

Once JWKS URL is set, you should be able to issue credentials locally as well as on your deployed server.

## Environment Variables

#### Client-side Variables 
| Variable                     | Description                                                                 |
|------------------------------|-----------------------------------------------------------------------------|
| `NEXT_PUBLIC_PARTNER_ID`     | Your partner ID.                                                           |
| `NEXT_PUBLIC_ISSUER_DID`     | Your DID.                                                                  |
| `NEXT_PUBLIC_ISSUE_PROGRAM_ID` | Issuance program ID.                                                      |
| `NEXT_PUBLIC_HEADLINE`       | Headline text displayed on the page.                                       |
| `NEXT_PUBLIC_REOWN_PROJECT_ID` | Reown project ID - only required if using `wallet` NEXT_PUBLIC_AUTH_METHOD. |
| `NEXT_PUBLIC_APP_NAME`       | Application name.                                                          |
| `NEXT_PUBLIC_BUILD_ENV`      | Build environment (`production`, `sandbox`, `staging`).                    |
| `NEXT_PUBLIC_MOCA_CHAIN`     | MOCA chain (`devnet`, `testnet`).                                          |
| `NEXT_PUBLIC_AUTH_METHOD`    | Authentication method (`wallet`, `airkit`, `spotify`, `twitter`, or `custom`).      |
| `NEXT_PUBLIC_THEME`          | The theme of the app (`light`, `dark`, `system`).                          |

#### Server-side Variables
| Variable             | Description                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| `PARTNER_PRIVATE_KEY`| Your private key.                                                          |
| `SIGNING_ALGORITHM`  | Algorithm used for signing the JWT (e.g., `ES256`, `RS256`).               |


## Advanced

### Setting up Reown Account

To use Reown features, you need to set up a Reown account and configure the project:

1. **Create Reown Account**
   - Sign up at [Reown](https://reown.com)
   - Create a new project in your dashboard

2. **Configure Environment Variables**:
   Add the following to your `.env.local` file:
   ```bash
   NEXT_PUBLIC_REOWN_PROJECT_ID=your_reown_project_id
   ```

3. **Get Your Project ID**
   - Navigate to your project settings in the Reown dashboard
   - Copy the Project ID and paste it as the value for `NEXT_PUBLIC_REOWN_PROJECT_ID`

### Whitelist your domain

After deploying your application, you need to add your domain to the allowed domains list in the Partner Dashboard:

1. Go to [Sandbox Developer Dashboard](https://developers.sandbox.air3.com/dashboard)
2. Navigate to **Account > Domains**
3. Add your deployed application URL to the allowed domains list

This ensures that your deployed application can properly communicate with the AIR Kit services.

### Bringing your own user session

To use your internal User ID and User session within this app, you'll need the user to log into your app before starting the issuance process on this app.

This app reads cookies from `air.issuer-template.session`, expecting the following format (`{"state":{"accessToken":null},"version":0}`), where the accessToken is a signed JWT verifiable by your public key.

> Under the hood, the template uses a lightweight state management library called [zustand](https://www.npmjs.com/package/zustand).

Once the session is validated, you would use the contents of the payload (e.g., user Id) to retrieve specific user data info from your application.

### Production Build and Deployment

To build the application for production:
```bash
pnpm build
# or
npm run build
```

Start the production server:
```bash
pnpm start
# or
npm start
```

#### Deploying to Vercel

Click the button below to deploy directly to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/MocaNetwork/air-credential-issuance-template&env=NEXT_PUBLIC_PARTNER_ID,NEXT_PUBLIC_ISSUER_DID,NEXT_PUBLIC_ISSUE_PROGRAM_ID,NEXT_PUBLIC_HEADLINE,NEXT_PUBLIC_REOWN_PROJECT_ID,NEXT_PUBLIC_APP_NAME,NEXT_PUBLIC_BUILD_ENV,NEXT_PUBLIC_MOCA_CHAIN,NEXT_PUBLIC_AUTH_METHOD,NEXT_PUBLIC_THEME,PARTNER_PRIVATE_KEY,SIGNING_ALGORITHM&envDescription=Configure%20your%20AIR%20Kit%20credentials%20and%20application%20settings&envLink=https://github.com/MocaNetwork/air-credential-issuance-template/blob/main/README.md)


### Customizing the UI

This project uses Shadcn UI for a customizable design system. Refer to the [Shadcn UI Theming Guide](https://ui.shadcn.com/docs/theming) for detailed instructions.


## Tech Stack

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type checking
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Shadcn UI](https://ui.shadcn.com/) - UI components
- [Wagmi](https://wagmi.sh/) - Wallet connection
- [TanStack Query](https://tanstack.com/query) - Data fetching
- [Zod](https://zod.dev/) - Schema validation

## 📚 Documentation

### Quick Reference
- **Authentication Setup**: See [Authentication Methods](#authentication-methods) section above
- **Environment Variables**: See [Environment Variables](#environment-variables) section above
- **Spotify Integration**: See [Spotify Setup Guide](docs/SPOTIFY_SETUP.md)

### Detailed Documentation
For comprehensive guides and detailed setup instructions, see the [`docs/`](docs/) folder:

- **[📚 Documentation Index](docs/README.md)** - Complete documentation overview
- **[🔧 Modular Authentication System](docs/MODULAR_AUTH_SYSTEM.md)** - **NEW!** Extensible auth system
- **[🔧 Authentication Setup](docs/AUTHENTICATION_SETUP.md)** - Setup for all authentication methods
- **[🎵 Spotify Integration](docs/SPOTIFY_SETUP.md)** - Spotify OAuth setup and configuration
- **[𝕏 Twitter Integration](docs/TWITTER_SETUP.md)** - Twitter OAuth setup and configuration
- **[🛠️ Development Guide](docs/DEVELOPMENT_GUIDE.md)** - Development practices and project structure

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [MOCA Network](https://moca.network/)
- [Wagmi Documentation](https://wagmi.sh/)
- [Shadcn UI](https://ui.shadcn.com/)
- [AIR Kit Documentation](https://docs.air3.com/)
- [NextAuth.js Documentation](https://next-auth.js.org/)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
