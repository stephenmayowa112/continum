import emailjs from '@emailjs/browser';

interface EmailParams {
  to_email: string;
  to_name: string;
  message: string;
}

export const sendMentorSignupEmail = async (params: EmailParams): Promise<void> => {
  const templateParams = {
    to_name: params.to_name,
    to_email: params.to_email,
    biography: params.message,    
  };

  try {
    console.log('Sending email with params:', templateParams);
    
    const response = await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
      templateParams
    );

    console.log('Email sent successfully:', response);
  } catch (error) {
    console.error('Detailed email service error:', error);
    throw new Error('Failed to send email. Please try again later.');
  }
};
