"""
Report Generator for InfoScape
Generates professional reports in various formats (PDF, CSV, JSON, HTML)
"""

import asyncio
import logging
import json
import csv
import io
from typing import Dict, List, Any, Optional, Union
from dataclasses import dataclass, asdict
from datetime import datetime
import tempfile
import os
from pathlib import Path

logger = logging.getLogger(__name__)

@dataclass
class ReportConfig:
    """Configuration for report generation"""
    title: str
    author: str
    format: str  # 'pdf', 'csv', 'json', 'html'
    include_metadata: bool = True
    include_raw_data: bool = False
    include_charts: bool = True
    template: Optional[str] = None
    custom_fields: Dict[str, Any] = None

@dataclass
class ReportSection:
    """Section within a report"""
    title: str
    content: Union[str, Dict[str, Any], List[Any]]
    section_type: str  # 'text', 'table', 'chart', 'raw_data'
    metadata: Dict[str, Any] = None

class ReportGenerator:
    """Professional report generator for OSINT investigations"""
    
    def __init__(self):
        self.templates_dir = Path(__file__).parent.parent / "templates"
        self.output_dir = Path(tempfile.gettempdir()) / "infoscape_reports"
        self.output_dir.mkdir(exist_ok=True)
        
    async def generate_investigation_report(self, 
                                          investigation_data: Dict[str, Any], 
                                          config: ReportConfig) -> Dict[str, Any]:
        """
        Generate comprehensive investigation report
        
        Args:
            investigation_data: Complete investigation data
            config: Report configuration
            
        Returns:
            Report generation result with file path and metadata
        """
        logger.info(f"Generating {config.format} report: {config.title}")
        
        try:
            # Prepare report data
            report_data = await self._prepare_report_data(investigation_data, config)
            
            # Generate report based on format
            if config.format.lower() == 'pdf':
                result = await self._generate_pdf_report(report_data, config)
            elif config.format.lower() == 'csv':
                result = await self._generate_csv_report(report_data, config)
            elif config.format.lower() == 'json':
                result = await self._generate_json_report(report_data, config)
            elif config.format.lower() == 'html':
                result = await self._generate_html_report(report_data, config)
            else:
                raise ValueError(f"Unsupported report format: {config.format}")
            
            logger.info(f"Report generated successfully: {result['file_path']}")
            return result
            
        except Exception as e:
            logger.error(f"Error generating report: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'file_path': None
            }
    
    async def _prepare_report_data(self, investigation_data: Dict[str, Any], 
                                 config: ReportConfig) -> Dict[str, Any]:
        """Prepare and structure data for report generation"""
        
        # Extract key information
        search_results = investigation_data.get('search_results', [])
        correlation_data = investigation_data.get('correlation_data', {})
        session_info = investigation_data.get('session_info', {})
        
        # Build report sections
        sections = []
        
        # Executive Summary
        summary_section = await self._create_executive_summary(search_results, correlation_data)
        sections.append(summary_section)
        
        # Search Results by Type
        if search_results:
            results_sections = await self._create_results_sections(search_results)
            sections.extend(results_sections)
        
        # Entity Correlation Analysis
        if correlation_data:
            correlation_section = await self._create_correlation_section(correlation_data)
            sections.append(correlation_section)
        
        # Technical Details
        if config.include_raw_data:
            technical_section = await self._create_technical_section(investigation_data)
            sections.append(technical_section)
        
        # Prepare metadata
        metadata = {
            'generation_time': datetime.now().isoformat(),
            'author': config.author,
            'title': config.title,
            'total_searches': len(search_results),
            'search_types': list(set(result.get('type', 'unknown') for result in search_results)),
            'confidence_score': correlation_data.get('confidence_score', 0.0),
            'session_id': session_info.get('id'),
            'version': '2.0.0'
        }
        
        return {
            'metadata': metadata,
            'sections': sections,
            'raw_data': investigation_data if config.include_raw_data else None
        }
    
    async def _create_executive_summary(self, search_results: List[Dict], 
                                      correlation_data: Dict) -> ReportSection:
        """Create executive summary section"""
        
        # Calculate statistics
        total_results = sum(len(result.get('results', [])) for result in search_results)
        platforms_found = set()
        confidence_scores = []
        
        for result in search_results:
            for item in result.get('results', []):
                if 'platform' in item:
                    platforms_found.add(item['platform'])
                if 'confidence' in item:
                    confidence_scores.append(item['confidence'])
        
        avg_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0.0
        
        summary_text = f"""
        Investigation Summary:
        - Total search operations: {len(search_results)}
        - Total results found: {total_results}
        - Platforms/Sources identified: {len(platforms_found)}
        - Average confidence score: {avg_confidence:.2f}
        - Overall correlation confidence: {correlation_data.get('confidence_score', 0.0):.2f}
        
        Key Findings:
        - Digital footprint spans {len(platforms_found)} different platforms
        - {len([r for r in search_results if r.get('type') == 'people'])} people search operations
        - {len([r for r in search_results if r.get('type') == 'social'])} social media investigations
        - {len([r for r in search_results if r.get('type') == 'domain'])} domain intelligence operations
        """
        
        return ReportSection(
            title="Executive Summary",
            content=summary_text.strip(),
            section_type="text",
            metadata={
                'statistics': {
                    'total_searches': len(search_results),
                    'total_results': total_results,
                    'platforms_count': len(platforms_found),
                    'average_confidence': avg_confidence
                }
            }
        )
    
    async def _create_results_sections(self, search_results: List[Dict]) -> List[ReportSection]:
        """Create sections for different types of search results"""
        sections = []
        
        # Group results by type
        results_by_type = {}
        for result in search_results:
            result_type = result.get('type', 'unknown')
            if result_type not in results_by_type:
                results_by_type[result_type] = []
            results_by_type[result_type].append(result)
        
        # Create section for each type
        for result_type, type_results in results_by_type.items():
            section_title = f"{result_type.title()} Search Results"
            
            # Prepare table data
            table_data = []
            for result in type_results:
                for item in result.get('results', []):
                    row = {
                        'Platform/Source': item.get('platform', 'Unknown'),
                        'Identifier': item.get('username', item.get('email', item.get('domain', 'N/A'))),
                        'Confidence': f"{item.get('confidence', 0.0):.2f}",
                        'URL': item.get('url', 'N/A'),
                        'Additional Data': str(item.get('additional_info', ''))[:100]
                    }
                    table_data.append(row)
            
            section = ReportSection(
                title=section_title,
                content=table_data,
                section_type="table",
                metadata={
                    'total_results': len(table_data),
                    'search_operations': len(type_results)
                }
            )
            sections.append(section)
        
        return sections
    
    async def _create_correlation_section(self, correlation_data: Dict) -> ReportSection:
        """Create entity correlation analysis section"""
        
        primary_entity = correlation_data.get('primary_entity', {})
        related_entities = correlation_data.get('related_entities', [])
        correlation_graph = correlation_data.get('correlation_graph', {})
        
        correlation_text = f"""
        Entity Correlation Analysis:
        
        Primary Entity:
        - Identifier: {primary_entity.get('username', primary_entity.get('email', 'Unknown'))}
        - Platform: {primary_entity.get('platform', 'Unknown')}
        - Confidence: {primary_entity.get('confidence', 0.0):.2f}
        
        Related Entities Found: {len(related_entities)}
        
        Correlation Network:
        - Total nodes: {len(correlation_graph)}
        - Network density: {len(correlation_graph) / max(1, len(related_entities)):.2f}
        
        Top Related Entities:
        """
        
        # Add top related entities
        for i, entity in enumerate(related_entities[:10]):
            correlation_text += f"  {i+1}. {entity.get('source', 'Unknown')}: {entity.get('confidence', 0.0):.2f} confidence\n"
        
        return ReportSection(
            title="Entity Correlation Analysis",
            content=correlation_text.strip(),
            section_type="text",
            metadata={
                'primary_entity': primary_entity,
                'related_count': len(related_entities),
                'correlation_score': correlation_data.get('confidence_score', 0.0)
            }
        )
    
    async def _create_technical_section(self, investigation_data: Dict) -> ReportSection:
        """Create technical details section"""
        
        session_info = investigation_data.get('session_info', {})
        
        technical_data = {
            'session_details': session_info,
            'tools_used': investigation_data.get('tools_used', []),
            'execution_times': investigation_data.get('execution_times', {}),
            'error_log': investigation_data.get('errors', []),
            'configuration': investigation_data.get('configuration', {})
        }
        
        return ReportSection(
            title="Technical Details",
            content=technical_data,
            section_type="raw_data",
            metadata={'section_type': 'technical_appendix'}
        )
    
    async def _generate_pdf_report(self, report_data: Dict, config: ReportConfig) -> Dict[str, Any]:
        """Generate PDF report (requires additional libraries)"""
        # Note: This would require libraries like reportlab or weasyprint
        # For now, returning a placeholder implementation
        
        filename = f"infoscape_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        file_path = self.output_dir / filename
        
        # Placeholder: would generate actual PDF here
        pdf_content = f"InfoScape Investigation Report\n\nTitle: {config.title}\nGenerated: {datetime.now()}\n\nThis is a placeholder PDF implementation."
        
        with open(file_path, 'w') as f:
            f.write(pdf_content)
        
        return {
            'success': True,
            'file_path': str(file_path),
            'format': 'pdf',
            'size_bytes': os.path.getsize(file_path),
            'metadata': report_data['metadata']
        }
    
    async def _generate_csv_report(self, report_data: Dict, config: ReportConfig) -> Dict[str, Any]:
        """Generate CSV report"""
        
        filename = f"infoscape_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        file_path = self.output_dir / filename
        
        # Flatten all table data into CSV
        csv_data = []
        
        for section in report_data['sections']:
            if section.section_type == 'table' and isinstance(section.content, list):
                for row in section.content:
                    # Add section identifier
                    row_with_section = {'Section': section.title, **row}
                    csv_data.append(row_with_section)
        
        # Write CSV
        if csv_data:
            fieldnames = list(csv_data[0].keys())
            
            with open(file_path, 'w', newline='', encoding='utf-8') as csvfile:
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(csv_data)
        
        return {
            'success': True,
            'file_path': str(file_path),
            'format': 'csv',
            'size_bytes': os.path.getsize(file_path),
            'records_count': len(csv_data),
            'metadata': report_data['metadata']
        }
    
    async def _generate_json_report(self, report_data: Dict, config: ReportConfig) -> Dict[str, Any]:
        """Generate JSON report"""
        
        filename = f"infoscape_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        file_path = self.output_dir / filename
        
        # Convert sections to serializable format
        serializable_sections = []
        for section in report_data['sections']:
            section_dict = {
                'title': section.title,
                'content': section.content,
                'section_type': section.section_type,
                'metadata': section.metadata
            }
            serializable_sections.append(section_dict)
        
        json_data = {
            'metadata': report_data['metadata'],
            'sections': serializable_sections
        }
        
        if config.include_raw_data and report_data['raw_data']:
            json_data['raw_data'] = report_data['raw_data']
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(json_data, f, indent=2, ensure_ascii=False, default=str)
        
        return {
            'success': True,
            'file_path': str(file_path),
            'format': 'json',
            'size_bytes': os.path.getsize(file_path),
            'metadata': report_data['metadata']
        }
    
    async def _generate_html_report(self, report_data: Dict, config: ReportConfig) -> Dict[str, Any]:
        """Generate HTML report"""
        
        filename = f"infoscape_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
        file_path = self.output_dir / filename
        
        # Basic HTML template
        html_content = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>{config.title}</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }}
                .header {{ border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }}
                .section {{ margin-bottom: 30px; }}
                .section h2 {{ color: #333; border-left: 4px solid #007acc; padding-left: 10px; }}
                table {{ width: 100%; border-collapse: collapse; margin: 10px 0; }}
                th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
                th {{ background-color: #f2f2f2; }}
                .metadata {{ background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }}
                .confidence {{ font-weight: bold; color: #007acc; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>{config.title}</h1>
                <p><strong>Generated:</strong> {report_data['metadata']['generation_time']}</p>
                <p><strong>Author:</strong> {config.author}</p>
            </div>
        """
        
        # Add metadata section
        metadata = report_data['metadata']
        html_content += f"""
            <div class="metadata">
                <h3>Investigation Overview</h3>
                <ul>
                    <li><strong>Total Searches:</strong> {metadata.get('total_searches', 0)}</li>
                    <li><strong>Search Types:</strong> {', '.join(metadata.get('search_types', []))}</li>
                    <li><strong>Confidence Score:</strong> <span class="confidence">{metadata.get('confidence_score', 0.0):.2f}</span></li>
                    <li><strong>Session ID:</strong> {metadata.get('session_id', 'N/A')}</li>
                </ul>
            </div>
        """
        
        # Add sections
        for section in report_data['sections']:
            html_content += f'<div class="section"><h2>{section.title}</h2>'
            
            if section.section_type == 'text':
                # Convert text to HTML paragraphs
                paragraphs = section.content.split('\n\n')
                for paragraph in paragraphs:
                    if paragraph.strip():
                        html_content += f'<p>{paragraph.strip()}</p>'
            
            elif section.section_type == 'table' and isinstance(section.content, list):
                if section.content:
                    # Create HTML table
                    html_content += '<table>'
                    
                    # Header row
                    headers = list(section.content[0].keys())
                    html_content += '<tr>' + ''.join(f'<th>{header}</th>' for header in headers) + '</tr>'
                    
                    # Data rows
                    for row in section.content:
                        html_content += '<tr>' + ''.join(f'<td>{row.get(header, "")}</td>' for header in headers) + '</tr>'
                    
                    html_content += '</table>'
            
            html_content += '</div>'
        
        html_content += """
        </body>
        </html>
        """
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        return {
            'success': True,
            'file_path': str(file_path),
            'format': 'html',
            'size_bytes': os.path.getsize(file_path),
            'metadata': report_data['metadata']
        }
    
    def get_available_formats(self) -> List[str]:
        """Get list of available report formats"""
        return ['pdf', 'csv', 'json', 'html']
    
    def get_reports_directory(self) -> str:
        """Get the reports output directory"""
        return str(self.output_dir)
