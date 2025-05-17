// Note: In a real application, you'd use a backend API or service like EmailJS, SendGrid, etc.
// For this example, we're using a dummy implementation that logs to the console.

export const sendEmail = async (name: string, email: string, message: string): Promise<boolean> => {
  try {
    // In a real implementation, you would make an API call to your backend service
    console.log('Sending email to: test@gmail.com');
    console.log('From:', name, email);
    console.log('Message:', message);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Implementation using EmailJS (requires EmailJS account)
export const sendEmailWithEmailJS = async (
  name: string, 
  email: string, 
  message: string, 
  serviceId: string, 
  templateId: string, 
  userId: string
): Promise<boolean> => {
  try {
    const templateParams = {
      from_name: name,
      from_email: email,
      message: message,
      to_email: 'test@gmail.com',
    };
    
    // This would normally use emailjs.send
    console.log('EmailJS would send with:', { serviceId, templateId, userId, templateParams });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
  } catch (error) {
    console.error('Error sending email with EmailJS:', error);
    return false;
  }
};