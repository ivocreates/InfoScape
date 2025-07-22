"""
Data Correlation Engine for InfoScape
Handles entity resolution, confidence scoring, and relationship mapping
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
import json
import re
from difflib import SequenceMatcher
import numpy as np

logger = logging.getLogger(__name__)

@dataclass
class EntityMatch:
    """Represents a potential entity match"""
    entity_id: str
    confidence: float
    source: str
    data: Dict[str, Any]
    timestamp: datetime
    match_type: str

@dataclass
class CorrelationResult:
    """Result of correlation analysis"""
    primary_entity: Dict[str, Any]
    related_entities: List[EntityMatch]
    confidence_score: float
    correlation_graph: Dict[str, List[str]]
    metadata: Dict[str, Any]

class DataCorrelationEngine:
    """Advanced data correlation and entity resolution engine"""
    
    def __init__(self):
        self.confidence_threshold = 0.5
        self.entity_cache = {}
        self.correlation_rules = self._load_correlation_rules()
        
    def _load_correlation_rules(self) -> Dict[str, Any]:
        """Load correlation rules and patterns"""
        return {
            'email_patterns': {
                'username_extract': r'^([^@]+)@',
                'domain_extract': r'@(.+)$',
                'provider_mapping': {
                    'gmail.com': 'google',
                    'yahoo.com': 'yahoo',
                    'outlook.com': 'microsoft',
                    'hotmail.com': 'microsoft'
                }
            },
            'username_patterns': {
                'social_variations': [
                    '{username}',
                    '{username}_{number}',
                    '{username}.{name}',
                    '{name}.{username}',
                    '{username}official'
                ]
            },
            'name_patterns': {
                'variations': [
                    '{first} {last}',
                    '{first}.{last}',
                    '{first}_{last}',
                    '{last}, {first}',
                    '{first}{last}'
                ]
            }
        }
    
    async def correlate_entities(self, entities: List[Dict[str, Any]]) -> CorrelationResult:
        """
        Correlate multiple entities and find relationships
        
        Args:
            entities: List of entity data from different sources
            
        Returns:
            CorrelationResult with primary entity and relationships
        """
        logger.info(f"Starting correlation analysis for {len(entities)} entities")
        
        # Group entities by similarity
        entity_groups = await self._group_similar_entities(entities)
        
        # Find primary entity (highest confidence)
        primary_entity = await self._identify_primary_entity(entity_groups)
        
        # Build correlation graph
        correlation_graph = await self._build_correlation_graph(entity_groups)
        
        # Calculate overall confidence
        overall_confidence = await self._calculate_overall_confidence(entity_groups)
        
        # Find related entities
        related_entities = await self._find_related_entities(primary_entity, entities)
        
        result = CorrelationResult(
            primary_entity=primary_entity,
            related_entities=related_entities,
            confidence_score=overall_confidence,
            correlation_graph=correlation_graph,
            metadata={
                'total_entities': len(entities),
                'entity_groups': len(entity_groups),
                'analysis_timestamp': datetime.now().isoformat(),
                'correlation_method': 'advanced_similarity'
            }
        )
        
        logger.info(f"Correlation analysis complete. Confidence: {overall_confidence:.2f}")
        return result
    
    async def _group_similar_entities(self, entities: List[Dict[str, Any]]) -> List[List[Dict[str, Any]]]:
        """Group entities by similarity scores"""
        groups = []
        processed = set()
        
        for i, entity in enumerate(entities):
            if i in processed:
                continue
                
            current_group = [entity]
            processed.add(i)
            
            for j, other_entity in enumerate(entities[i+1:], i+1):
                if j in processed:
                    continue
                    
                similarity = await self._calculate_entity_similarity(entity, other_entity)
                if similarity > self.confidence_threshold:
                    current_group.append(other_entity)
                    processed.add(j)
            
            groups.append(current_group)
        
        return groups
    
    async def _calculate_entity_similarity(self, entity1: Dict[str, Any], entity2: Dict[str, Any]) -> float:
        """Calculate similarity score between two entities"""
        similarity_scores = []
        
        # Compare usernames
        if 'username' in entity1 and 'username' in entity2:
            username_sim = self._string_similarity(entity1['username'], entity2['username'])
            similarity_scores.append(username_sim * 0.4)
        
        # Compare emails
        if 'email' in entity1 and 'email' in entity2:
            email_sim = self._string_similarity(entity1['email'], entity2['email'])
            similarity_scores.append(email_sim * 0.3)
        
        # Compare names
        if 'name' in entity1 and 'name' in entity2:
            name_sim = self._string_similarity(entity1['name'], entity2['name'])
            similarity_scores.append(name_sim * 0.2)
        
        # Compare platforms/sources
        if 'platform' in entity1 and 'platform' in entity2:
            if entity1['platform'] == entity2['platform']:
                similarity_scores.append(0.1)
        
        return sum(similarity_scores) if similarity_scores else 0.0
    
    def _string_similarity(self, str1: str, str2: str) -> float:
        """Calculate string similarity using SequenceMatcher"""
        if not str1 or not str2:
            return 0.0
        
        # Normalize strings
        str1 = str1.lower().strip()
        str2 = str2.lower().strip()
        
        return SequenceMatcher(None, str1, str2).ratio()
    
    async def _identify_primary_entity(self, entity_groups: List[List[Dict[str, Any]]]) -> Dict[str, Any]:
        """Identify the primary entity with highest confidence"""
        primary_entity = None
        highest_confidence = 0.0
        
        for group in entity_groups:
            for entity in group:
                confidence = entity.get('confidence', 0.0)
                if confidence > highest_confidence:
                    highest_confidence = confidence
                    primary_entity = entity
        
        return primary_entity or {}
    
    async def _build_correlation_graph(self, entity_groups: List[List[Dict[str, Any]]]) -> Dict[str, List[str]]:
        """Build correlation graph showing entity relationships"""
        graph = {}
        
        for group in entity_groups:
            group_ids = []
            for entity in group:
                entity_id = entity.get('id', f"{entity.get('platform', 'unknown')}_{entity.get('username', 'unknown')}")
                group_ids.append(entity_id)
            
            # Create bidirectional relationships within group
            for entity_id in group_ids:
                related_ids = [eid for eid in group_ids if eid != entity_id]
                graph[entity_id] = related_ids
        
        return graph
    
    async def _calculate_overall_confidence(self, entity_groups: List[List[Dict[str, Any]]]) -> float:
        """Calculate overall confidence score for correlation results"""
        all_confidences = []
        
        for group in entity_groups:
            group_confidences = [entity.get('confidence', 0.0) for entity in group]
            if group_confidences:
                group_avg = sum(group_confidences) / len(group_confidences)
                all_confidences.append(group_avg)
        
        if not all_confidences:
            return 0.0
        
        # Weight by group size and average confidence
        weighted_score = sum(all_confidences) / len(all_confidences)
        
        # Apply bonus for multiple correlated sources
        correlation_bonus = min(0.2, len(entity_groups) * 0.05)
        
        return min(1.0, weighted_score + correlation_bonus)
    
    async def _find_related_entities(self, primary_entity: Dict[str, Any], all_entities: List[Dict[str, Any]]) -> List[EntityMatch]:
        """Find entities related to the primary entity"""
        related_entities = []
        
        for entity in all_entities:
            if entity == primary_entity:
                continue
            
            similarity = await self._calculate_entity_similarity(primary_entity, entity)
            
            if similarity > 0.3:  # Lower threshold for related entities
                match = EntityMatch(
                    entity_id=entity.get('id', f"{entity.get('platform')}_{entity.get('username')}"),
                    confidence=similarity,
                    source=entity.get('platform', 'unknown'),
                    data=entity,
                    timestamp=datetime.now(),
                    match_type='similarity_based'
                )
                related_entities.append(match)
        
        # Sort by confidence
        related_entities.sort(key=lambda x: x.confidence, reverse=True)
        
        return related_entities[:20]  # Limit to top 20 matches
    
    async def generate_entity_fingerprint(self, entity_data: Dict[str, Any]) -> str:
        """Generate unique fingerprint for entity deduplication"""
        fingerprint_components = []
        
        # Add normalized username
        if 'username' in entity_data:
            fingerprint_components.append(entity_data['username'].lower().strip())
        
        # Add email domain if available
        if 'email' in entity_data:
            email = entity_data['email'].lower().strip()
            domain = email.split('@')[-1] if '@' in email else ''
            fingerprint_components.append(domain)
        
        # Add platform
        if 'platform' in entity_data:
            fingerprint_components.append(entity_data['platform'].lower())
        
        # Create hash of components
        fingerprint_string = '|'.join(fingerprint_components)
        return str(hash(fingerprint_string))
    
    async def analyze_temporal_patterns(self, entities: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze temporal patterns in entity data"""
        timestamps = []
        
        for entity in entities:
            if 'timestamp' in entity:
                try:
                    if isinstance(entity['timestamp'], str):
                        timestamp = datetime.fromisoformat(entity['timestamp'].replace('Z', '+00:00'))
                    else:
                        timestamp = entity['timestamp']
                    timestamps.append(timestamp)
                except:
                    continue
        
        if not timestamps:
            return {'pattern': 'no_temporal_data'}
        
        timestamps.sort()
        
        # Analyze patterns
        time_spans = []
        for i in range(len(timestamps) - 1):
            span = (timestamps[i + 1] - timestamps[i]).total_seconds()
            time_spans.append(span)
        
        analysis = {
            'total_timespan': (timestamps[-1] - timestamps[0]).total_seconds() if len(timestamps) > 1 else 0,
            'activity_frequency': len(timestamps),
            'average_interval': sum(time_spans) / len(time_spans) if time_spans else 0,
            'first_activity': timestamps[0].isoformat() if timestamps else None,
            'latest_activity': timestamps[-1].isoformat() if timestamps else None,
            'pattern': 'regular' if time_spans and max(time_spans) - min(time_spans) < 86400 else 'irregular'
        }
        
        return analysis
