export class BadgeGenerator {
  /**
   * Generates a beautiful SVG badge for a contributor based on their title and PR count.
   * 
   * @param title The contributor's title (e.g., 'Lead Developer')
   * @param prCount The number of PRs
   * @returns A string containing the SVG markup
   */
  static generateBadgeSVG(title: string, prCount: number): string {
    // Define stunning, premium color gradients for each tier
    const colors: Record<string, { start: string, end: string, text: string }> = {
      'Contributor': { start: '#3B82F6', end: '#2563EB', text: '#FFFFFF' }, // Blue
      'Named Developer': { start: '#10B981', end: '#059669', text: '#FFFFFF' }, // Emerald
      'Advanced Developer': { start: '#8B5CF6', end: '#6D28D9', text: '#FFFFFF' }, // Violet
      'Lead Developer': { start: '#F59E0B', end: '#D97706', text: '#FFFFFF' }, // Amber
      'Co-Owner': { start: '#EF4444', end: '#B91C1C', text: '#FFFFFF' }, // Red
    };

    const theme = colors[title] || colors['Contributor'];

    // Premium styling using a modern pill-shaped SVG with drop shadows and gradients
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="32" viewBox="0 0 200 32">
        <defs>
          <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="${theme.start}" />
            <stop offset="100%" stop-color="${theme.end}" />
          </linearGradient>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3" />
          </filter>
        </defs>
        
        <rect x="2" y="2" width="196" height="28" rx="14" fill="url(#bg-grad)" filter="url(#shadow)" />
        
        <g font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="12" font-weight="bold" fill="${theme.text}">
          <text x="16" y="20">${title}</text>
          <rect x="140" y="6" width="50" height="20" rx="10" fill="#000000" fill-opacity="0.2" />
          <text x="165" y="20" text-anchor="middle">${prCount} PRs</text>
        </g>
      </svg>
    `.trim();
  }
}
