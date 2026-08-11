import * as dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import path from 'path';
import { GithubService } from '../src/services/githubService';
import { BadgeGenerator } from '../src/services/badgeGenerator';

// The list of contributors provided by the user
const CONTRIBUTORS = [
  'adipa-coding',
  'Dinyyyd',
  'RVHerath',
  'devbykushan',
  'IT24104241',
  'it24103570',
  'ArchanaPanchali',
  'Vikumd34',
  'VinujiBandaranayaka',
  'Sewwandi23',
  'Chathuka-Pehesara'
];

async function generateContributorsTable() {
  console.log('Starting contributor badge generation...');
  
  // Paths
  const repoRoot = path.join(__dirname, '..', '..');
  const badgesDir = path.join(repoRoot, 'badges');
  const readmeFile = path.join(repoRoot, 'README.md');

  // Ensure badges directory exists
  if (!fs.existsSync(badgesDir)) {
    fs.mkdirSync(badgesDir, { recursive: true });
  }

  let tableMarkdown = `| Contributor | GitHub | PRs | Current Title |\n`;
  tableMarkdown += `| :--- | :--- | :---: | :--- |\n`;

  const stats = [];

  for (const username of CONTRIBUTORS) {
    console.log(`Fetching stats for ${username}...`);
    
    // Fetch PR count and Title
    const prCount = await GithubService.getUserPRCount(username);
    const title = GithubService.getTitleFromPRCount(prCount);
    
    stats.push({ username, prCount, title });
    
    // Slight delay to avoid hitting GitHub API rate limits too quickly
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Sort by PR count descending
  stats.sort((a, b) => b.prCount - a.prCount);

  for (const stat of stats) {
    const { username, prCount, title } = stat;
    
    // Generate SVG Badge
    const svgContent = BadgeGenerator.generateBadgeSVG(title, prCount);
    
    // Save SVG to /badges folder
    const badgePath = path.join(badgesDir, `${username}.svg`);
    fs.writeFileSync(badgePath, svgContent);
    
    // Append to Table
    // Avatar is fetched directly from github via {username}.png
    const avatar = `<img src="https://github.com/${username}.png?size=40" width="40" height="40" style="border-radius:50%;" />`;
    const githubLink = `[${username}](https://github.com/${username})`;
    const badgeImg = `![${title}](badges/${username}.svg)`;
    
    tableMarkdown += `| ${avatar} | ${githubLink} | **${prCount}** | ${badgeImg} |\n`;
  }

  // Write the markdown file
  let readmeContent = fs.readFileSync(readmeFile, 'utf8');
  const startMarker = '<!-- CONTRIBUTORS-START -->';
  const endMarker = '<!-- CONTRIBUTORS-END -->';
  const regex = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`);
  
  readmeContent = readmeContent.replace(regex, `${startMarker}\n${tableMarkdown}${endMarker}`);
  
  fs.writeFileSync(readmeFile, readmeContent);
  console.log(`\nSuccess! Wrote badges to /badges/ and injected table into README.md`);
}

generateContributorsTable().catch(console.error);
