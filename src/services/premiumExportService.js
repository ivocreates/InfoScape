// Premium Export Service for InfoScope OSINT Platform v2.3.0
// Advanced export features for premium subscribers

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Document, Packer, Paragraph, HeadingLevel, TextRun, Table, TableRow, TableCell } from 'docx';
import subscriptionService from './subscriptionService';

class PremiumExportService {
  constructor() {
    this.brandColors = {
      primary: '#2563EB',
      secondary: '#1E40AF',
      accent: '#7C3AED',
      text: '#1F2937',
      gray: '#6B7280'
    };
  }

  // Check if user can export in specific format
  canExportFormat(format) {
    return subscriptionService.canExportFormat(format);
  }

  // Export investigation results with premium formatting
  async exportInvestigation(data, format = 'json', options = {}) {
    if (!this.canExportFormat(format)) {
      throw new Error(`${format.toUpperCase()} export requires ${this.getRequiredPlan(format)} subscription`);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = options.filename || `infoscope-investigation-${timestamp}`;
    const plan = subscriptionService.getCurrentPlan();

    switch (format.toLowerCase()) {
      case 'pdf':
        return await this.exportToPDF(data, filename, plan);
      case 'doc':
        return await this.exportToDoc(data, filename, plan);
      case 'csv':
        return await this.exportToCSV(data, filename, plan);
      case 'xlsx':
        return await this.exportToExcel(data, filename, plan);
      case 'xml':
        return await this.exportToXML(data, filename, plan);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  // Get required plan for format
  getRequiredPlan(format) {
    const formatRequirements = {
      'json': 'Free',
      'txt': 'Premium',
      'csv': 'Premium',
      'pdf': 'Premium',
      'doc': 'Premium',
      'docx': 'Premium',
      'xml': 'Premium',
      'xlsx': 'Premium'
    };
    return formatRequirements[format.toLowerCase()] || 'Premium';
  }

  // Export to PDF with professional formatting
  async exportToPDF(data, filename, plan) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Header with branding
    this.addPDFHeader(doc, pageWidth, plan);
    
    let yPosition = 50;
    
    // Investigation summary
    doc.setFontSize(16);
    doc.setTextColor(this.brandColors.primary);
    doc.text('Investigation Report', 20, yPosition);
    yPosition += 15;
    
    // Target information
    doc.setFontSize(12);
    doc.setTextColor(this.brandColors.text);
    const target = data.ip || data.email || data.domain || data.phone || data.query || data.username;
    doc.text(`Target: ${target}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Generated: ${new Date(data.timestamp).toLocaleString()}`, 20, yPosition);
    yPosition += 20;
    
    // Results table
    if (data.sources && data.sources.length > 0) {
      const tableData = data.sources.map(source => [
        source.source || 'Unknown',
        source.success ? 'Success' : 'Failed',
        source.success ? this.extractKeyInfo(source) : source.error || 'No data'
      ]);
      
      doc.autoTable({
        startY: yPosition,
        head: [['Source', 'Status', 'Key Information']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: this.hexToRgb(this.brandColors.primary),
          textColor: 255,
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 9,
          textColor: this.hexToRgb(this.brandColors.text)
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250]
        },
        margin: { left: 20, right: 20 }
      });
      
      yPosition = doc.lastAutoTable.finalY + 20;
    }
    
    // Social media platforms (if applicable)
    if (data.platforms && data.platforms.length > 0) {
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 30;
      }
      
      doc.setFontSize(14);
      doc.setTextColor(this.brandColors.primary);
      doc.text('Social Media Platforms', 20, yPosition);
      yPosition += 15;
      
      const platformData = data.platforms.map(platform => [
        platform.name,
        platform.icon,
        platform.status,
        platform.url
      ]);
      
      doc.autoTable({
        startY: yPosition,
        head: [['Platform', 'Icon', 'Status', 'URL']],
        body: platformData,
        theme: 'grid',
        headStyles: {
          fillColor: this.hexToRgb(this.brandColors.accent),
          textColor: 255,
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 9,
          textColor: this.hexToRgb(this.brandColors.text)
        },
        margin: { left: 20, right: 20 }
      });
    }
    
    // Footer with plan information
    this.addPDFFooter(doc, pageWidth, pageHeight, plan);
    
    // Save the PDF
    doc.save(`${filename}.pdf`);
    return `${filename}.pdf`;
  }

  // Add PDF header
  addPDFHeader(doc, pageWidth, plan) {
    // Background header
    doc.setFillColor(this.hexToRgb(this.brandColors.primary));
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    // Logo and title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('InfoScope OSINT', 20, 20);
    
    // Plan badge
    doc.setFontSize(10);
    doc.text(`${plan.name} Plan`, pageWidth - 60, 15);
    doc.text('Professional Report', pageWidth - 60, 25);
  }

