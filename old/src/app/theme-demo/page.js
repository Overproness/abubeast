import ThemeDemo from "../../components/ThemeDemo";

export default function ThemeDemoPage() {
  return (
    <div className="min-h-screen bg-background">
      <ThemeDemo />
    </div>
  );
}

export const metadata = {
  title: "Theme Demo - AbuBeast",
  description: "Test and validate dark mode implementation across the platform",
};
