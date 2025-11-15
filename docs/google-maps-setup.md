# Google Maps API Setup

The application uses Google Maps Places API for address autocomplete functionality in the profile page.

## Setup Instructions

### 1. Get a Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Places API** for your project:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Places API"
   - Click on it and press "Enable"
4. Create credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key

### 2. Configure the API Key

1. Copy `.env.example` to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

2. Add your Google Maps API key to `.env.local`:
   ```bash
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-actual-api-key-here"
   ```

### 3. Secure Your API Key (Recommended)

1. In the Google Cloud Console, click on your API key to edit it
2. Under "Application restrictions":
   - For development: Select "HTTP referrers" and add `http://localhost:3000/*`
   - For production: Add your production domain(s)
3. Under "API restrictions":
   - Select "Restrict key"
   - Choose "Places API" from the dropdown

### 4. Restart Your Development Server

After adding the API key, restart your Next.js development server:

```bash
npm run dev
```

## Features

- **Address Autocomplete**: As users type in the address field, Google Places suggestions will appear
- **Auto-fill**: When a user selects an address from the dropdown:
  - Street address is populated in the "Address" field
  - City is populated in the "City" field
  - State is populated in the "State" field
  - ZIP code is populated in the "ZIP Code" field

## Troubleshooting

- **No autocomplete suggestions**: Check that your API key is set correctly and the Places API is enabled
- **Console errors about API key**: Verify the key is in `.env.local` with the correct prefix `NEXT_PUBLIC_`
- **Billing errors**: Google Maps requires billing to be enabled, but includes a free tier with generous usage limits