  // Add PDF footer
  addPDFFooter(doc, pageWidth, pageHeight, plan) {
    const footerY = pageHeight - 20;
    
    doc.setFontSize(8);
    doc.setTextColor(this.brandColors.gray);
    doc.text('Generated by InfoScope OSINT Platform v2.3.0', 20, footerY);
    doc.text(`Plan: ${plan.name} | infoscope-osint.web.app`, pageWidth - 120, footerY);
  }

  // Export to DOC format
  async exportToDoc(data, filename, plan) {
    const target = data.ip || data.email || data.domain || data.phone || data.query || data.username;
    
    const children = [
      // Header
      new Paragraph({
        children: [
          new TextRun({
            text: 'InfoScope OSINT Investigation Report',
            bold: true,
            size: 32,
            color: this.brandColors.primary.replace('#', '')
          })
        ],
        heading: HeadingLevel.HEADING_1
      }),
      
      // Plan badge
      new Paragraph({
        children: [
          new TextRun({
            text: `Generated with ${plan.name} Plan`,
            italics: true,
            size: 20,
            color: this.brandColors.accent.replace('#', '')
          })
        ]
      }),
      
      new Paragraph({ text: '' }), // Empty line
      
      // Investigation details
      new Paragraph({
        children: [
          new TextRun({
            text: 'Investigation Details',
            bold: true,
            size: 24
          })
        ],
        heading: HeadingLevel.HEADING_2
      }),
      
      new Paragraph({
        children: [
          new TextRun({ text: 'Target: ', bold: true }),
          new TextRun({ text: target })
        ]
      }),
      
      new Paragraph({
        children: [
          new TextRun({ text: 'Generated: ', bold: true }),
          new TextRun({ text: new Date(data.timestamp).toLocaleString() })
        ]
      }),
      
      new Paragraph({ text: '' }), // Empty line
    ];
    
    // Add sources table if available
    if (data.sources && data.sources.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Investigation Sources',
              bold: true,
              size: 24
            })
          ],
          heading: HeadingLevel.HEADING_2
        })
      );
      
      const tableRows = [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Source', style: 'tableHeader' })] }),
            new TableCell({ children: [new Paragraph({ text: 'Status', style: 'tableHeader' })] }),
            new TableCell({ children: [new Paragraph({ text: 'Information', style: 'tableHeader' })] })
          ]
        }),
        ...data.sources.map(source => 
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ text: source.source || 'Unknown' })] }),
              new TableCell({ children: [new Paragraph({ text: source.success ? 'Success' : 'Failed' })] }),
              new TableCell({ children: [new Paragraph({ text: source.success ? this.extractKeyInfo(source) : source.error || 'No data' })] })
            ]
          })
        )
      ];
      
      children.push(
        new Table({
          rows: tableRows,
          width: {
            size: 100,
            type: 'pct'
          }
        })
      );
    }
    
    // Add platforms if available
    if (data.platforms && data.platforms.length > 0) {
      children.push(
        new Paragraph({ text: '' }), // Empty line
        new Paragraph({
          children: [
            new TextRun({
              text: 'Social Media Platforms',
              bold: true,
              size: 24
            })
          ],
          heading: HeadingLevel.HEADING_2
        })
      );
      
      data.platforms.forEach(platform => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${platform.icon} ${platform.name}: `, bold: true }),
              new TextRun({ text: platform.url })
            ]
          })
        );
      });
    }
    
    // Add footer
    children.push(
      new Paragraph({ text: '' }), // Empty line
      new Paragraph({
        children: [
          new TextRun({
            text: 'Generated by InfoScope OSINT Platform v2.3.0',
            italics: true,
            size: 18,
            color: this.brandColors.gray.replace('#', '')
          })
        ]
      })
    );
    
    const doc = new Document({
      sections: [{
        children: children
      }]
    });
    
    const buffer = await Packer.toBuffer(doc);
    this.downloadFile(buffer, `${filename}.docx`, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    return `${filename}.docx`;
  }

  // Export to CSV with enhanced formatting
  async exportToCSV(data, filename, plan) {
    const rows = [];
    
    // Header with metadata
    rows.push(['InfoScope OSINT Investigation Report']);
    rows.push([`Plan: ${plan.name}`]);
    rows.push([`Target: ${data.ip || data.email || data.domain || data.phone || data.query || data.username}`]);
    rows.push([`Generated: ${new Date(data.timestamp).toLocaleString()}`]);
    rows.push(['']); // Empty row
    
    // Column headers
    rows.push(['Source', 'Status', 'Category', 'Key', 'Value', 'Timestamp']);
    
    // Add source data
    if (data.sources) {
      data.sources.forEach(source => {
        const type = data.ip ? 'IP' : data.email ? 'Email' : 
                     data.domain ? 'Domain' : data.phone ? 'Phone' : 
                     data.query ? 'Location' : 'Other';
        
        if (source.success) {
          Object.entries(source).forEach(([key, value]) => {
            if (key !== 'source' && key !== 'success') {
              if (typeof value === 'object' && value !== null) {
                Object.entries(value).forEach(([subKey, subValue]) => {
                  rows.push([
                    source.source,
                    'Success',
                    type,
                    `${key}.${subKey}`,
                    this.formatValue(subValue),
                    data.timestamp
                  ]);
                });
              } else {
                rows.push([
                  source.source,
                  'Success',
                  type,
                  key,
                  this.formatValue(value),
                  data.timestamp
                ]);
              }
            }
          });
        } else {
          rows.push([
            source.source,
            'Failed',
            type,
            'error',
            source.error || 'Unknown error',
            data.timestamp
          ]);
        }
      });
    }
    
    // Add platform data
    if (data.platforms) {
      rows.push(['']); // Empty row
      rows.push(['Social Media Platforms']);
      rows.push(['Platform', 'Icon', 'Status', 'URL', '', '']);
      
      data.platforms.forEach(platform => {
        rows.push([
          platform.name,
          platform.icon,
          platform.status,
          platform.url,
          '',
          data.timestamp
        ]);
      });
    }
    
    const csvContent = rows.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    this.downloadFile(csvContent, `${filename}.csv`, 'text/csv');
    return `${filename}.csv`;
  }

  // Export to Excel format (Enterprise feature)
  async exportToExcel(data, filename, plan) {
    // This would require a library like xlsx or exceljs
    // For now, fall back to enhanced CSV
    console.warn('Excel export not yet implemented, falling back to CSV');
    return await this.exportToCSV(data, filename, plan);
  }

  // Export to XML format (Enterprise feature)
  async exportToXML(data, filename, plan) {
    const target = data.ip || data.email || data.domain || data.phone || data.query || data.username;
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<investigation>\n';
    xml += `  <metadata>\n`;
    xml += `    <plan>${this.escapeXML(plan.name)}</plan>\n`;
    xml += `    <target>${this.escapeXML(target)}</target>\n`;
    xml += `    <timestamp>${this.escapeXML(data.timestamp)}</timestamp>\n`;
    xml += `    <generator>InfoScope OSINT Platform v2.3.0</generator>\n`;
    xml += `  </metadata>\n`;
    
    // Add sources
    if (data.sources) {
      xml += '  <sources>\n';
      data.sources.forEach(source => {
        xml += `    <source name="${this.escapeXML(source.source)}" success="${source.success}">\n`;
        if (source.success) {
          Object.entries(source).forEach(([key, value]) => {
            if (key !== 'source' && key !== 'success') {
              xml += `      <${key}>${this.escapeXML(this.formatValue(value))}</${key}>\n`;
            }
          });
        } else {
          xml += `      <error>${this.escapeXML(source.error || 'Unknown error')}</error>\n`;
        }
        xml += '    </source>\n';
      });
      xml += '  </sources>\n';
    }
    
    // Add platforms
    if (data.platforms) {
      xml += '  <platforms>\n';
      data.platforms.forEach(platform => {
        xml += `    <platform>\n`;
        xml += `      <name>${this.escapeXML(platform.name)}</name>\n`;
        xml += `      <icon>${this.escapeXML(platform.icon)}</icon>\n`;
        xml += `      <status>${this.escapeXML(platform.status)}</status>\n`;
        xml += `      <url>${this.escapeXML(platform.url)}</url>\n`;
        xml += `    </platform>\n`;
      });
      xml += '  </platforms>\n';
    }
    
    xml += '</investigation>';
    
    this.downloadFile(xml, `${filename}.xml`, 'application/xml');
    return `${filename}.xml`;
  }

  // Helper methods
  extractKeyInfo(source) {
    const keys = Object.keys(source).filter(k => k !== 'source' && k !== 'success');
    if (keys.length === 0) return 'No data';
    
    const key = keys[0];
    const value = source[key];
    
    if (typeof value === 'object' && value !== null) {
      const firstSubKey = Object.keys(value)[0];
      return `${key}: ${value[firstSubKey]}`;
    }
    
    return `${key}: ${value}`;
  }

  formatValue(value) {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    return String(value);
  }

  escapeXML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0];
  }

  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export default new PremiumExportService();