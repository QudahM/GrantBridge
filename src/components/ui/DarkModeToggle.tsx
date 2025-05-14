import { Moon, Sun } from "lucide-react";
import { useEffect } from "react";

export default function DarkModeToggle() {

    useEffect(() => {
        const isDarkMode = localStorage.getItem("theme") === "dark";
        document.documentElement.classList.toggle("dark", isDarkMode);
    }, []);

    const toggleDarkMode = () => {
        const isDarkMode = document.documentElement.classList.toggle("dark");
        localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    };

    return (
        <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full border border-border bg-background text-foreground hover:bg-muted transition"
            aria-label="Toggle dark mode"
        >
            <Sun className="hidden dark:block w-5 h-5" />
            <Moon className="block dark:hidden w-5 h-5" />
        </button>
    );
}