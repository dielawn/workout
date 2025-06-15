// darkMode.js - Dark Mode Implementation

class DarkModeManager {
    constructor() {
        this.init();
    }

    init() {
        console.log('Initializing Dark Mode Manager...');
        
        // Check for saved theme preference or default to light mode
        this.currentTheme = localStorage.getItem('theme') || 'light';
        console.log('Current theme:', this.currentTheme);
        
        // Apply the theme immediately
        this.applyTheme(this.currentTheme);
        
        // Add toggle button to header if it doesn't exist
        this.addToggleButton();
        
        // Listen for system theme changes
        this.listenForSystemChanges();
    }

    applyTheme(theme) {
        console.log('Applying theme:', theme);
        
        // Set the data-theme attribute on the document root
        document.documentElement.setAttribute('data-theme', theme);
        
        // Save to localStorage
        localStorage.setItem('theme', theme);
        
        // Update current theme
        this.currentTheme = theme;
        
        // Update toggle button text/icon
        this.updateToggleButton();
        
        console.log('Theme applied successfully');
    }

    toggleTheme() {
        console.log('Toggling theme from:', this.currentTheme);
        
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        
        console.log('Theme toggled to:', newTheme);
    }

    addToggleButton() {
        // Check if button already exists
        if (document.getElementById('theme-toggle')) {
            console.log('Theme toggle button already exists');
            return;
        }

        console.log('Adding theme toggle button...');
        
        // Find the header or create a container for the toggle
        const header = document.querySelector('.app-header') || document.querySelector('.current-trainee-info');
        
        if (header) {
            // Create toggle button
            const toggleButton = document.createElement('button');
            toggleButton.id = 'theme-toggle';
            toggleButton.className = 'btn-secondary btn-small theme-toggle';
            toggleButton.setAttribute('aria-label', 'Toggle dark mode');
            
            // Add click event
            toggleButton.addEventListener('click', () => {
                console.log('Theme toggle button clicked');
                this.toggleTheme();
            });
            
            // Insert the button
            if (header.classList.contains('app-header')) {
                // Add to the header's current-trainee-info section or create one
                const infoSection = header.querySelector('.current-trainee-info');
                if (infoSection) {
                    infoSection.appendChild(toggleButton);
                } else {
                    header.appendChild(toggleButton);
                }
            } else {
                header.appendChild(toggleButton);
            }
            
            // Set initial button text
            this.updateToggleButton();
            
            console.log('Theme toggle button added successfully');
        } else {
            console.warn('Could not find header to add toggle button');
        }
    }

    updateToggleButton() {
        const button = document.getElementById('theme-toggle');
        if (button) {
            // Update button text based on current theme
            if (this.currentTheme === 'light') {
                button.innerHTML = '🌙 Dark';
                button.title = 'Switch to dark mode';
            } else {
                button.innerHTML = '☀️ Light';
                button.title = 'Switch to light mode';
            }
            
            console.log('Toggle button updated for theme:', this.currentTheme);
        }
    }

    listenForSystemChanges() {
        // Listen for system dark mode preference changes
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            mediaQuery.addEventListener('change', (e) => {
                console.log('System theme preference changed:', e.matches ? 'dark' : 'light');
                
                // Only auto-switch if user hasn't manually set a preference
                if (!localStorage.getItem('theme')) {
                    this.applyTheme(e.matches ? 'dark' : 'light');
                }
            });
            
            console.log('Listening for system theme changes');
        }
    }

    // Method to respect system preference if no manual choice was made
    useSystemPreference() {
        console.log('Checking system preference...');
        
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            console.log('System prefers dark mode');
            this.applyTheme('dark');
        } else {
            console.log('System prefers light mode');
            this.applyTheme('light');
        }
    }

    // Method to reset to system preference
    resetToSystem() {
        console.log('Resetting to system preference...');
        localStorage.removeItem('theme');
        this.useSystemPreference();
    }
}

// Initialize dark mode when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing dark mode...');
    window.darkModeManager = new DarkModeManager();
});

// Also initialize if script loads after DOM (for dynamic loading)
if (document.readyState === 'loading') {
    console.log('Document still loading, waiting for DOMContentLoaded...');
} else {
    console.log('Document already loaded, initializing dark mode immediately...');
    window.darkModeManager = new DarkModeManager();
}

// Export for use in other modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DarkModeManager;
}