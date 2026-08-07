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
  const contributorsFile = path.join(repoRoot, 'CONTRIBUTORS.md');

  // Ensure badges directory exists
  if (!fs.existsSync(badgesDir)) {
    fs.mkdirSync(badgesDir, { recursive: true });
  }

  let tableMarkdown = `# Project Contributors\n\n`;
  tableMarkdown += `Thank you to all our amazing contributors! Here is the live status of their PR contributions and titles.\n\n`;
  tableMarkdown += `| Contributor | GitHub | PRs | Current Title |\n`;
  tableMarkdown += `| :--- | :--- | :---: | :--- |\n`;

  for (const username of CONTRIBUTORS) {
    console.log(`Fetching stats for ${username}...`);
    
    // Fetch PR count and Title
    const prCount = await GithubService.getUserPRCount(username);
    const title = GithubService.getTitleFromPRCount(prCount);
    
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
    
    // Slight delay to avoid hitting GitHub API rate limits too quickly
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Write the markdown file
  fs.writeFileSync(contributorsFile, tableMarkdown);
  console.log(`\nSuccess! Wrote badges to /badges/ and generated CONTRIBUTORS.md`);
}

generateContributorsTable().catch(console.error);
