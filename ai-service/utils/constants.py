"""Skill categories, proficiency levels, and taxonomy constants."""

from enum import Enum

# Proficiency Levels
class ProficiencyLevel(str, Enum):
    """Skill proficiency level enumeration."""
    BEGINNER = "Beginner"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"
    EXPERT = "Expert"

# Skill Categories
class SkillCategory(str, Enum):
    """Skill category enumeration."""
    TECHNICAL = "Technical"
    PROGRAMMING_LANGUAGE = "Programming Language"
    FRAMEWORK_LIBRARY = "Framework/Library"
    TOOLS_PLATFORMS = "Tools & Platforms"
    SOFT_SKILLS = "Soft Skills"
    DOMAIN_KNOWLEDGE = "Domain Knowledge"
    CLOUD_DEVOPS = "Cloud & DevOps"
    SECURITY = "Security"
    DATA_SCIENCE = "Data Science"
    OTHER = "Other"

# Predefined Skills Taxonomy - Common skills to standardize input
PREDEFINED_SKILLS = {
    # Programming Languages
    "python": {"category": SkillCategory.PROGRAMMING_LANGUAGE},
    "javascript": {"category": SkillCategory.PROGRAMMING_LANGUAGE},
    "typescript": {"category": SkillCategory.PROGRAMMING_LANGUAGE},
    "java": {"category": SkillCategory.PROGRAMMING_LANGUAGE},
    "c++": {"category": SkillCategory.PROGRAMMING_LANGUAGE},
    "c#": {"category": SkillCategory.PROGRAMMING_LANGUAGE},
    "go": {"category": SkillCategory.PROGRAMMING_LANGUAGE},
    "rust": {"category": SkillCategory.PROGRAMMING_LANGUAGE},
    "sql": {"category": SkillCategory.PROGRAMMING_LANGUAGE},
    "r": {"category": SkillCategory.PROGRAMMING_LANGUAGE},
    
    # Web Frameworks
    "react": {"category": SkillCategory.FRAMEWORK_LIBRARY},
    "vue.js": {"category": SkillCategory.FRAMEWORK_LIBRARY},
    "angular": {"category": SkillCategory.FRAMEWORK_LIBRARY},
    "django": {"category": SkillCategory.FRAMEWORK_LIBRARY},
    "fastapi": {"category": SkillCategory.FRAMEWORK_LIBRARY},
    "express.js": {"category": SkillCategory.FRAMEWORK_LIBRARY},
    "flask": {"category": SkillCategory.FRAMEWORK_LIBRARY},
    "spring boot": {"category": SkillCategory.FRAMEWORK_LIBRARY},
    "node.js": {"category": SkillCategory.FRAMEWORK_LIBRARY},
    "next.js": {"category": SkillCategory.FRAMEWORK_LIBRARY},
    
    # Databases
    "postgresql": {"category": SkillCategory.TOOLS_PLATFORMS},
    "mysql": {"category": SkillCategory.TOOLS_PLATFORMS},
    "mongodb": {"category": SkillCategory.TOOLS_PLATFORMS},
    "redis": {"category": SkillCategory.TOOLS_PLATFORMS},
    "firebase": {"category": SkillCategory.TOOLS_PLATFORMS},
    "elasticsearch": {"category": SkillCategory.TOOLS_PLATFORMS},
    
    # Cloud & DevOps
    "aws": {"category": SkillCategory.CLOUD_DEVOPS},
    "google cloud": {"category": SkillCategory.CLOUD_DEVOPS},
    "azure": {"category": SkillCategory.CLOUD_DEVOPS},
    "docker": {"category": SkillCategory.CLOUD_DEVOPS},
    "kubernetes": {"category": SkillCategory.CLOUD_DEVOPS},
    "ci/cd": {"category": SkillCategory.CLOUD_DEVOPS},
    "jenkins": {"category": SkillCategory.CLOUD_DEVOPS},
    "github actions": {"category": SkillCategory.CLOUD_DEVOPS},
    
    # Data Science & AI
    "machine learning": {"category": SkillCategory.DATA_SCIENCE},
    "deep learning": {"category": SkillCategory.DATA_SCIENCE},
    "tensorflow": {"category": SkillCategory.DATA_SCIENCE},
    "pytorch": {"category": SkillCategory.DATA_SCIENCE},
    "scikit-learn": {"category": SkillCategory.DATA_SCIENCE},
    "nlp": {"category": SkillCategory.DATA_SCIENCE},
    "computer vision": {"category": SkillCategory.DATA_SCIENCE},
    "data analysis": {"category": SkillCategory.DATA_SCIENCE},
    "pandas": {"category": SkillCategory.DATA_SCIENCE},
    "numpy": {"category": SkillCategory.DATA_SCIENCE},
    
    # Security
    "cybersecurity": {"category": SkillCategory.SECURITY},
    "network security": {"category": SkillCategory.SECURITY},
    "penetration testing": {"category": SkillCategory.SECURITY},
    "encryption": {"category": SkillCategory.SECURITY},
    "oauth": {"category": SkillCategory.SECURITY},
    "jwt": {"category": SkillCategory.SECURITY},
    
    # Soft Skills
    "project management": {"category": SkillCategory.SOFT_SKILLS},
    "communication": {"category": SkillCategory.SOFT_SKILLS},
    "leadership": {"category": SkillCategory.SOFT_SKILLS},
    "teamwork": {"category": SkillCategory.SOFT_SKILLS},
    "problem solving": {"category": SkillCategory.SOFT_SKILLS},
    "critical thinking": {"category": SkillCategory.SOFT_SKILLS},
    "time management": {"category": SkillCategory.SOFT_SKILLS},
    
    # Tools & Platforms
    "git": {"category": SkillCategory.TOOLS_PLATFORMS},
    "github": {"category": SkillCategory.TOOLS_PLATFORMS},
    "gitlab": {"category": SkillCategory.TOOLS_PLATFORMS},
    "jira": {"category": SkillCategory.TOOLS_PLATFORMS},
    "slack": {"category": SkillCategory.TOOLS_PLATFORMS},
    "figma": {"category": SkillCategory.TOOLS_PLATFORMS},
    "postman": {"category": SkillCategory.TOOLS_PLATFORMS},
    "vscode": {"category": SkillCategory.TOOLS_PLATFORMS},
    "linux": {"category": SkillCategory.TOOLS_PLATFORMS},
    "windows": {"category": SkillCategory.TOOLS_PLATFORMS},
}

