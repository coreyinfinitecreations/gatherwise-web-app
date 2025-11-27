# Google Maps API Setup

The application uses Google Maps for multiple features:

- **Places API**: Address autocomplete in profile pages
- **Maps JavaScript API + Visualization Library**: Heat maps for Life Group coverage analysis

## Setup Instructions

### 1. Get a Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the required APIs for your project:
   - Navigate to "APIs & Services" > "Library"
   - Search for and enable:
     - **Places API** (for address autocomplete)
     - **Maps JavaScript API** (for map visualization)
     - **Geocoding API** (for ZIP code and boundary overlays)
   - Click on each and press "Enable"
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
   - Choose all three APIs from the dropdown:
     - Places API
     - Maps JavaScript API
     - Geocoding API

### 4. Restart Your Development Server

After adding the API key, restart your Next.js development server:

```bash
npm run dev
```

## Features Using Google Maps

### Life Group Heat Map

Location: `/dashboard/life-groups` (Coverage Map tab)

The heat map visualization shows:

- Geographic distribution of life groups
- Coverage intensity based on member counts
- Marker pins for each life group location
- Custom gradient from cyan → blue → purple → red

The component automatically:

- Loads the Maps JavaScript API with visualization library
- Centers the map on the church's region
- Displays error messages if API key is missing

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
