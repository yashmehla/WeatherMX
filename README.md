# 🌦️ WeatherMX

**WeatherMX** is a sleek, real-time weather forecasting web application that delivers comprehensive meteorological data for cities across the globe. Built with **Next.js (App Router)** and **Tailwind CSS**, WeatherMX offers a responsive and interactive UI with live weather updates, wind analysis, a dynamic map, and a 3-day forecast.


---

## 🚀 Features

- 🌤️ **Current Weather**: Live temperature, feels-like value, and sky condition.
- 🌬️ **Wind Analysis**:
  - Speed in km/h
  - Direction with degree
  - Intensity scale (Calm → Strong)
- 📊 **Atmospheric Data**:
  - UV Index
  - Humidity
  - Cloud Cover
  - Visibility (in km)
- 🕑 **Sunrise & Sunset Times**
- 🗺️ **Weather Map**:
  - Wind direction visualization via **Leaflet.js**
  - Location-specific map rendering
- 📅 **3-Day Weather Forecast**:
  - Daily highs/lows
  - Thunderstorms, rain, or clear sky indications
- 🌘 **Dark Mode Friendly UI**
- 🔁 **Real-time Auto Refresh** with timestamps

---

## 🛠️ Tech Stack

| Technology     | Purpose                         |
|----------------|----------------------------------|
| **Next.js**    | App framework (App Router)       |
| **React**      | UI building                      |
| **TypeScript** | Type-safe JavaScript             |
| **Tailwind CSS** | Responsive styling             |
| **WeatherAPI** | Live weather data                |
| **Open-Meteo** | Atmospheric info (fallback/data) |
| **Leaflet.js** | Interactive map rendering        |
| **Framer Motion** | Animations (optional use)    |
| **PNPM**       | Package manager                  |

---

## 📁 Project Structure

```bash
├── app/                # App routes and pages
├── components/         # UI components
├── hooks/              # Custom React hooks
├── lib/                # Helper utilities
├── public/             # Static assets (icons, images)
├── styles/             # Tailwind and global styles
├── components.json     # UI component registry
├── tailwind.config.ts  # Tailwind configuration
├── postcss.config.mjs  # PostCSS plugins
├── next.config.mjs     # Next.js config
├── tsconfig.json       # TypeScript config
├── package.json        # Project metadata
├── pnpm-lock.yaml      # Lockfile for dependencies
```

---

## 🔧 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yashmehla/weathermx.git
cd weathermx
```

### 2. Install Dependencies

```bash
pnpm install
```

> Make sure you have `pnpm` installed globally. If not:

```bash
npm install -g pnpm
```

### 3. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deployment

### 🚀 Deploy to Vercel (Recommended)

1. **Push to GitHub**  
   Make sure your project is committed and pushed to a GitHub repository.

2. **Login to Vercel**  
   Go to [vercel.com](https://vercel.com) and sign in with your GitHub account.

3. **Import Your Project**  
   - Click **“New Project”**
   - Select your WeatherMX repository
   - Confirm framework as **Next.js**

4. **Deploy**  
   Click **Deploy** and wait for your project to go live.

> After deployment, Vercel provides a public URL like:  
> `https://weathermx.vercel.app`

---

### 🖥️ Manual Deployment (Node.js Hosting)

1. **Build the App**

```bash
pnpm build
```

2. **Start the Server**

```bash
pnpm start
```

---

## 📜 License

Open to all contributions/contributors.

---

> Fork it, star it ⭐, and contribute 🚀
