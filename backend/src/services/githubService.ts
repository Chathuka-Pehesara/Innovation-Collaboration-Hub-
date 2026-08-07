import axios from 'axios';

/**
 * Service to interact with the GitHub API.
 */
export class GithubService {
  /**
   * Fetches the number of pull requests a user has made.
   * This uses the GitHub Search API.
   * 
   * @param username The GitHub username of the contributor
   * @returns The total number of PRs created by the user
   */
  static async getUserPRCount(username: string): Promise<number> {
    try {
      // We search for merged PRs authored by the user to the main branch of the specific repository
      const repo = 'Chathuka-Pehesara/Innovation-Collaboration-Hub-';
      const query = `repo:${repo} is:pr is:merged base:main author:${username}`;
      const response = await axios.get(`https://api.github.com/search/issues?q=${encodeURIComponent(query)}`);
      
      return response.data.total_count || 0;
    } catch (error) {
      console.error(`Error fetching PR count for user ${username}:`, error);
      return 0; // Return 0 as fallback
    }
  }

  /**
   * Calculates the title and level based on PR count.
   * 
   * @param prCount Total PRs
   * @returns The user's title
   */
  static getTitleFromPRCount(prCount: number): string {
    if (prCount < 5) return 'Contributor';
    if (prCount >= 5 && prCount <= 9) return 'Named Developer';
    if (prCount >= 10 && prCount <= 24) return 'Advanced Developer';
    if (prCount >= 25 && prCount <= 49) return 'Lead Developer';
    return 'Co-Owner'; // 50+
  }
}
