import { useEffect, useState } from "react";

const ThemeToggle = () => {
    // Available themes
    const themes = ['light', 'dark', 'strike'];
    
    // Initialize state based on current theme or default to light
    const [currentTheme, setCurrentTheme] = useState(() => {
        // Check localStorage or system preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme && themes.includes(savedTheme)) {
            console.log('Found saved theme:', savedTheme);
            return savedTheme;
        }
        
        // Check system preference for dark mode
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        console.log('System prefers dark mode:', prefersDark);
        return prefersDark ? 'dark' : 'light';
    });

    // Apply theme whenever currentTheme state changes
    useEffect(() => {
        console.log('Applying theme from React component:', currentTheme);
        
        // Apply theme to document
        document.documentElement.setAttribute('data-theme', currentTheme);
        
        // Save to localStorage
        localStorage.setItem('theme', currentTheme);
        
        console.log('Theme applied successfully');
    }, [currentTheme]);

    // Listen for system theme changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleSystemThemeChange = (e) => {
            console.log('System theme changed:', e.matches ? 'dark' : 'light');
            
            // Only auto-switch if user hasn't manually set a preference recently
            const hasManualPreference = localStorage.getItem('theme');
            if (!hasManualPreference) {
                setCurrentTheme(e.matches ? 'dark' : 'light');
            }
        };

        mediaQuery.addEventListener('change', handleSystemThemeChange);
        
        // Cleanup
        return () => {
            mediaQuery.removeEventListener('change', handleSystemThemeChange);
        };
    }, []);

    const handleToggle = () => {
        console.log('Theme toggle clicked, current theme:', currentTheme);
        
        // Cycle through themes: light -> dark -> strike -> light
        const currentIndex = themes.indexOf(currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        const nextTheme = themes[nextIndex];
        
        console.log('Switching to theme:', nextTheme);
        setCurrentTheme(nextTheme);
    };

    // Get theme display info
    const getThemeInfo = () => {
        switch(currentTheme) {
            case 'light':
                return { icon: '☀️', label: 'Light', next: 'Dark' };
            case 'dark':
                return { icon: '🌙', label: 'Dark', next: 'Strike' };
            case 'strike':
                return { icon: '⚡', label: 'Strike', next: 'Light' };
            default:
                return { icon: '☀️', label: 'Light', next: 'Dark' };
        }
    };

    const themeInfo = getThemeInfo();

    return (
        <button 
            onClick={handleToggle}
            className="btn-secondary btn-small theme-toggle"
            aria-label={`Switch to ${themeInfo.next} mode`}
            title={`Current: ${themeInfo.label} - Click for ${themeInfo.next}`}
        >
            {themeInfo.icon} {themeInfo.label}
        </button>
    );
};

export default ThemeToggle;