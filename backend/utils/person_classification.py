"""
Enhanced Person Classification and Disambiguation Module
Helps distinguish between people with the same name using advanced algorithms
"""

import logging
import hashlib
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
import re
from collections import defaultdict
import json

logger = logging.getLogger(__name__)

class PersonClassificationEngine:
    """Advanced person classification and disambiguation engine"""
    
    def __init__(self):
        # Confidence scoring weights for different data types
        self.confidence_weights = {
            'exact_match': 1.0,
            'location_match': 0.8,
            'company_match': 0.9,
            'education_match': 0.7,
            'age_match': 0.85,
            'contact_match': 0.95,
            'social_profile': 0.75,
            'professional_profile': 0.85,
            'document_mention': 0.6,
            'news_mention': 0.65,
            'family_connection': 0.7
        }
        
        # Disambiguation factors with importance weights
        self.disambiguation_factors = {
            'geographic_location': 0.25,
            'employment_history': 0.2,
            'educational_background': 0.15,
            'age_demographics': 0.15,
            'social_connections': 0.1,
            'contact_information': 0.1,
            'online_presence': 0.05
        }
        
        # Common name indicators that require extra disambiguation
        self.common_names = {
            'very_common': ['John Smith', 'Jane Smith', 'Michael Johnson', 'Sarah Johnson', 
                           'David Brown', 'Emily Davis', 'James Wilson', 'Jessica Miller'],
            'common': ['Robert Taylor', 'Jennifer Anderson', 'Christopher Martin', 'Amanda White',
                      'Matthew Garcia', 'Ashley Rodriguez', 'Joshua Martinez', 'Samantha Lopez'],
            'moderately_common': ['Daniel Hernandez', 'Nicole Gonzalez', 'Andrew Perez', 
                                 'Stephanie Sanchez', 'Kenneth Ramirez', 'Michelle Torres']
        }
    
    def classify_and_disambiguate_results(self, search_results: Dict[str, Any], 
                                        target_criteria: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main method to classify and disambiguate search results for a person
        
        Args:
            search_results: Raw search results from multiple sources
            target_criteria: Known information about the target person
            
        Returns:
            Classified and disambiguated results with confidence scores
        """
        try:
            # Extract all found profiles and mentions
            all_profiles = self._extract_all_profiles(search_results)
            
            # Determine if this is a common name requiring extra disambiguation
            name = target_criteria.get('name', target_criteria.get('full_name', ''))
            disambiguation_level = self._get_disambiguation_level(name)
            
            # Group profiles by potential identity
            profile_clusters = self._cluster_profiles_by_identity(all_profiles, target_criteria)
            
            # Score and rank each cluster
            ranked_identities = self._score_and_rank_identities(profile_clusters, target_criteria, disambiguation_level)
            
            # Generate confidence assessments
            confidence_analysis = self._analyze_identification_confidence(ranked_identities, target_criteria)
            
            # Create final classified results
            classified_results = {
                'target_person': target_criteria,
                'disambiguation_level': disambiguation_level,
                'identified_individuals': ranked_identities,
                'confidence_analysis': confidence_analysis,
                'classification_metadata': {
                    'total_profiles_found': len(all_profiles),
                    'unique_identities_detected': len(ranked_identities),
                    'high_confidence_matches': len([r for r in ranked_identities if r['overall_confidence'] >= 0.8]),
                    'processing_timestamp': datetime.now().isoformat()
                },
                'recommendations': self._generate_classification_recommendations(ranked_identities, target_criteria)
            }
            
            return classified_results
            
        except Exception as e:
            logger.error(f"Classification and disambiguation failed: {str(e)}")
            return {
                'error': str(e),
                'target_person': target_criteria,
                'identified_individuals': [],
                'confidence_analysis': {'overall_confidence': 0.0, 'reliability': 'unknown'}
            }
    
    def _extract_all_profiles(self, search_results: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract all individual profiles from search results"""
        all_profiles = []
        
        # Navigate through the nested search results structure
        sources = search_results.get('sources', {})
        if isinstance(sources, dict):
            for source_type, results_list in sources.items():
                if isinstance(results_list, list):
                    for result in results_list:
                        profile = self._normalize_profile_data(result, source_type)
                        if profile:
                            all_profiles.append(profile)
        
        # Also check the 'results' key if it exists
        results_list = search_results.get('results', [])
        if isinstance(results_list, list):
            for result in results_list:
                if isinstance(result, dict) and 'profiles' in result:
                    for profile in result['profiles']:
                        normalized_profile = self._normalize_profile_data(profile, result.get('type', 'unknown'))
                        if normalized_profile:
                            all_profiles.append(normalized_profile)
        
        return all_profiles
    
    def _normalize_profile_data(self, raw_profile: Dict[str, Any], source_type: str) -> Optional[Dict[str, Any]]:
        """Normalize profile data from different sources into a standard format"""
        try:
            normalized = {
                'id': hashlib.md5(str(raw_profile).encode()).hexdigest()[:12],
                'source_type': source_type,
                'platform': raw_profile.get('platform', source_type),
                'url': raw_profile.get('url', ''),
                'title': raw_profile.get('title', ''),
                'description': raw_profile.get('description', ''),
                'confidence': raw_profile.get('confidence', 0.5),
                'verified': raw_profile.get('verified', False),
                'metadata': raw_profile.get('metadata', {}),
                
                # Extracted identifying information
                'extracted_info': {
                    'name_variations': self._extract_name_variations(raw_profile),
                    'locations': self._extract_locations(raw_profile),
                    'companies': self._extract_companies(raw_profile),
                    'positions': self._extract_positions(raw_profile),
                    'education': self._extract_education(raw_profile),
                    'contact_info': self._extract_contact_info(raw_profile),
                    'demographics': self._extract_demographics(raw_profile),
                    'connections': self._extract_connections(raw_profile)
                },
                
                'raw_data': raw_profile
            }
            
            return normalized
            
        except Exception as e:
            logger.warning(f"Failed to normalize profile data: {str(e)}")
            return None
    
    def _extract_name_variations(self, profile: Dict[str, Any]) -> List[str]:
        """Extract different name variations from a profile"""
        names = set()
        
        # Direct name fields
        for field in ['name', 'title', 'full_name', 'display_name']:
            if field in profile and profile[field]:
                names.add(str(profile[field]).strip())
        
        # Names from URL or metadata
        url = profile.get('url', '')
        if url:
            # Extract from LinkedIn-style URLs
            linkedin_match = re.search(r'/in/([^/]+)', url)
            if linkedin_match:
                name_slug = linkedin_match.group(1).replace('-', ' ').title()
                names.add(name_slug)
        
        # Names from title or description
        title_desc = f"{profile.get('title', '')} {profile.get('description', '')}"
        name_patterns = re.findall(r'\b[A-Z][a-z]+ [A-Z][a-z]+\b', title_desc)
        names.update(name_patterns)
        
        return list(names)
    
    def _extract_locations(self, profile: Dict[str, Any]) -> List[str]:
        """Extract location information from a profile"""
        locations = set()
        
        # Direct location fields
        metadata = profile.get('metadata', {})
        for field in ['location', 'city', 'country', 'region', 'address']:
            if field in metadata and metadata[field]:
                locations.add(str(metadata[field]).strip())
        
        # Extract from description text
        text = f"{profile.get('title', '')} {profile.get('description', '')}"
        
        # Common location patterns
        location_patterns = [
            r'\b(?:in|at|from|based in|located in)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b',
            r'\b([A-Z][a-z]+,\s*[A-Z][A-Z])\b',  # City, State
            r'\b([A-Z][a-z]+\s+[A-Z][a-z]+,\s*[A-Z][a-z]+)\b'  # City State, Country
        ]
        
        for pattern in location_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            locations.update(matches)
        
        return list(locations)
    
    def _extract_companies(self, profile: Dict[str, Any]) -> List[str]:
        """Extract company/organization information"""
        companies = set()
        
        metadata = profile.get('metadata', {})
        for field in ['company', 'organization', 'employer', 'workplace']:
            if field in metadata and metadata[field]:
                companies.add(str(metadata[field]).strip())
        
        # Extract from text
        text = f"{profile.get('title', '')} {profile.get('description', '')}"
        
        # Company patterns
        company_patterns = [
            r'\b(?:at|works at|employed by|with)\s+([A-Z][a-zA-Z\s&.,]+?)(?:\s|$|,|\.|;)',
            r'\b([A-Z][a-zA-Z\s&.]+(?:Inc|LLC|Corp|Ltd|Company))\b'
        ]
        
        for pattern in company_patterns:
            matches = re.findall(pattern, text)
            companies.update([match.strip() for match in matches if len(match.strip()) > 2])
        
        return list(companies)
    
    def _extract_positions(self, profile: Dict[str, Any]) -> List[str]:
        """Extract job titles and positions"""
        positions = set()
        
        metadata = profile.get('metadata', {})
        for field in ['position', 'title', 'job_title', 'role']:
            if field in metadata and metadata[field]:
                positions.add(str(metadata[field]).strip())
        
        # Extract from text
        text = f"{profile.get('title', '')} {profile.get('description', '')}"
        
        # Position patterns
        position_patterns = [
            r'\b(?:as|is|was)\s+(?:a|an)?\s*([A-Z][a-zA-Z\s]+?)(?:\s+at|\s+with|\s|$)',
            r'\b([A-Z][a-zA-Z\s]*(?:Manager|Director|Engineer|Analyst|Specialist|Executive|Officer))\b'
        ]
        
        for pattern in position_patterns:
            matches = re.findall(pattern, text)
            positions.update([match.strip() for match in matches if len(match.strip()) > 2])
        
        return list(positions)
    
    def _extract_education(self, profile: Dict[str, Any]) -> List[str]:
        """Extract educational background"""
        education = set()
        
        metadata = profile.get('metadata', {})
        for field in ['education', 'school', 'university', 'college', 'alma_mater']:
            if field in metadata and metadata[field]:
                education.add(str(metadata[field]).strip())
        
        # Extract from text
        text = f"{profile.get('title', '')} {profile.get('description', '')}"
        
        # Education patterns
        education_patterns = [
            r'\b(?:graduated from|studied at|attended|alumni of)\s+([A-Z][a-zA-Z\s]+(?:University|College|School|Institute))\b',
            r'\b([A-Z][a-zA-Z\s]+(?:University|College|School|Institute))\b'
        ]
        
        for pattern in education_patterns:
            matches = re.findall(pattern, text)
            education.update([match.strip() for match in matches])
        
        return list(education)
    
    def _extract_contact_info(self, profile: Dict[str, Any]) -> Dict[str, List[str]]:
        """Extract contact information"""
        contact_info = {
            'emails': [],
            'phones': [],
            'websites': []
        }
        
        # Direct from metadata
        metadata = profile.get('metadata', {})
        if 'email' in metadata:
            contact_info['emails'].append(metadata['email'])
        if 'phone' in metadata:
            contact_info['phones'].append(metadata['phone'])
        
        # Extract from text
        text = f"{profile.get('title', '')} {profile.get('description', '')}"
        
        # Email pattern
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, text)
        contact_info['emails'].extend(emails)
        
        # Phone pattern (basic)
        phone_pattern = r'\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b'
        phones = re.findall(phone_pattern, text)
        contact_info['phones'].extend(phones)
        
        # URL pattern
        url_pattern = r'https?://[^\s<>"]+|www\.[^\s<>"]+'
        websites = re.findall(url_pattern, text)
        contact_info['websites'].extend(websites)
        
        return contact_info
    
    def _extract_demographics(self, profile: Dict[str, Any]) -> Dict[str, Any]:
        """Extract demographic information"""
        demographics = {}
        
        metadata = profile.get('metadata', {})
        text = f"{profile.get('title', '')} {profile.get('description', '')}"
        
        # Age indicators
        age_patterns = [
            r'\b(\d{1,2})\s*years?\s*old\b',
            r'\bage\s*(\d{1,2})\b',
            r'\bborn\s+in\s+(\d{4})\b'
        ]
        
        for pattern in age_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                demographics['age_indicators'] = matches
                break
        
        return demographics
    
    def _extract_connections(self, profile: Dict[str, Any]) -> List[str]:
        """Extract social/professional connections"""
        connections = []
        
        # This would extract information about family, colleagues, etc.
        # For now, return empty list but framework is in place
        
        return connections
    
    def _get_disambiguation_level(self, name: str) -> str:
        """Determine the level of disambiguation needed for a name"""
        name_normalized = name.strip().title()
        
        if name_normalized in self.common_names['very_common']:
            return 'very_high'
        elif name_normalized in self.common_names['common']:
            return 'high'
        elif name_normalized in self.common_names['moderately_common']:
            return 'medium'
        else:
            # Check if it's a simple first+last name combination
            parts = name_normalized.split()
            if len(parts) == 2 and all(len(part) <= 8 for part in parts):
                return 'medium'
            else:
                return 'low'
    
    def _cluster_profiles_by_identity(self, profiles: List[Dict[str, Any]], 
                                    target_criteria: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Group profiles that likely belong to the same person"""
        clusters = []
        processed_profiles = set()
        
        for i, profile in enumerate(profiles):
            if i in processed_profiles:
                continue
            
            # Start a new cluster with this profile
            cluster = {
                'cluster_id': f"identity_{len(clusters) + 1}",
                'profiles': [profile],
                'confidence_scores': {},
                'aggregated_info': self._aggregate_profile_info([profile])
            }
            
            processed_profiles.add(i)
            
            # Find similar profiles to add to this cluster
            for j, other_profile in enumerate(profiles):
                if j in processed_profiles or i == j:
                    continue
                
                similarity_score = self._calculate_profile_similarity(profile, other_profile)
                if similarity_score >= 0.7:  # Threshold for same person
                    cluster['profiles'].append(other_profile)
                    processed_profiles.add(j)
            
            # Re-aggregate info with all profiles in cluster
            cluster['aggregated_info'] = self._aggregate_profile_info(cluster['profiles'])
            clusters.append(cluster)
        
        return clusters
    
    def _calculate_profile_similarity(self, profile1: Dict[str, Any], profile2: Dict[str, Any]) -> float:
        """Calculate similarity score between two profiles"""
        similarity_factors = []
        
        info1 = profile1.get('extracted_info', {})
        info2 = profile2.get('extracted_info', {})
        
        # Name similarity
        names1 = set(info1.get('name_variations', []))
        names2 = set(info2.get('name_variations', []))
        if names1 and names2:
            name_overlap = len(names1.intersection(names2)) / len(names1.union(names2))
            similarity_factors.append(name_overlap * 0.3)
        
        # Location similarity
        locations1 = set(info1.get('locations', []))
        locations2 = set(info2.get('locations', []))
        if locations1 and locations2:
            location_overlap = len(locations1.intersection(locations2)) / len(locations1.union(locations2))
            similarity_factors.append(location_overlap * 0.25)
        
        # Company similarity
        companies1 = set(info1.get('companies', []))
        companies2 = set(info2.get('companies', []))
        if companies1 and companies2:
            company_overlap = len(companies1.intersection(companies2)) / len(companies1.union(companies2))
            similarity_factors.append(company_overlap * 0.2)
        
        # Contact info similarity
        contact1 = info1.get('contact_info', {})
        contact2 = info2.get('contact_info', {})
        if contact1.get('emails') and contact2.get('emails'):
            email_overlap = len(set(contact1['emails']).intersection(set(contact2['emails'])))
            if email_overlap > 0:
                similarity_factors.append(1.0 * 0.25)  # Exact email match is very strong
        
        # Education similarity
        edu1 = set(info1.get('education', []))
        edu2 = set(info2.get('education', []))
        if edu1 and edu2:
            edu_overlap = len(edu1.intersection(edu2)) / len(edu1.union(edu2))
            similarity_factors.append(edu_overlap * 0.15)
        
        return sum(similarity_factors) if similarity_factors else 0.0
    
    def _aggregate_profile_info(self, profiles: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Aggregate information from multiple profiles of the same person"""
        aggregated = {
            'all_names': set(),
            'all_locations': set(),
            'all_companies': set(),
            'all_positions': set(),
            'all_education': set(),
            'all_emails': set(),
            'all_phones': set(),
            'all_websites': set(),
            'source_count': len(profiles),
            'platforms': set(),
            'total_confidence': 0
        }
        
        for profile in profiles:
            info = profile.get('extracted_info', {})
            
            aggregated['all_names'].update(info.get('name_variations', []))
            aggregated['all_locations'].update(info.get('locations', []))
            aggregated['all_companies'].update(info.get('companies', []))
            aggregated['all_positions'].update(info.get('positions', []))
            aggregated['all_education'].update(info.get('education', []))
            
            contact = info.get('contact_info', {})
            aggregated['all_emails'].update(contact.get('emails', []))
            aggregated['all_phones'].update(contact.get('phones', []))
            aggregated['all_websites'].update(contact.get('websites', []))
            
            aggregated['platforms'].add(profile.get('platform', 'unknown'))
            aggregated['total_confidence'] += profile.get('confidence', 0)
        
        # Convert sets to lists for JSON serialization
        for key, value in aggregated.items():
            if isinstance(value, set):
                aggregated[key] = list(value)
        
        # Calculate average confidence
        if profiles:
            aggregated['average_confidence'] = aggregated['total_confidence'] / len(profiles)
        
        return aggregated
    
    def _score_and_rank_identities(self, clusters: List[Dict[str, Any]], 
                                 target_criteria: Dict[str, Any], 
                                 disambiguation_level: str) -> List[Dict[str, Any]]:
        """Score and rank potential identity matches"""
        scored_identities = []
        
        for cluster in clusters:
            score = self._calculate_identity_match_score(cluster, target_criteria, disambiguation_level)
            
            identity = {
                'identity_id': cluster['cluster_id'],
                'overall_confidence': score,
                'match_factors': self._analyze_match_factors(cluster, target_criteria),
                'profile_count': len(cluster['profiles']),
                'aggregated_information': cluster['aggregated_info'],
                'supporting_profiles': cluster['profiles'],
                'disambiguation_strength': self._calculate_disambiguation_strength(cluster, target_criteria)
            }
            
            scored_identities.append(identity)
        
        # Sort by confidence score
        return sorted(scored_identities, key=lambda x: x['overall_confidence'], reverse=True)
    
    def _calculate_identity_match_score(self, cluster: Dict[str, Any], 
                                      target_criteria: Dict[str, Any], 
                                      disambiguation_level: str) -> float:
        """Calculate how well a cluster matches the target criteria"""
        scores = []
        info = cluster['aggregated_info']
        
        # Name matching
        target_name = target_criteria.get('name', target_criteria.get('full_name', '')).lower()
        if target_name:
            name_scores = []
            for name in info.get('all_names', []):
                if target_name in name.lower() or name.lower() in target_name:
                    name_scores.append(1.0)
                elif self._fuzzy_name_match(target_name, name.lower()):
                    name_scores.append(0.8)
            if name_scores:
                scores.append(max(name_scores) * 0.4)
        
        # Location matching
        target_location = target_criteria.get('location', target_criteria.get('country', '')).lower()
        if target_location:
            for location in info.get('all_locations', []):
                if target_location in location.lower() or location.lower() in target_location:
                    scores.append(0.8 * 0.2)
                    break
        
        # Company matching
        target_company = target_criteria.get('company', '').lower()
        if target_company:
            for company in info.get('all_companies', []):
                if target_company in company.lower() or company.lower() in target_company:
                    scores.append(0.9 * 0.15)
                    break
        
        # Education matching
        target_education = target_criteria.get('education', '').lower()
        if target_education:
            for edu in info.get('all_education', []):
                if target_education in edu.lower() or edu.lower() in target_education:
                    scores.append(0.7 * 0.1)
                    break
        
        # Contact matching (high confidence)
        target_email = target_criteria.get('email', '').lower()
        if target_email:
            for email in info.get('all_emails', []):
                if target_email == email.lower():
                    scores.append(1.0 * 0.15)
                    break
        
        # Source diversity bonus
        platform_count = len(info.get('platforms', []))
        if platform_count > 1:
            scores.append(min(0.1, platform_count * 0.02))
        
        # Disambiguation level penalty for common names
        if disambiguation_level == 'very_high':
            disambiguation_penalty = 0.8
        elif disambiguation_level == 'high':
            disambiguation_penalty = 0.9
        elif disambiguation_level == 'medium':
            disambiguation_penalty = 0.95
        else:
            disambiguation_penalty = 1.0
        
        final_score = sum(scores) * disambiguation_penalty if scores else 0.0
        return min(1.0, final_score)
    
    def _fuzzy_name_match(self, name1: str, name2: str) -> bool:
        """Simple fuzzy matching for names"""
        # Simple implementation - could be enhanced with more sophisticated algorithms
        name1_parts = set(name1.split())
        name2_parts = set(name2.split())
        
        if len(name1_parts) >= 2 and len(name2_parts) >= 2:
            intersection = name1_parts.intersection(name2_parts)
            return len(intersection) >= 2
        
        return False
    
    def _analyze_match_factors(self, cluster: Dict[str, Any], target_criteria: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze what factors contributed to the match"""
        factors = {
            'name_match': False,
            'location_match': False,
            'company_match': False,
            'education_match': False,
            'contact_match': False,
            'strong_indicators': [],
            'weak_indicators': []
        }
        
        info = cluster['aggregated_info']
        
        # Check each factor
        target_name = target_criteria.get('name', target_criteria.get('full_name', '')).lower()
        if target_name and any(target_name in name.lower() for name in info.get('all_names', [])):
            factors['name_match'] = True
            factors['strong_indicators'].append('name_match')
        
        target_location = target_criteria.get('location', target_criteria.get('country', '')).lower()
        if target_location and any(target_location in loc.lower() for loc in info.get('all_locations', [])):
            factors['location_match'] = True
            factors['strong_indicators'].append('location_match')
        
        # Continue for other factors...
        
        return factors
    
    def _calculate_disambiguation_strength(self, cluster: Dict[str, Any], target_criteria: Dict[str, Any]) -> float:
        """Calculate how well this identity is disambiguated from others"""
        info = cluster['aggregated_info']
        
        # More unique information = stronger disambiguation
        uniqueness_score = 0
        
        # Unique contact info
        if info.get('all_emails'):
            uniqueness_score += 0.3
        if info.get('all_phones'):
            uniqueness_score += 0.2
        
        # Location specificity
        location_count = len(info.get('all_locations', []))
        if location_count > 0:
            uniqueness_score += min(0.2, location_count * 0.1)
        
        # Company/education specificity
        if info.get('all_companies'):
            uniqueness_score += 0.15
        if info.get('all_education'):
            uniqueness_score += 0.1
        
        # Multiple platform presence
        platform_count = len(info.get('platforms', []))
        if platform_count > 2:
            uniqueness_score += 0.05
        
        return min(1.0, uniqueness_score)
    
    def _analyze_identification_confidence(self, ranked_identities: List[Dict[str, Any]], 
                                         target_criteria: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze overall confidence in the identification"""
        if not ranked_identities:
            return {
                'overall_confidence': 0.0,
                'reliability': 'no_results',
                'risk_factors': ['no_matching_profiles_found']
            }
        
        top_identity = ranked_identities[0]
        confidence_analysis = {
            'overall_confidence': top_identity['overall_confidence'],
            'top_candidate_strength': top_identity['disambiguation_strength'],
            'alternatives_count': len(ranked_identities) - 1,
            'reliability': 'unknown',
            'risk_factors': [],
            'confidence_factors': []
        }
        
        # Determine reliability level
        if top_identity['overall_confidence'] >= 0.9:
            confidence_analysis['reliability'] = 'very_high'
        elif top_identity['overall_confidence'] >= 0.8:
            confidence_analysis['reliability'] = 'high'
        elif top_identity['overall_confidence'] >= 0.6:
            confidence_analysis['reliability'] = 'medium'
        elif top_identity['overall_confidence'] >= 0.4:
            confidence_analysis['reliability'] = 'low'
        else:
            confidence_analysis['reliability'] = 'very_low'
        
        # Identify risk factors
        if len(ranked_identities) > 3:
            confidence_analysis['risk_factors'].append('multiple_potential_matches')
        
        if top_identity['profile_count'] < 2:
            confidence_analysis['risk_factors'].append('limited_corroboration')
        
        if top_identity['disambiguation_strength'] < 0.5:
            confidence_analysis['risk_factors'].append('weak_disambiguation')
        
        # Identify confidence factors
        if top_identity['profile_count'] >= 3:
            confidence_analysis['confidence_factors'].append('multiple_source_confirmation')
        
        if top_identity.get('match_factors', {}).get('contact_match'):
            confidence_analysis['confidence_factors'].append('direct_contact_match')
        
        return confidence_analysis
    
    def _generate_classification_recommendations(self, ranked_identities: List[Dict[str, Any]], 
                                               target_criteria: Dict[str, Any]) -> List[str]:
        """Generate recommendations for improving classification accuracy"""
        recommendations = []
        
        if not ranked_identities:
            recommendations.append("No matching profiles found. Try broader search terms or check spelling.")
            return recommendations
        
        top_identity = ranked_identities[0]
        
        # Low confidence recommendations
        if top_identity['overall_confidence'] < 0.6:
            recommendations.append("Low confidence match. Consider providing additional identifying information.")
        
        # Multiple candidates recommendations
        if len(ranked_identities) > 2:
            recommendations.append("Multiple potential matches found. Additional filters like location or company may help.")
        
        # Disambiguation recommendations
        if top_identity['disambiguation_strength'] < 0.5:
            recommendations.append("Weak disambiguation. Consider adding more specific criteria like education or contact information.")
        
        # Source diversity recommendations
        if top_identity['profile_count'] < 2:
            recommendations.append("Limited source confirmation. Search with alternative name formats or additional platforms.")
        
        return recommendations