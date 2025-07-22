"""
Input Validators for InfoScape
Validates and sanitizes user inputs for security and data integrity
"""

import re
import logging
from typing import Dict, List, Any, Optional, Union, Tuple
from dataclasses import dataclass
from ipaddress import IPv4Address, IPv6Address, AddressValueError
from urllib.parse import urlparse
import email_validator
from email_validator import validate_email, EmailNotValidError

logger = logging.getLogger(__name__)

@dataclass
class ValidationResult:
    """Result of input validation"""
    is_valid: bool
    sanitized_input: str
    validation_type: str
    confidence: float
    errors: List[str]
    warnings: List[str]

class InputValidator:
    """Comprehensive input validation and sanitization"""
    
    def __init__(self):
        self.patterns = self._initialize_patterns()
        self.security_filters = self._initialize_security_filters()
    
    def _initialize_patterns(self) -> Dict[str, re.Pattern]:
        """Initialize regex patterns for different input types"""
        return {
            'email': re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'),
            'username': re.compile(r'^[a-zA-Z0-9._-]{1,50}$'),
            'domain': re.compile(r'^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$'),
            'phone_us': re.compile(r'^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$'),
            'phone_international': re.compile(r'^\+?[1-9]\d{1,14}$'),
            'ipv4': re.compile(r'^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'),
            'ipv6': re.compile(r'^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$'),
            'url': re.compile(r'^https?://(?:[-\w.])+(?:\:[0-9]+)?(?:/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?$'),
            'social_handle': re.compile(r'^@?[a-zA-Z0-9._-]{1,50}$'),
            'full_name': re.compile(r'^[a-zA-ZÀ-ÿ\s\'-]{2,100}$'),
            'alphanumeric': re.compile(r'^[a-zA-Z0-9]+$'),
        }
    
    def _initialize_security_filters(self) -> List[str]:
        """Initialize security filters for malicious input detection"""
        return [
            # SQL Injection patterns
            r'(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b)',
            r'(\bUNION\b|\bJOIN\b|\bWHERE\b|\bORDER BY\b)',
            r'[\'";]',
            
            # XSS patterns
            r'<script[^>]*>.*?</script>',
            r'javascript:',
            r'on\w+\s*=',
            
            # Command injection
            r'[;&|`$]',
            r'\b(cat|ls|pwd|whoami|id|uname)\b',
            
            # Path traversal
            r'\.\./',
            r'\.\.\\',
            
            # Common attack strings
            r'<.*?>',
            r'\${.*?}',
            r'%[0-9a-fA-F]{2}',
        ]
    
    def validate_input(self, input_value: str, input_type: str, 
                      strict: bool = True) -> ValidationResult:
        """
        Validate and sanitize input based on type
        
        Args:
            input_value: The input to validate
            input_type: Type of input (email, username, domain, etc.)
            strict: Whether to apply strict validation
            
        Returns:
            ValidationResult with validation status and sanitized input
        """
        errors = []
        warnings = []
        confidence = 1.0
        
        # Basic sanitization
        sanitized = self._basic_sanitize(input_value)
        
        # Security check
        security_result = self._check_security(sanitized)
        if not security_result['is_safe']:
            errors.extend(security_result['threats'])
            confidence *= 0.1
        
        # Type-specific validation
        type_validation = self._validate_by_type(sanitized, input_type, strict)
        
        if not type_validation['is_valid']:
            errors.extend(type_validation['errors'])
            confidence *= 0.5
        
        warnings.extend(type_validation.get('warnings', []))
        
        # Final sanitization based on type
        final_sanitized = self._final_sanitize(sanitized, input_type)
        
        return ValidationResult(
            is_valid=len(errors) == 0,
            sanitized_input=final_sanitized,
            validation_type=input_type,
            confidence=confidence,
            errors=errors,
            warnings=warnings
        )
    
    def _basic_sanitize(self, input_value: str) -> str:
        """Basic input sanitization"""
        if not isinstance(input_value, str):
            input_value = str(input_value)
        
        # Remove leading/trailing whitespace
        sanitized = input_value.strip()
        
        # Remove null bytes
        sanitized = sanitized.replace('\x00', '')
        
        # Normalize whitespace
        sanitized = ' '.join(sanitized.split())
        
        return sanitized
    
    def _check_security(self, input_value: str) -> Dict[str, Any]:
        """Check for security threats in input"""
        threats = []
        
        input_lower = input_value.lower()
        
        for pattern in self.security_filters:
            if re.search(pattern, input_lower, re.IGNORECASE):
                threats.append(f"Potential security threat detected: {pattern}")
        
        return {
            'is_safe': len(threats) == 0,
            'threats': threats
        }
    
    def _validate_by_type(self, input_value: str, input_type: str, 
                         strict: bool) -> Dict[str, Any]:
        """Validate input based on specific type"""
        
        if input_type == 'email':
            return self._validate_email(input_value, strict)
        elif input_type == 'username':
            return self._validate_username(input_value, strict)
        elif input_type == 'domain':
            return self._validate_domain(input_value, strict)
        elif input_type == 'phone':
            return self._validate_phone(input_value, strict)
        elif input_type == 'ip':
            return self._validate_ip(input_value, strict)
        elif input_type == 'url':
            return self._validate_url(input_value, strict)
        elif input_type == 'social_handle':
            return self._validate_social_handle(input_value, strict)
        elif input_type == 'full_name':
            return self._validate_full_name(input_value, strict)
        else:
            return self._validate_generic(input_value, strict)
    
    def _validate_email(self, email: str, strict: bool) -> Dict[str, Any]:
        """Validate email address"""
        errors = []
        warnings = []
        
        # Basic pattern check
        if not self.patterns['email'].match(email):
            errors.append("Invalid email format")
        
        # Advanced validation using email-validator
        try:
            validated_email = validate_email(email)
            email = validated_email.email
        except EmailNotValidError as e:
            if strict:
                errors.append(f"Email validation failed: {str(e)}")
            else:
                warnings.append(f"Email may be invalid: {str(e)}")
        
        # Check for suspicious patterns
        if '+' in email.split('@')[0] and strict:
            warnings.append("Email contains '+' character (alias detection)")
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors,
            'warnings': warnings
        }
    
    def _validate_username(self, username: str, strict: bool) -> Dict[str, Any]:
        """Validate username"""
        errors = []
        warnings = []
        
        if not self.patterns['username'].match(username):
            errors.append("Username contains invalid characters")
        
        if len(username) < 2:
            errors.append("Username too short (minimum 2 characters)")
        
        if len(username) > 50:
            errors.append("Username too long (maximum 50 characters)")
        
        # Check for suspicious patterns
        if username.startswith('.') or username.endswith('.'):
            warnings.append("Username starts or ends with period")
        
        if '__' in username:
            warnings.append("Username contains double underscores")
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors,
            'warnings': warnings
        }
    
    def _validate_domain(self, domain: str, strict: bool) -> Dict[str, Any]:
        """Validate domain name"""
        errors = []
        warnings = []
        
        if not self.patterns['domain'].match(domain):
            errors.append("Invalid domain format")
        
        if len(domain) > 253:
            errors.append("Domain name too long")
        
        if domain.startswith('.') or domain.endswith('.'):
            errors.append("Domain cannot start or end with period")
        
        # Check TLD
        if '.' in domain:
            tld = domain.split('.')[-1]
            if len(tld) < 2:
                errors.append("Invalid top-level domain")
        else:
            errors.append("Domain must contain at least one period")
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors,
            'warnings': warnings
        }
    
    def _validate_phone(self, phone: str, strict: bool) -> Dict[str, Any]:
        """Validate phone number"""
        errors = []
        warnings = []
        
        # Remove common formatting
        clean_phone = re.sub(r'[-.\s\(\)]', '', phone)
        
        # Check US format first
        us_match = self.patterns['phone_us'].match(phone)
        intl_match = self.patterns['phone_international'].match(clean_phone)
        
        if not us_match and not intl_match:
            errors.append("Invalid phone number format")
        
        if len(clean_phone) < 7:
            errors.append("Phone number too short")
        
        if len(clean_phone) > 15:
            errors.append("Phone number too long")
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors,
            'warnings': warnings
        }
    
    def _validate_ip(self, ip: str, strict: bool) -> Dict[str, Any]:
        """Validate IP address"""
        errors = []
        warnings = []
        
        try:
            # Try IPv4 first
            IPv4Address(ip)
        except AddressValueError:
            try:
                # Try IPv6
                IPv6Address(ip)
            except AddressValueError:
                errors.append("Invalid IP address format")
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors,
            'warnings': warnings
        }
    
    def _validate_url(self, url: str, strict: bool) -> Dict[str, Any]:
        """Validate URL"""
        errors = []
        warnings = []
        
        try:
            parsed = urlparse(url)
            
            if not parsed.scheme:
                errors.append("URL missing scheme (http/https)")
            elif parsed.scheme not in ['http', 'https']:
                if strict:
                    errors.append("URL scheme must be http or https")
                else:
                    warnings.append("Non-standard URL scheme")
            
            if not parsed.netloc:
                errors.append("URL missing domain")
            
        except Exception as e:
            errors.append(f"URL parsing failed: {str(e)}")
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors,
            'warnings': warnings
        }
    
    def _validate_social_handle(self, handle: str, strict: bool) -> Dict[str, Any]:
        """Validate social media handle"""
        errors = []
        warnings = []
        
        # Remove @ if present
        clean_handle = handle.lstrip('@')
        
        if not self.patterns['social_handle'].match('@' + clean_handle):
            errors.append("Invalid social media handle format")
        
        if len(clean_handle) < 1:
            errors.append("Social handle cannot be empty")
        
        if len(clean_handle) > 50:
            errors.append("Social handle too long")
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors,
            'warnings': warnings
        }
    
    def _validate_full_name(self, name: str, strict: bool) -> Dict[str, Any]:
        """Validate full name"""
        errors = []
        warnings = []
        
        if not self.patterns['full_name'].match(name):
            errors.append("Name contains invalid characters")
        
        if len(name) < 2:
            errors.append("Name too short")
        
        if len(name) > 100:
            errors.append("Name too long")
        
        # Check for reasonable name structure
        parts = name.split()
        if len(parts) < 2 and strict:
            warnings.append("Name should contain at least first and last name")
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors,
            'warnings': warnings
        }
    
    def _validate_generic(self, input_value: str, strict: bool) -> Dict[str, Any]:
        """Generic validation for unknown types"""
        errors = []
        warnings = []
        
        if len(input_value) == 0:
            errors.append("Input cannot be empty")
        
        if len(input_value) > 1000:
            errors.append("Input too long")
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors,
            'warnings': warnings
        }
    
    def _final_sanitize(self, input_value: str, input_type: str) -> str:
        """Final sanitization based on input type"""
        
        if input_type == 'email':
            return input_value.lower()
        elif input_type == 'username':
            return input_value.lower()
        elif input_type == 'domain':
            return input_value.lower()
        elif input_type == 'social_handle':
            return input_value.lstrip('@').lower()
        elif input_type == 'phone':
            # Remove all non-digit characters except +
            return re.sub(r'[^\d+]', '', input_value)
        else:
            return input_value

def validate_input(input_value: str, input_type: str, strict: bool = True) -> ValidationResult:
    """
    Convenience function for input validation
    
    Args:
        input_value: The input to validate
        input_type: Type of input (email, username, domain, etc.)
        strict: Whether to apply strict validation
        
    Returns:
        ValidationResult with validation status and sanitized input
    """
    validator = InputValidator()
    return validator.validate_input(input_value, input_type, strict)

def batch_validate(inputs: List[Tuple[str, str]], strict: bool = True) -> List[ValidationResult]:
    """
    Validate multiple inputs at once
    
    Args:
        inputs: List of (input_value, input_type) tuples
        strict: Whether to apply strict validation
        
    Returns:
        List of ValidationResult objects
    """
    validator = InputValidator()
    results = []
    
    for input_value, input_type in inputs:
        result = validator.validate_input(input_value, input_type, strict)
        results.append(result)
    
    return results