# Map lowercase keys for case-insensitive lookup
PREDEFINED_SKILLS_LOWERCASE = {k.lower(): v for k, v in PREDEFINED_SKILLS.items()}

# Skill Category Descriptions
SKILL_CATEGORY_DESCRIPTIONS = {
    SkillCategory.TECHNICAL: "Core technical competencies and frameworks",
    SkillCategory.PROGRAMMING_LANGUAGE: "Programming and scripting languages",
    SkillCategory.FRAMEWORK_LIBRARY: "Libraries, frameworks, and development toolkits",
    SkillCategory.TOOLS_PLATFORMS: "Development tools, platforms, and utilities",
    SkillCategory.SOFT_SKILLS: "Communication, leadership, and interpersonal abilities",
    SkillCategory.DOMAIN_KNOWLEDGE: "Domain-specific expertise and knowledge areas",
    SkillCategory.CLOUD_DEVOPS: "Cloud services, infrastructure, and deployment",
    SkillCategory.SECURITY: "Security and privacy expertise",
    SkillCategory.DATA_SCIENCE: "AI, ML, and data analysis",
    SkillCategory.OTHER: "Other skills not categorized above",
}

# Proficiency Level Descriptions
PROFICIENCY_DESCRIPTIONS = {
    ProficiencyLevel.BEGINNER: "Basic understanding, learning phase",
    ProficiencyLevel.INTERMEDIATE: "Comfortable with practical application",
    ProficiencyLevel.ADVANCED: "Deep expertise, can mentor others",
    ProficiencyLevel.EXPERT: "Master level, published work or extensive experience",
}

# Validation Constants
MAX_SKILL_NAME_LENGTH = 100
MIN_SKILL_NAME_LENGTH = 2
MAX_SKILLS_PER_USER = 50
SKILL_NAME_PATTERN = r"^[a-zA-Z0-9\s\-\./\+#]+$"  # Allow alphanumeric, spaces, hyphens, dots, slashes, plus, hash

# Map lowercase keys to correct human-readable casing for normalization
SKILL_DISPLAY_NAMES = {
    "python": "Python",
    "javascript": "JavaScript",
    "typescript": "TypeScript",
    "java": "Java",
    "c++": "C++",
    "c#": "C#",
    "go": "Go",
    "rust": "Rust",
    "sql": "SQL",
    "r": "R",
    "react": "React",
    "vue.js": "Vue.js",
    "angular": "Angular",
    "django": "Django",
    "fastapi": "FastAPI",
    "express.js": "Express.js",
    "flask": "Flask",
    "spring boot": "Spring Boot",
    "node.js": "Node.js",
    "next.js": "Next.js",
    "postgresql": "PostgreSQL",
    "mysql": "MySQL",
    "mongodb": "MongoDB",
    "redis": "Redis",
    "firebase": "Firebase",
    "elasticsearch": "Elasticsearch",
    "aws": "AWS",
    "google cloud": "Google Cloud",
    "azure": "Azure",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "ci/cd": "CI/CD",
    "jenkins": "Jenkins",
    "github actions": "GitHub Actions",
    "machine learning": "Machine Learning",
    "deep learning": "Deep Learning",
    "tensorflow": "TensorFlow",
    "pytorch": "PyTorch",
    "scikit-learn": "Scikit-Learn",
    "nlp": "NLP",
    "computer vision": "Computer Vision",
    "data analysis": "Data Analysis",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "cybersecurity": "Cybersecurity",
    "network security": "Network Security",
    "penetration testing": "Penetration Testing",
    "encryption": "Encryption",
    "oauth": "OAuth",
    "jwt": "JWT",
    "project management": "Project Management",
    "communication": "Communication",
    "leadership": "Leadership",
    "teamwork": "Teamwork",
    "problem solving": "Problem Solving",
    "critical thinking": "Critical Thinking",
    "time management": "Time Management",
    "git": "Git",
    "github": "GitHub",
    "gitlab": "GitLab",
    "jira": "Jira",
    "slack": "Slack",
    "figma": "Figma",
    "postman": "Postman",
    "vscode": "VS Code",
    "linux": "Linux",
    "windows": "Windows"
}

