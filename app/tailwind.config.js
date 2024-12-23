/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/**/*.{html,js,svelte,ts}'],
	safelist: ['dark'],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
				'3xl': '1600px'
			}
		},
		screens: {
			sm: '640px',
			md: '768px',
			lg: '1024px',
			xl: '1280px',
			'2xl': '1536px'
		},
		extend: {
			fontFamily: {
				recoleta: ['Recoleta', 'sans-serif'],
				'recoleta-alt': ['Recoleta-Alt', 'sans-serif'],
				poppins: ['Poppins', 'sans-serif'],
				jetbrains: ['JetBrains Mono', 'monospace'],
				brunoace: ['Bruno Ace', 'system-ui'],
				montserrat: ['Montserrat Variable', 'sans-serif'],
				'recoleta-bold': ['Recoleta-Bold', 'sans-serif']
			},
			colors: {
				white: {
					100: '#fff',
					105: '#f4f9ff',
					106: '#f5f5f5',
					200: '#ccc',
					300: '#ebebebb6',
					400: '#777',
					401: '#cccccc48',
					500: 'rgba(0,0,0,.1)',
					600: 'rgba(255,255,255,0.08)'
				},
				dark: {
					100: '#000',
					102: '#171717',
					103: '#141414',
					104: '#111111',
					105: '#050505',
					106: '#222222',
					107: '#161616',
					500: 'rgba(0,0,0,.4)'
				},
				gray: {
					100: '#212121',
					101: '#525252'
				},
				red: {
					100: 'rgb(255, 0, 0, .4)',
					102: '#FAEBEB',
					200: '#ff0000',
					300: '#cc0000',
					301: '#FF9F9F',
					302: "#fe605f",
					305: '#ff4741',
					400: '#990000',
					500: '#660000',
					600: '#330000',
					700: '#000000',
					800: '#FFECEC',
					802: '#F75C4E',
					803: '#FF6F6F'
				},
				orange: {
					100: '#FF8A65',
					102: '#ff5518',
					103: '#ff4723',
					200: 'rgba(255, 138, 101, 0.3)',
					300: '#f99d52',
					301: 'rgba(51, 30, 20, 1)'
				},
				blue: {
					100: '#3770fe',
					101: '#6b77f1',
					102: '#67A2F1',
					103: '#EEF7FF',
					200: '#0e2d52',
					201: '#f4fbfe',
					202: '#e7f2ff',
					203: '#f4f9ff',
					204: '#F6F8FA',
					205: '#F7F8FA',
					209: '#E2EFFF',
					210: '#0F2D53',
					211: '#F8FBFF'
				},
				green: {
					100: '#22C55E',
					102: '#EAF1DA',
					105: '#228637',
					200: 'rgba(34, 197, 94, 0.3)'
				},
				yellow: {
					100: '#F59E0B',
					102: '#F6E35D',
					103: '#DEB841',
					104: '#EFCE3F',
					105: '#E0A201'
				},
				pink: {
					100: '#E4295D',
					102: '#FDDDF6',
					200: 'rgba(228, 41, 93, 0.3)'
				},
				purple: {
					100: '#8f63f3',
					105: 'rgb(143, 99, 243,.3)'
				},
				cyan: {
					100: '#00ffff',
					101: '#23d5d5'
				},
				teal: {
					100: '#17BEBB',
					200: 'rgba(33, 182, 162, 0.3)'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				}
			},
			boxShadow: {
				custom: '0 2px 2px -2px rgba(0, 0, 0, 0.2)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: 0 },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: 0 }
				},
				'caret-blink': {
					'0%,70%,100%': { opacity: '1' },
					'20%,50%': { opacity: '0' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'caret-blink': 'caret-blink 1.25s ease-out infinite'
			}
		}
	},
	plugins: [
		({ addUtilities }) => {
			addUtilities({
				'.enableBounceEffect': {
					transition: 'all 0.1s',
					'&:target': {
						transform: 'scale(0.90)'
					},
					'&:active': {
						transform: 'scale(0.90)'
					}
				},
				'.enableMiniBounceEffect': {
					transition: 'all 0.1s',
					'&:target': {
						transform: 'scale(1)'
					},
					'&:active': {
						transform: 'scale(0.99)'
					}
				},
				'.flex-center': {
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center'
				},
				'.hideScrollbar': {
					overflow: 'hidden',
					scrollbarWidth: '3px',
					'&::-webkit-scrollbar': {
						width: '3px',
						background: 'transparent'
					},
					'&::-webkit-scrollbar-thumb': {
						background: '#777',
						borderRadius: '30px'
					}
				},
				'.hideScrollBar2': {
					scrollbarWidth: '3px',
					'&::-webkit-scrollbar': {
						width: '0px',
						background: 'transparent'
					},
					'&::-webkit-scrollbar-thumb': {
						background: 'transparent'
					}
				},
				'.hideScrollBar3': {
					scrollbarWidth: '3px',
					'&::-webkit-scrollbar': {
						width: '3px',
						background: 'transparent'
					},
					'&::-webkit-scrollbar-thumb': {
						background: '#cccccc76',
						borderRadius: '30px'
					}
				}
			});
		},
		require('@tailwindcss/forms')
	]
};
