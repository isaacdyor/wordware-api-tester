import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { buttonVariants } from "./ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div
      onClick={toggleTheme}
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon" }),
        "shrink-0 hover:cursor-pointer",
      )}
    >
      <Sun className="h-5 w-5 text-muted-foreground dark:hidden" />
      <Moon className="hidden h-5 w-5 text-muted-foreground dark:block" />
    </div>
  );
}
