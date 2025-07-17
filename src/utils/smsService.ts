// SMS service for low stock alerts with WhatsApp integration
export const sendSMS = async (phoneNumber: string, message: string) => {
  try {
    // In a real application, this would use Twilio or similar service
    console.log('Sending SMS to:', phoneNumber);
    console.log('Message:', message);
    
    // Simulate API call to SMS service
    const response = await fetch('/api/send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: phoneNumber,
        message
      })
    });
    
    if (response.ok) {
      alert(`SMS sent successfully to ${phoneNumber}`);
      return true;
    } else {
      throw new Error('Failed to send SMS');
    }
  } catch (error) {
    console.error('SMS sending failed:', error);
    alert('Failed to send SMS. Please try again.');
    return false;
  }
};

export const sendWhatsAppAlert = async (phoneNumber: string, message: string) => {
  try {
    // WhatsApp Business API integration
    console.log('Sending WhatsApp message to:', phoneNumber);
    console.log('Message:', message);
    
    // Simulate WhatsApp API call
    const response = await fetch('/api/send-whatsapp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: phoneNumber,
        message,
        type: 'text'
      })
    });
    
    if (response.ok) {
      alert(`WhatsApp message sent successfully to ${phoneNumber}`);
      return true;
    } else {
      throw new Error('Failed to send WhatsApp message');
    }
  } catch (error) {
    console.error('WhatsApp sending failed:', error);
    alert('Failed to send WhatsApp message. Please try again.');
    return false;
  }
};

export const sendLowStockAlert = async (item: any, phoneNumber: string = '+91 9405042893') => {
  const message = `🚨 LOW STOCK ALERT 🚨\n\nItem: ${item.name}\nCurrent Stock: ${item.quantity} ${item.unit}\nStatus: ${item.status.replace('_', ' ').toUpperCase()}\n\nPlease reorder immediately to avoid stockout.\n\n- Employee Management System`;
  
  // Send to the specified WhatsApp number
  return await sendWhatsAppAlert(phoneNumber, message);
};