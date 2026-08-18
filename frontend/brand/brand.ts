export const brand = {
  name: "MJC Fécamp",
  productName: "MJC Chatbot",
  assets: {
    mascot: "/brand/goellan.png",
    mjcLogo: "/brand/mjc_logo.jpg",
  },
  /**
   * Palette based on the MJC logo and site theme (`mjcfecamp.org`).
   * Change these values to reskin the UI without touching components.
   */
  colors: {
    accent: "#0070B8",
    accent2: "#13AFF0",
    text: "#0B1220",
    textMuted: "rgba(11, 18, 32, 0.72)",
    surface: "rgba(255, 255, 255, 0.82)",
    surfaceSolid: "#FFFFFF",
    border: "rgba(11, 18, 32, 0.12)",
    background: "#F8FAFC",
    background2: "#F1F1F1",
    danger: "#B71C1C",
    successBg: "#E8F5E9",
    successText: "#1B5E20",
  },
} as const;

