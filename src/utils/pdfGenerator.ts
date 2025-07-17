import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePayslipPDF = async (employee: any, salaryData: any, month: string) => {
  const pdf = new jsPDF();
  
  // Company Header
  pdf.setFontSize(20);
  pdf.setTextColor(40, 40, 40);
  pdf.text('Employee Management System', 20, 30);
  
  pdf.setFontSize(14);
  pdf.text('PAYSLIP', 20, 45);
  
  // Employee Details
  pdf.setFontSize(12);
  pdf.text(`Employee: ${employee.name}`, 20, 65);
  pdf.text(`ID: ${employee.id}`, 20, 75);
  pdf.text(`Position: ${employee.position}`, 20, 85);
  pdf.text(`Department: ${employee.department}`, 20, 95);
  pdf.text(`Month: ${month}`, 20, 105);
  
  // Salary Breakdown
  pdf.text('SALARY BREAKDOWN', 20, 125);
  pdf.line(20, 130, 190, 130);
  
  pdf.text(`Base Salary: $${salaryData.base.toLocaleString()}`, 20, 145);
  pdf.text(`Bonus: $${salaryData.bonus.toLocaleString()}`, 20, 155);
  pdf.text(`Tax: -$${salaryData.tax.toLocaleString()}`, 20, 165);
  
  pdf.line(20, 175, 190, 175);
  pdf.setFontSize(14);
  pdf.text(`Net Salary: $${salaryData.net.toLocaleString()}`, 20, 190);
  
  // Footer
  pdf.setFontSize(10);
  pdf.text('This is a computer-generated payslip. No signature required.', 20, 270);
  
  return pdf;
};

export const generateInvoicePDF = async (invoice: any) => {
  const pdf = new jsPDF();
  
  // Header
  pdf.setFontSize(20);
  pdf.text('INVOICE', 20, 30);
  
  pdf.setFontSize(12);
  pdf.text(`Invoice #: ${invoice.invoiceNumber}`, 20, 50);
  pdf.text(`Client: ${invoice.clientName}`, 20, 60);
  pdf.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`, 20, 70);
  pdf.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 20, 80);
  
  // Items table
  let yPosition = 100;
  pdf.text('Description', 20, yPosition);
  pdf.text('Qty', 100, yPosition);
  pdf.text('Rate', 130, yPosition);
  pdf.text('Total', 160, yPosition);
  
  pdf.line(20, yPosition + 5, 190, yPosition + 5);
  
  invoice.items.forEach((item: any, index: number) => {
    yPosition += 15;
    pdf.text(item.description, 20, yPosition);
    pdf.text(item.quantity.toString(), 100, yPosition);
    pdf.text(`$${item.rate}`, 130, yPosition);
    pdf.text(`$${item.total}`, 160, yPosition);
  });
  
  // Total
  yPosition += 20;
  pdf.line(20, yPosition, 190, yPosition);
  pdf.setFontSize(14);
  pdf.text(`Total: $${invoice.amount.toLocaleString()}`, 20, yPosition + 15);
  
  return pdf;
};

export const generateDispatchSlipPDF = async (dispatchItem: any) => {
  const pdf = new jsPDF();
  
  // Header
  pdf.setFontSize(20);
  pdf.text('DISPATCH SLIP', 20, 30);
  
  pdf.setFontSize(12);
  pdf.text(`Order #: ${dispatchItem.orderNumber}`, 20, 50);
  pdf.text(`Client: ${dispatchItem.client}`, 20, 60);
  pdf.text(`Status: ${dispatchItem.status}`, 20, 70);
  
  if (dispatchItem.assignedTo) {
    pdf.text(`Assigned to: ${dispatchItem.assignedTo}`, 20, 80);
  }
  
  if (dispatchItem.dispatchDate) {
    pdf.text(`Dispatch Date: ${new Date(dispatchItem.dispatchDate).toLocaleDateString()}`, 20, 90);
  }
  
  // Items
  let yPosition = 110;
  pdf.text('ITEMS:', 20, yPosition);
  
  dispatchItem.items.forEach((item: any, index: number) => {
    yPosition += 15;
    pdf.text(`${item.name} - Qty: ${item.quantity}`, 25, yPosition);
  });
  
  // Signature section
  yPosition += 40;
  pdf.text('Dispatcher Signature: ____________________', 20, yPosition);
  pdf.text('Date: ____________________', 20, yPosition + 20);
  
  return pdf;
};

export const generateReportPDF = async (reportData: any, reportType: string) => {
  const pdf = new jsPDF();
  
  // Header
  pdf.setFontSize(20);
  pdf.text(`${reportType.toUpperCase()} REPORT`, 20, 30);
  
  pdf.setFontSize(12);
  pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 50);
  
  // Content based on report type
  let yPosition = 70;
  
  if (reportType === 'employee') {
    pdf.text('EMPLOYEE SUMMARY', 20, yPosition);
    yPosition += 20;
    
    reportData.employees.forEach((emp: any, index: number) => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 30;
      }
      
      pdf.text(`${emp.name} - ${emp.position} - $${emp.salary.toLocaleString()}`, 20, yPosition);
      yPosition += 10;
    });
  } else if (reportType === 'financial') {
    pdf.text('FINANCIAL SUMMARY', 20, yPosition);
    yPosition += 20;
    
    pdf.text(`Total Revenue: $${reportData.totalRevenue.toLocaleString()}`, 20, yPosition);
    yPosition += 10;
    pdf.text(`Paid Invoices: ${reportData.paidInvoices}`, 20, yPosition);
    yPosition += 10;
    pdf.text(`Pending Invoices: ${reportData.pendingInvoices}`, 20, yPosition);
  }
  
  return pdf;
};