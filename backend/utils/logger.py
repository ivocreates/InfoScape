"""
Logging Setup and Configuration for InfoScape
Provides structured logging with different levels and output formats
"""

import logging
import logging.handlers
import sys
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional
import os

class JSONFormatter(logging.Formatter):
    """Custom JSON formatter for structured logging"""
    
    def format(self, record):
        log_entry = {
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno,
        }
        
        # Add extra fields if present
        if hasattr(record, 'user_id'):
            log_entry['user_id'] = record.user_id
        if hasattr(record, 'session_id'):
            log_entry['session_id'] = record.session_id
        if hasattr(record, 'request_id'):
            log_entry['request_id'] = record.request_id
        if hasattr(record, 'execution_time'):
            log_entry['execution_time'] = record.execution_time
        
        # Add exception info if present
        if record.exc_info:
            log_entry['exception'] = self.formatException(record.exc_info)
        
        return json.dumps(log_entry)

class InfoScapeLogger:
    """Custom logger class for InfoScape application"""
    
    def __init__(self, name: str, log_level: str = "INFO", log_dir: str = None):
        self.name = name
        self.log_level = getattr(logging, log_level.upper())
        self.log_dir = Path(log_dir) if log_dir else Path(__file__).parent.parent / "logs"
        self.log_dir.mkdir(exist_ok=True)
        
        # Create logger
        self.logger = logging.getLogger(name)
        self.logger.setLevel(self.log_level)
        
        # Prevent duplicate handlers
        if self.logger.hasHandlers():
            self.logger.handlers.clear()
        
        self._setup_handlers()
    
    def _setup_handlers(self):
        """Setup logging handlers for console and file output"""
        
        # Console Handler with colored output
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(self.log_level)
        
        # Console formatter with colors
        console_formatter = ColoredFormatter(
            '%(asctime)s | %(levelname)-8s | %(name)s | %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        console_handler.setFormatter(console_formatter)
        
        # File Handler for general logs
        log_file = self.log_dir / f"{self.name}.log"
        file_handler = logging.handlers.RotatingFileHandler(
            log_file,
            maxBytes=10*1024*1024,  # 10MB
            backupCount=5,
            encoding='utf-8'
        )
        file_handler.setLevel(logging.DEBUG)
        
        # File formatter
        file_formatter = logging.Formatter(
            '%(asctime)s | %(levelname)-8s | %(name)s | %(module)s:%(funcName)s:%(lineno)d | %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        file_handler.setFormatter(file_formatter)
        
        # JSON Handler for structured logs
        json_file = self.log_dir / f"{self.name}.json"
        json_handler = logging.handlers.RotatingFileHandler(
            json_file,
            maxBytes=10*1024*1024,  # 10MB
            backupCount=5,
            encoding='utf-8'
        )
        json_handler.setLevel(logging.INFO)
        json_handler.setFormatter(JSONFormatter())
        
        # Error Handler for error logs only
        error_file = self.log_dir / f"{self.name}_errors.log"
        error_handler = logging.handlers.RotatingFileHandler(
            error_file,
            maxBytes=5*1024*1024,  # 5MB
            backupCount=3,
            encoding='utf-8'
        )
        error_handler.setLevel(logging.ERROR)
        error_handler.setFormatter(file_formatter)
        
        # Add handlers to logger
        self.logger.addHandler(console_handler)
        self.logger.addHandler(file_handler)
        self.logger.addHandler(json_handler)
        self.logger.addHandler(error_handler)
    
    def get_logger(self):
        """Get the configured logger instance"""
        return self.logger

class ColoredFormatter(logging.Formatter):
    """Colored formatter for console output"""
    
    # Color codes
    COLORS = {
        'DEBUG': '\033[36m',      # Cyan
        'INFO': '\033[32m',       # Green
        'WARNING': '\033[33m',    # Yellow
        'ERROR': '\033[31m',      # Red
        'CRITICAL': '\033[35m',   # Magenta
        'RESET': '\033[0m'        # Reset
    }
    
    def format(self, record):
        # Get color for log level
        color = self.COLORS.get(record.levelname, self.COLORS['RESET'])
        reset = self.COLORS['RESET']
        
        # Apply color to level name
        record.levelname = f"{color}{record.levelname}{reset}"
        
        # Format the message
        formatted = super().format(record)
        
        return formatted

def setup_logger(name: str, 
                log_level: str = "INFO", 
                log_dir: Optional[str] = None,
                enable_console: bool = True,
                enable_file: bool = True,
                enable_json: bool = True) -> logging.Logger:
    """
    Setup and configure a logger for InfoScape
    
    Args:
        name: Logger name (usually module name)
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_dir: Directory for log files (default: ./logs)
        enable_console: Enable console output
        enable_file: Enable file logging
        enable_json: Enable JSON structured logging
        
    Returns:
        Configured logger instance
    """
    
    # Determine log directory
    if log_dir is None:
        log_dir = os.environ.get('INFOSCAPE_LOG_DIR', 'logs')
    
    log_path = Path(log_dir)
    log_path.mkdir(exist_ok=True)
    
    # Create logger
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, log_level.upper()))
    
    # Clear existing handlers
    logger.handlers.clear()
    
    # Console handler
    if enable_console:
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(getattr(logging, log_level.upper()))
        
        console_formatter = ColoredFormatter(
            '%(asctime)s | %(levelname)-8s | %(name)s | %(message)s',
            datefmt='%H:%M:%S'
        )
        console_handler.setFormatter(console_formatter)
        logger.addHandler(console_handler)
    
    # File handler
    if enable_file:
        log_file = log_path / f"{name.replace('.', '_')}.log"
        file_handler = logging.handlers.RotatingFileHandler(
            log_file,
            maxBytes=10*1024*1024,  # 10MB
            backupCount=5,
            encoding='utf-8'
        )
        file_handler.setLevel(logging.DEBUG)
        
        file_formatter = logging.Formatter(
            '%(asctime)s | %(levelname)-8s | %(name)s | %(module)s:%(funcName)s:%(lineno)d | %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        file_handler.setFormatter(file_formatter)
        logger.addHandler(file_handler)
    
    # JSON handler
    if enable_json:
        json_file = log_path / f"{name.replace('.', '_')}.json"
        json_handler = logging.handlers.RotatingFileHandler(
            json_file,
            maxBytes=10*1024*1024,  # 10MB
            backupCount=5,
            encoding='utf-8'
        )
        json_handler.setLevel(logging.INFO)
        json_handler.setFormatter(JSONFormatter())
        logger.addHandler(json_handler)
    
    return logger

def log_execution_time(func):
    """Decorator to log function execution time"""
    def wrapper(*args, **kwargs):
        logger = logging.getLogger(func.__module__)
        start_time = datetime.now()
        
        try:
            result = func(*args, **kwargs)
            execution_time = (datetime.now() - start_time).total_seconds()
            
            logger.info(
                f"Function {func.__name__} executed successfully",
                extra={'execution_time': execution_time}
            )
            return result
            
        except Exception as e:
            execution_time = (datetime.now() - start_time).total_seconds()
            
            logger.error(
                f"Function {func.__name__} failed: {str(e)}",
                extra={'execution_time': execution_time},
                exc_info=True
            )
            raise
    
    return wrapper

def log_api_request(request_id: str, method: str, endpoint: str, 
                   user_id: Optional[str] = None, session_id: Optional[str] = None):
    """Log API request details"""
    logger = logging.getLogger('infoscape.api')
    
    logger.info(
        f"{method} {endpoint}",
        extra={
            'request_id': request_id,
            'user_id': user_id,
            'session_id': session_id,
            'method': method,
            'endpoint': endpoint
        }
    )

def log_search_operation(operation_type: str, target: str, tools_used: list,
                        session_id: Optional[str] = None, results_count: int = 0):
    """Log OSINT search operation"""
    logger = logging.getLogger('infoscape.search')
    
    logger.info(
        f"Search operation: {operation_type} for {target}",
        extra={
            'operation_type': operation_type,
            'target': target,
            'tools_used': tools_used,
            'session_id': session_id,
            'results_count': results_count
        }
    )

def log_security_event(event_type: str, description: str, severity: str = "WARNING",
                      user_id: Optional[str] = None, ip_address: Optional[str] = None):
    """Log security-related events"""
    logger = logging.getLogger('infoscape.security')
    
    log_level = getattr(logging, severity.upper(), logging.WARNING)
    
    logger.log(
        log_level,
        f"Security event: {event_type} - {description}",
        extra={
            'event_type': event_type,
            'user_id': user_id,
            'ip_address': ip_address,
            'severity': severity
        }
    )

# Global logger instances
main_logger = None
api_logger = None
search_logger = None
security_logger = None

def initialize_logging(log_level: str = "INFO", log_dir: str = None):
    """Initialize all InfoScape loggers"""
    global main_logger, api_logger, search_logger, security_logger
    
    main_logger = setup_logger('infoscape.main', log_level, log_dir)
    api_logger = setup_logger('infoscape.api', log_level, log_dir)
    search_logger = setup_logger('infoscape.search', log_level, log_dir)
    security_logger = setup_logger('infoscape.security', log_level, log_dir)
    
    main_logger.info("InfoScape logging system initialized")
    
    return {
        'main': main_logger,
        'api': api_logger,
        'search': search_logger,
        'security': security_logger
    }

# Convenience function for getting module logger
def get_logger(module_name: str = None) -> logging.Logger:
    """Get logger for specific module"""
    if module_name is None:
        # Try to get the calling module name
        import inspect
        frame = inspect.currentframe().f_back
        module_name = frame.f_globals.get('__name__', 'infoscape.unknown')
    
    return logging.getLogger(module_name)
