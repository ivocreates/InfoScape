"""
OSINT Tools Manager for InfoScape
Manages execution and integration of various OSINT tools
"""

import asyncio
import logging
import subprocess
import json
import tempfile
import os
from typing import Dict, List, Any, Optional, Union
from dataclasses import dataclass
from datetime import datetime
import aiofiles
import shutil

logger = logging.getLogger(__name__)

@dataclass
class ToolResult:
    """Result from OSINT tool execution"""
    tool_name: str
    status: str  # 'success', 'error', 'timeout', 'not_found'
    data: Dict[str, Any]
    execution_time: float
    error_message: Optional[str] = None
    raw_output: Optional[str] = None

@dataclass
class ToolConfig:
    """Configuration for OSINT tool"""
    name: str
    command: str
    arguments: List[str]
    timeout: int
    output_format: str  # 'json', 'text', 'csv'
    requires_install: bool
    install_command: Optional[str] = None

class OSINTToolsManager:
    """Manager for OSINT tools integration"""
    
    def __init__(self):
        self.tools = self._initialize_tools()
        self.tool_status = {}
        self.temp_dir = tempfile.gettempdir()
        
    def _initialize_tools(self) -> Dict[str, ToolConfig]:
        """Initialize configuration for supported OSINT tools"""
        return {
            'sherlock': ToolConfig(
                name='sherlock',
                command='sherlock',
                arguments=['{target}', '--json'],
                timeout=300,
                output_format='json',
                requires_install=True,
                install_command='pip install sherlock-project'
            ),
            'maigret': ToolConfig(
                name='maigret',
                command='maigret',
                arguments=['{target}', '--json', '--no-progressbar'],
                timeout=600,
                output_format='json',
                requires_install=True,
                install_command='pip install maigret'
            ),
            'holehe': ToolConfig(
                name='holehe',
                command='holehe',
                arguments=['{target}', '--json'],
                timeout=180,
                output_format='json',
                requires_install=True,
                install_command='pip install holehe'
            ),
            'theharvester': ToolConfig(
                name='theharvester',
                command='theHarvester',
                arguments=['-d', '{target}', '-b', 'all', '-f', '{output_file}'],
                timeout=300,
                output_format='text',
                requires_install=True,
                install_command='pip install theHarvester'
            ),
            'photon': ToolConfig(
                name='photon',
                command='photon',
                arguments=['-u', '{target}', '-o', '{output_dir}', '--json'],
                timeout=600,
                output_format='json',
                requires_install=True,
                install_command='pip install photon-web'
            ),
            'sublist3r': ToolConfig(
                name='sublist3r',
                command='sublist3r',
                arguments=['-d', '{target}', '-o', '{output_file}'],
                timeout=300,
                output_format='text',
                requires_install=True,
                install_command='pip install sublist3r'
            ),
            'nmap': ToolConfig(
                name='nmap',
                command='nmap',
                arguments=['-sS', '-O', '{target}', '-oJ', '{output_file}'],
                timeout=600,
                output_format='json',
                requires_install=False  # Usually pre-installed
            ),
            'nuclei': ToolConfig(
                name='nuclei',
                command='nuclei',
                arguments=['-u', '{target}', '-json', '-o', '{output_file}'],
                timeout=900,
                output_format='json',
                requires_install=True,
                install_command='go install -v github.com/projectdiscovery/nuclei/v2/cmd/nuclei@latest'
            )
        }
    
    async def check_tool_availability(self, tool_name: str) -> Dict[str, Any]:
        """Check if a tool is available and working"""
        if tool_name not in self.tools:
            return {'available': False, 'error': 'Tool not supported'}
        
        tool_config = self.tools[tool_name]
        
        try:
            # Try to run tool with version/help flag
            process = await asyncio.create_subprocess_exec(
                tool_config.command, '--version',
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=10)
            
            if process.returncode == 0:
                status = {
                    'available': True,
                    'version': stdout.decode().strip()[:100],  # Limit version string
                    'status': 'ready'
                }
            else:
                status = {
                    'available': False,
                    'error': stderr.decode().strip()[:200],
                    'status': 'error'
                }
                
        except asyncio.TimeoutError:
            status = {
                'available': False,
                'error': 'Tool check timeout',
                'status': 'timeout'
            }
        except FileNotFoundError:
            status = {
                'available': False,
                'error': 'Tool not found in PATH',
                'status': 'not_found',
                'install_command': tool_config.install_command
            }
        except Exception as e:
            status = {
                'available': False,
                'error': str(e),
                'status': 'error'
            }
        
        self.tool_status[tool_name] = status
        return status
    
    async def run_tool(self, tool_name: str, target: str, options: Dict[str, Any] = None) -> ToolResult:
        """Execute an OSINT tool with given target"""
        if tool_name not in self.tools:
            return ToolResult(
                tool_name=tool_name,
                status='error',
                data={},
                execution_time=0.0,
                error_message='Tool not supported'
            )
        
        tool_config = self.tools[tool_name]
        options = options or {}
        
        # Check tool availability first
        availability = await self.check_tool_availability(tool_name)
        if not availability['available']:
            return ToolResult(
                tool_name=tool_name,
                status='not_found',
                data={},
                execution_time=0.0,
                error_message=availability['error']
            )
        
        start_time = datetime.now()
        
        try:
            # Prepare output files
            output_file = os.path.join(self.temp_dir, f"{tool_name}_{int(start_time.timestamp())}")
            output_dir = os.path.join(self.temp_dir, f"{tool_name}_output_{int(start_time.timestamp())}")
            
            # Build command arguments
            args = []
            for arg in tool_config.arguments:
                formatted_arg = arg.format(
                    target=target,
                    output_file=output_file,
                    output_dir=output_dir,
                    **options
                )
                args.append(formatted_arg)
            
            logger.info(f"Executing {tool_name} with command: {tool_config.command} {' '.join(args)}")
            
            # Execute the tool
            process = await asyncio.create_subprocess_exec(
                tool_config.command, *args,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=self.temp_dir
            )
            
            try:
                stdout, stderr = await asyncio.wait_for(
                    process.communicate(), 
                    timeout=tool_config.timeout
                )
            except asyncio.TimeoutError:
                process.kill()
                await process.wait()
                raise asyncio.TimeoutError(f"Tool {tool_name} execution timeout")
            
            execution_time = (datetime.now() - start_time).total_seconds()
            
            # Parse output based on format
            parsed_data = await self._parse_tool_output(
                tool_name, tool_config, output_file, output_dir, stdout, stderr
            )
            
            # Cleanup temporary files
            await self._cleanup_temp_files(output_file, output_dir)
            
            if process.returncode == 0:
                return ToolResult(
                    tool_name=tool_name,
                    status='success',
                    data=parsed_data,
                    execution_time=execution_time,
                    raw_output=stdout.decode()[:1000]  # Limit raw output
                )
            else:
                return ToolResult(
                    tool_name=tool_name,
                    status='error',
                    data=parsed_data,
                    execution_time=execution_time,
                    error_message=stderr.decode()[:500],
                    raw_output=stdout.decode()[:1000]
                )
                
        except asyncio.TimeoutError as e:
            execution_time = (datetime.now() - start_time).total_seconds()
            return ToolResult(
                tool_name=tool_name,
                status='timeout',
                data={},
                execution_time=execution_time,
                error_message=str(e)
            )
        except Exception as e:
            execution_time = (datetime.now() - start_time).total_seconds()
            logger.error(f"Error executing {tool_name}: {str(e)}")
            return ToolResult(
                tool_name=tool_name,
                status='error',
                data={},
                execution_time=execution_time,
                error_message=str(e)
            )
    
    async def _parse_tool_output(self, tool_name: str, tool_config: ToolConfig, 
                                output_file: str, output_dir: str, 
                                stdout: bytes, stderr: bytes) -> Dict[str, Any]:
        """Parse tool output based on format"""
        try:
            if tool_config.output_format == 'json':
                # Try to parse JSON from various sources
                json_data = None
                
                # First try stdout
                if stdout:
                    try:
                        json_data = json.loads(stdout.decode())
                    except:
                        pass
                
                # Then try output file
                if not json_data and os.path.exists(output_file):
                    try:
                        async with aiofiles.open(output_file, 'r') as f:
                            content = await f.read()
                            json_data = json.loads(content)
                    except:
                        pass
                
                # Check for JSON files in output directory
                if not json_data and os.path.exists(output_dir):
                    for file in os.listdir(output_dir):
                        if file.endswith('.json'):
                            try:
                                async with aiofiles.open(os.path.join(output_dir, file), 'r') as f:
                                    content = await f.read()
                                    json_data = json.loads(content)
                                    break
                            except:
                                continue
                
                return json_data or {'raw_output': stdout.decode()}
                
            elif tool_config.output_format == 'text':
                # Parse text output
                text_data = stdout.decode()
                
                # Try to read from output file if available
                if os.path.exists(output_file):
                    async with aiofiles.open(output_file, 'r') as f:
                        file_content = await f.read()
                        if file_content:
                            text_data = file_content
                
                return await self._parse_text_output(tool_name, text_data)
            
            else:
                # Default: return raw output
                return {'raw_output': stdout.decode()}
                
        except Exception as e:
            logger.error(f"Error parsing {tool_name} output: {str(e)}")
            return {'error': str(e), 'raw_output': stdout.decode()}
    
    async def _parse_text_output(self, tool_name: str, text_data: str) -> Dict[str, Any]:
        """Parse text output for different tools"""
        if tool_name == 'sublist3r':
            # Parse subdomains from sublist3r output
            lines = text_data.strip().split('\n')
            subdomains = [line.strip() for line in lines if line.strip() and not line.startswith('[')]
            return {'subdomains': subdomains, 'count': len(subdomains)}
        
        elif tool_name == 'theharvester':
            # Parse theHarvester output
            emails = []
            hosts = []
            ips = []
            
            lines = text_data.split('\n')
            current_section = None
            
            for line in lines:
                line = line.strip()
                if 'Emails found:' in line:
                    current_section = 'emails'
                elif 'Hosts found:' in line:
                    current_section = 'hosts'
                elif 'IPs found:' in line:
                    current_section = 'ips'
                elif line and current_section:
                    if current_section == 'emails' and '@' in line:
                        emails.append(line)
                    elif current_section == 'hosts':
                        hosts.append(line)
                    elif current_section == 'ips':
                        ips.append(line)
            
            return {
                'emails': emails,
                'hosts': hosts,
                'ips': ips,
                'total_results': len(emails) + len(hosts) + len(ips)
            }
        
        else:
            # Generic text parsing
            lines = [line.strip() for line in text_data.split('\n') if line.strip()]
            return {'lines': lines, 'raw_text': text_data}
    
    async def _cleanup_temp_files(self, output_file: str, output_dir: str):
        """Clean up temporary files created by tools"""
        try:
            if os.path.exists(output_file):
                os.remove(output_file)
            if os.path.exists(output_dir):
                shutil.rmtree(output_dir)
        except Exception as e:
            logger.warning(f"Failed to cleanup temp files: {str(e)}")
    
    async def run_multiple_tools(self, tools: List[str], target: str, 
                                options: Dict[str, Any] = None) -> Dict[str, ToolResult]:
        """Run multiple OSINT tools concurrently"""
        tasks = []
        
        for tool_name in tools:
            task = self.run_tool(tool_name, target, options)
            tasks.append((tool_name, task))
        
        results = {}
        completed_tasks = await asyncio.gather(*[task for _, task in tasks], return_exceptions=True)
        
        for (tool_name, _), result in zip(tasks, completed_tasks):
            if isinstance(result, Exception):
                results[tool_name] = ToolResult(
                    tool_name=tool_name,
                    status='error',
                    data={},
                    execution_time=0.0,
                    error_message=str(result)
                )
            else:
                results[tool_name] = result
        
        return results
    
    async def get_tool_status(self) -> Dict[str, Any]:
        """Get status of all tools"""
        if not self.tool_status:
            # Check all tools if status not cached
            tasks = [self.check_tool_availability(tool_name) for tool_name in self.tools.keys()]
            await asyncio.gather(*tasks, return_exceptions=True)
        
        return self.tool_status
    
    def get_supported_tools(self) -> List[str]:
        """Get list of supported OSINT tools"""
        return list(self.tools.keys())
    
    def get_tool_info(self, tool_name: str) -> Optional[ToolConfig]:
        """Get configuration info for a specific tool"""
        return self.tools.get(tool_name)
