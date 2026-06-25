"""
Embedding cache management with file-based persistence and TTL support.
Handles local caching of vector embeddings to reduce API calls and latency.
"""

import os
import json
import hashlib
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)


class EmbeddingCache:
    """File-based cache for embeddings with TTL support."""

    def __init__(self, cache_dir: str = "./cache/embeddings", ttl_hours: int = 24):
        """Initialize embedding cache."""
        self.cache_dir = Path(cache_dir)
        self.ttl = timedelta(hours=ttl_hours)
        
        # Create cache directory if it doesn't exist
        try:
            self.cache_dir.mkdir(parents=True, exist_ok=True)
            logger.info(f"Cache directory initialized: {self.cache_dir}")
        except Exception as e:
            logger.warning(f"Failed to create cache directory: {e}")
            self.cache_dir = None

    def _get_cache_key(self, text: str) -> str:
        """Generate cache key from text hash."""
        return hashlib.md5(text.encode()).hexdigest()

    def _get_cache_file(self, key: str) -> Path:
        """Get cache file path."""
        return self.cache_dir / f"{key}.json"

    def get(self, text: str) -> Optional[Dict[str, Any]]:
        """Retrieve embedding from cache if exists and not expired."""
        if not self.cache_dir:
            return None

        try:
            key = self._get_cache_key(text)
            cache_file = self._get_cache_file(key)

            if not cache_file.exists():
                return None

            with open(cache_file, 'r') as f:
                data = json.load(f)

            # Check TTL
            created_at = datetime.fromisoformat(data.get('created_at', ''))
            if datetime.now() - created_at > self.ttl:
                cache_file.unlink()
                logger.debug(f"Cache expired for key: {key}")
                return None

            logger.debug(f"Cache hit for: {text[:50]}...")
            return data.get('embedding')

        except Exception as e:
            logger.warning(f"Cache retrieval failed: {e}")
            return None

    def set(self, text: str, embedding: list) -> bool:
        """Store embedding in cache."""
        if not self.cache_dir:
            return False

        try:
            key = self._get_cache_key(text)
            cache_file = self._get_cache_file(key)

            data = {
                'text': text,
                'embedding': embedding,
                'created_at': datetime.now().isoformat(),
                'ttl_hours': self.ttl.total_seconds() / 3600
            }

            with open(cache_file, 'w') as f:
                json.dump(data, f)

            logger.debug(f"Cached embedding for: {text[:50]}...")
            return True

        except Exception as e:
            logger.warning(f"Cache storage failed: {e}")
            return False

    def clear(self) -> int:
        """Clear all expired cache entries."""
        if not self.cache_dir:
            return 0

        count = 0
        try:
            for cache_file in self.cache_dir.glob("*.json"):
                try:
                    with open(cache_file, 'r') as f:
                        data = json.load(f)
                    
                    created_at = datetime.fromisoformat(data.get('created_at', ''))
                    if datetime.now() - created_at > self.ttl:
                        cache_file.unlink()
                        count += 1
                except Exception:
                    pass

            logger.info(f"Cleared {count} expired cache entries")
            return count

        except Exception as e:
            logger.warning(f"Cache cleanup failed: {e}")
            return 0

    def stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        if not self.cache_dir:
            return {'status': 'disabled', 'total_entries': 0}

        try:
            entries = list(self.cache_dir.glob("*.json"))
            total_size = sum(f.stat().st_size for f in entries) / (1024 * 1024)  # MB
            
            return {
                'total_entries': len(entries),
                'total_size_mb': round(total_size, 2),
                'cache_dir': str(self.cache_dir),
                'ttl_hours': self.ttl.total_seconds() / 3600
            }
        except Exception as e:
            logger.warning(f"Failed to get cache stats: {e}")
            return {'status': 'error', 'message': str(e)}
