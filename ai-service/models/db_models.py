"""SQLAlchemy database models mapping to the Prisma schema and custom tables."""

from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class UserSkill(Base):
    """User skills repository mapping with categories and proficiencies."""
    __tablename__ = "users_skills"

    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False, index=True)
    skill_name = Column(String, nullable=False)
    skill_category = Column(String, nullable=True)
    proficiency_level = Column(String, nullable=False, default="Beginner")
    endorsements_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    __table_args__ = (
        UniqueConstraint('user_id', 'skill_name', name='uix_user_skill'),
    )


class Team(Base):
    """Team details mapper linking to project workspace."""
    __tablename__ = "Team"

    id = Column(String, primary_key=True)
    projectId = Column(String, nullable=False, unique=True)
    createdAt = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    members = relationship("TeamMember", back_populates="team", cascade="all, delete-orphan")


class TeamMember(Base):
    """Team member roster record mapping user roles."""
    __tablename__ = "TeamMember"

    id = Column(String, primary_key=True)
    teamId = Column(String, ForeignKey("Team.id", ondelete="CASCADE"), nullable=False)
    userId = Column(String, nullable=False)
    role = Column(String, default="MEMBER", nullable=False)
    joinedAt = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    team = relationship("Team", back_populates="members")

    __table_args__ = (
        UniqueConstraint('teamId', 'userId', name='uix_team_member'),
    )


class Project(Base):
    """Project workspace listing titles and descriptions."""
    __tablename__ = "Project"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    status = Column(String, default="Draft", nullable=False)
    categoryId = Column(String, nullable=True)
    ownerId = Column(String, nullable=False)
    teamSize = Column(Integer, default=1, nullable=False)
    createdAt = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updatedAt = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    skills = relationship("ProjectSkill", back_populates="project", cascade="all, delete-orphan")


class Skill(Base):
    """Global taxonomy list of predefined skills."""
    __tablename__ = "Skill"

    id = Column(String, primary_key=True)
    name = Column(String, unique=True, nullable=False)

    projects = relationship("ProjectSkill", back_populates="skill", cascade="all, delete-orphan")


class ProjectSkill(Base):
    """Join table mapping projects to their required skills."""
    __tablename__ = "ProjectSkill"

    projectId = Column(String, ForeignKey("Project.id", ondelete="CASCADE"), primary_key=True)
    skillId = Column(String, ForeignKey("Skill.id", ondelete="CASCADE"), primary_key=True)

    project = relationship("Project", back_populates="skills")
    skill = relationship("Skill", back_populates="projects")
