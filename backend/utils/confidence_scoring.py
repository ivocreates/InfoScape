"""
Confidence Scoring System for InfoScape OSINT Platform
Calculates confidence scores for OSINT data based on multiple factors
"""

import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import statistics

logger = logging.getLogger(__name__)

class ConfidenceCalculator:
    """Calculates confidence scores for OSINT data"""
    
    def __init__(self):
        # Weights for different confidence factors
        self.weights = {
            'source_reliability': 0.25,
            'data_freshness': 0.20,
            'cross_verification': 0.30,
            'data_completeness': 0.15,
            'response_time': 0.10
        }
        
        # Source reliability scores (0.0 to 1.0)
        self.source_reliability = {
            'hunter_io': 0.9,
            'clearbit': 0.85,
            'people_data_labs': 0.8,
            'fullcontact': 0.75,
            'whitepages': 0.7,
            'truecaller': 0.65,
            'pipl': 0.8,
            'spokeo': 0.6,
            'truepeoplesearch': 0.5,
            'fastpeoplesearch': 0.45,
            'beenverified': 0.55,
            'social_facebook': 0.7,
            'social_twitter': 0.6,
            'social_linkedin': 0.8,
            'social_instagram': 0.5,
            'manual_verification': 0.95,
            'government_records': 1.0,
            'court_records': 0.95,
            'business_records': 0.85,
            'unknown': 0.3
        }
        
        # Data type importance multipliers
        self.data_type_weights = {
            'email': 1.0,
            'phone': 0.9,
            'address': 0.8,
            'name': 0.7,
            'social_profile': 0.6,
            'employment': 0.75,
            'education': 0.65,
            'relatives': 0.55,
            'associates': 0.5
        }
    
    def calculate_confidence(self, data: Dict[str, Any], context: Dict[str, Any] = None) -> float:
        """Calculate overall confidence score for a piece of data"""
        try:
            factors = self._calculate_confidence_factors(data, context or {})
            
            # Weighted average of all factors
            weighted_score = sum(
                factors[factor] * self.weights[factor] 
                for factor in factors if factor in self.weights
            )
            
            # Normalize to 0.0-1.0 range
            confidence = max(0.0, min(1.0, weighted_score))
            
            logger.debug(f"Confidence calculation: {factors} -> {confidence}")
            return confidence
            
        except Exception as e:
            logger.error(f"Confidence calculation error: {str(e)}")
            return 0.0
    
    def _calculate_confidence_factors(self, data: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, float]:
        """Calculate individual confidence factors"""
        factors = {}
        
        # Source reliability factor
        factors['source_reliability'] = self._calculate_source_reliability(data)
        
        # Data freshness factor
        factors['data_freshness'] = self._calculate_data_freshness(data)
        
        # Cross-verification factor
        factors['cross_verification'] = self._calculate_cross_verification(data, context)
        
        # Data completeness factor
        factors['data_completeness'] = self._calculate_data_completeness(data)
        
        # Response time factor
        factors['response_time'] = self._calculate_response_time(data)
        
        return factors
    
    def _calculate_source_reliability(self, data: Dict[str, Any]) -> float:
        """Calculate confidence based on source reliability"""
        source = data.get('source', 'unknown')
        return self.source_reliability.get(source, self.source_reliability['unknown'])
    
    def _calculate_data_freshness(self, data: Dict[str, Any]) -> float:
        """Calculate confidence based on data freshness"""
        timestamp = data.get('timestamp')
        if not timestamp:
            return 0.5  # Neutral score if no timestamp
        
        try:
            if isinstance(timestamp, str):
                timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            
            age = datetime.now().replace(tzinfo=timestamp.tzinfo) - timestamp
            
            # Fresher data gets higher confidence
            if age.days <= 1:
                return 1.0
            elif age.days <= 7:
                return 0.9
            elif age.days <= 30:
                return 0.8
            elif age.days <= 90:
                return 0.6
            elif age.days <= 365:
                return 0.4
            else:
                return 0.2
                
        except Exception as e:
            logger.warning(f"Data freshness calculation error: {str(e)}")
            return 0.5
    
    def _calculate_cross_verification(self, data: Dict[str, Any], context: Dict[str, Any]) -> float:
        """Calculate confidence based on cross-verification with other sources"""
        verification_count = context.get('verification_count', 0)
        similar_results = context.get('similar_results', [])
        
        # Base score
        if verification_count == 0:
            return 0.3
        elif verification_count == 1:
            return 0.5
        elif verification_count == 2:
            return 0.7
        elif verification_count >= 3:
            return 0.9
        
        # Bonus for consistent results across sources
        if len(similar_results) >= 2:
            consistency_score = self._calculate_result_consistency(similar_results)
            return min(1.0, verification_count * 0.2 + consistency_score * 0.3)
        
        return min(1.0, verification_count * 0.25)
    
    def _calculate_data_completeness(self, data: Dict[str, Any]) -> float:
        """Calculate confidence based on data completeness"""
        data_fields = data.get('data', {})
        if not isinstance(data_fields, dict):
            return 0.3
        
        total_fields = len(data_fields)
        filled_fields = sum(1 for value in data_fields.values() if value is not None and value != '')
        
        if total_fields == 0:
            return 0.1
        
        completeness_ratio = filled_fields / total_fields
        
        # Apply diminishing returns
        if completeness_ratio >= 0.8:
            return 1.0
        elif completeness_ratio >= 0.6:
            return 0.8
        elif completeness_ratio >= 0.4:
            return 0.6
        elif completeness_ratio >= 0.2:
            return 0.4
        else:
            return 0.2
    
    def _calculate_response_time(self, data: Dict[str, Any]) -> float:
        """Calculate confidence based on response time (faster = more reliable)"""
        response_time = data.get('response_time', 5.0)  # Default 5 seconds
        
        # Faster responses get higher confidence
        if response_time <= 1.0:
            return 1.0
        elif response_time <= 3.0:
            return 0.9
        elif response_time <= 5.0:
            return 0.8
        elif response_time <= 10.0:
            return 0.6
        else:
            return 0.4
    
    def _calculate_result_consistency(self, results: List[Dict[str, Any]]) -> float:
        """Calculate how consistent multiple results are"""
        if len(results) < 2:
            return 0.5
        
        # Compare key fields across results
        key_fields = ['email', 'phone', 'name', 'address']
        consistency_scores = []
        
        for field in key_fields:
            field_values = [
                result.get('data', {}).get(field) 
                for result in results 
                if result.get('data', {}).get(field)
            ]
            
            if len(field_values) >= 2:
                # Calculate similarity between values
                unique_values = set(str(v).lower() for v in field_values)
                consistency = 1.0 - (len(unique_values) - 1) / len(field_values)
                consistency_scores.append(consistency)
        
        return statistics.mean(consistency_scores) if consistency_scores else 0.5
    
    def calculate_aggregate_confidence(self, results: List[Dict[str, Any]]) -> float:
        """Calculate aggregate confidence for multiple results"""
        if not results:
            return 0.0
        
        # Calculate individual confidences
        confidences = []
        weights = []
        
        for result in results:
            confidence = result.get('confidence', 0.0)
            source = result.get('source', 'unknown')
            source_weight = self.source_reliability.get(source, 0.3)
            
            confidences.append(confidence)
            weights.append(source_weight)
        
        # Weighted average
        if sum(weights) > 0:
            weighted_confidence = sum(c * w for c, w in zip(confidences, weights)) / sum(weights)
        else:
            weighted_confidence = statistics.mean(confidences)
        
        # Bonus for multiple sources
        source_bonus = min(0.2, len(results) * 0.05)
        
        return min(1.0, weighted_confidence + source_bonus)
    
    def get_confidence_level(self, confidence: float) -> str:
        """Convert confidence score to human-readable level"""
        if confidence >= 0.9:
            return "Very High"
        elif confidence >= 0.75:
            return "High"
        elif confidence >= 0.6:
            return "Medium"
        elif confidence >= 0.4:
            return "Low"
        else:
            return "Very Low"
    
    def update_source_reliability(self, source: str, reliability: float):
        """Update reliability score for a data source"""
        if 0.0 <= reliability <= 1.0:
            self.source_reliability[source] = reliability
            logger.info(f"Updated reliability for {source}: {reliability}")
        else:
            logger.warning(f"Invalid reliability score: {reliability}")
    
    def get_confidence_factors_explanation(self, data: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get detailed explanation of confidence factors"""
        factors = self._calculate_confidence_factors(data, context or {})
        
        explanation = {
            'overall_confidence': self.calculate_confidence(data, context),
            'factors': {
                'source_reliability': {
                    'score': factors['source_reliability'],
                    'weight': self.weights['source_reliability'],
                    'description': f"Source: {data.get('source', 'unknown')}"
                },
                'data_freshness': {
                    'score': factors['data_freshness'],
                    'weight': self.weights['data_freshness'],
                    'description': "How recent the data is"
                },
                'cross_verification': {
                    'score': factors['cross_verification'],
                    'weight': self.weights['cross_verification'],
                    'description': "Verification across multiple sources"
                },
                'data_completeness': {
                    'score': factors['data_completeness'],
                    'weight': self.weights['data_completeness'],
                    'description': "How complete the data fields are"
                },
                'response_time': {
                    'score': factors['response_time'],
                    'weight': self.weights['response_time'],
                    'description': "API response time reliability"
                }
            }
        }
        
        return explanation
