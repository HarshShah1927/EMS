// Email service for sending notifications
export const sendEmail = async (to: string, subject: string, content: string, attachment?: Blob) => {
  try {
    // In a real application, this would connect to your email service
    // For demo purposes, we'll simulate the email sending
    console.log('Sending email to:', to);
    console.log('Subject:', subject);
    console.log('Content:', content);
    
    // Simulate API call to email service
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        content,
        hasAttachment: !!attachment
      })
    });
    
    if (response.ok) {
      alert(`Email sent successfully to ${to}`);
      return true;
    } else {
      throw new Error('Failed to send email');
    }
  } catch (error) {
    console.error('Email sending failed:', error);
    alert('Failed to send email. Please try again.');
    return false;
  }
};

export const sendPayslipEmail = async (employee: any, pdfBlob: Blob, month: string) => {
  const subject = `Payslip for ${month}`;
  const content = `
    Dear ${employee.name},
    
    Please find attached your payslip for ${month}.
    
    If you have any questions, please contact HR.
    
    Best regards,
    HR Department
  `;
  
  return await sendEmail(employee.email, subject, content, pdfBlob);
};

export const sendInvoiceEmail = async (invoice: any, pdfBlob: Blob) => {
  const subject = `Invoice ${invoice.invoiceNumber}`;
  const content = `
    Dear ${invoice.clientName},
    
    Please find attached invoice ${invoice.invoiceNumber} for $${invoice.amount.toLocaleString()}.
    
    Due date: ${new Date(invoice.dueDate).toLocaleDateString()}
    
    Thank you for your business.
    
    Best regards,
    Accounts Department
  `;
  
  return await sendEmail(invoice.clientEmail || 'client@example.com', subject, content, pdfBlob);
};