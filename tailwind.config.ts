import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  jit: true,
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/onborda/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			border: 'var(--border)',
  			input: 'var(--input)',
  			ring: 'var(--ring)',
  			background: 'var(--background)',
  			foreground: 'var(--foreground)',
  			primary: {
  				DEFAULT: 'var(--primary)',
  				foreground: 'var(--primary-foreground)'
  			},
  			secondary: {
  				DEFAULT: 'var(--secondary)',
  				foreground: 'var(--secondary-foreground)'
  			},
  			destructive: {
  				DEFAULT: 'var(--destructive)',
  				foreground: 'var(--destructive-foreground)'
  			},
  			muted: {
  				DEFAULT: 'var(--muted)',
  				foreground: 'var(--muted-foreground)'
  			},
  			accent: {
  				DEFAULT: 'var(--accent)',
  				foreground: 'var(--accent-foreground)'
  			},
  			popover: {
  				DEFAULT: 'var(--popover)',
  				foreground: 'var(--popover-foreground)'
  			},
  			card: {
  				DEFAULT: 'var(--card)',
  				foreground: 'var(--card-foreground)'
  			},
  			chart: {
  				'1': 'var(--chart-1)',
  				'2': 'var(--chart-2)',
  				'3': 'var(--chart-3)',
  				'4': 'var(--chart-4)',
  				'5': 'var(--chart-5)'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'var(--sidebar-primary-foreground)',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'var(--sidebar-accent-foreground)',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))'
  			},
  			surface: 'var(--surface)',
  			'surface-dark': 'var(--surface-dark)'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			full: '9999px'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			moveHorizontal: {
  				'0%': {
  					transform: 'translateX(-50%) translateY(-10%)'
  				},
  				'50%': {
  					transform: 'translateX(50%) translateY(10%)'
  				},
  				'100%': {
  					transform: 'translateX(-50%) translateY(-10%)'
  				}
  			},
  			moveInCircle: {
  				'0%': {
  					transform: 'rotate(0deg)'
  				},
  				'50%': {
  					transform: 'rotate(180deg)'
  				},
  				'100%': {
  					transform: 'rotate(360deg)'
  				}
  			},
  			moveVertical: {
  				'0%': {
  					transform: 'translateY(-50%)'
  				},
  				'50%': {
  					transform: 'translateY(50%)'
  				},
  				'100%': {
  					transform: 'translateY(-50%)'
  				}
  			},
  			'star-movement-bottom': {
  				'0%': {
  					transform: 'translate(0%, 0%)',
  					opacity: '1'
  				},
  				'100%': {
  					transform: 'translate(-100%, 0%)',
  					opacity: '0'
  				}
  			},
  			'star-movement-top': {
  				'0%': {
  					transform: 'translate(0%, 0%)',
  					opacity: '1'
  				},
  				'100%': {
  					transform: 'translate(100%, 0%)',
  					opacity: '0'
  				}
  			}
  		},
  		animation: {
  			first: 'moveVertical 30s ease infinite',
  			second: 'moveInCircle 20s reverse infinite',
  			third: 'moveInCircle 40s linear infinite',
  			fourth: 'moveHorizontal 40s ease infinite',
  			fifth: 'moveInCircle 20s ease infinite',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'star-movement-bottom': 'star-movement-bottom linear infinite alternate',
  			'star-movement-top': 'star-movement-top linear infinite alternate'
  		},
  		fontFamily: {
  			satoshi: [
  				'Satoshi',
  				'sans-serif'
  			],
  			sentient: [
  				'Sentient',
  				'sans-serif'
  			],
  			general: [
  				'Inter',
  				'sans-serif'
  			],
  			sans: [
  				'Inter',
  				'sans-serif'
  			],
  			instrument: [
  				'Instrument Serif',
  				'serif'
  			]
  		},
  		backgroundImage: {
  			'grid-pattern': 'url('/grid-pattern.svg')',
  			'grid-pattern-light': 'url('/grid-pattern-light.svg')'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
