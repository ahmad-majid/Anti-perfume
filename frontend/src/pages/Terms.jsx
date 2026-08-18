import React from 'react';

const Terms = () => {
  return (
    <div className="container" style={{ padding: '60px 0', maxWidth: '800px', minHeight: '80vh' }}>
      <h1 className="serif-title-medium" style={{ color: 'var(--color-burgundy)', marginBottom: '30px' }}>Terms & Conditions</h1>
      
      <div style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', fontSize: '1rem', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <p>
          Welcome to <strong>Anti Luxury Fragrances</strong>. By accessing our website and purchasing our products, you agree to be bound by the following Terms and Conditions. Please read them carefully.
        </p>

        <h3 style={{ color: 'var(--color-text-primary)', marginTop: '20px', fontSize: '1.2rem' }}>1. General Conditions</h3>
        <p>
          We reserve the right to refuse service to anyone for any reason at any time. You understand that your content (not including credit card information) may be transferred unencrypted over various networks.
        </p>

        <h3 style={{ color: 'var(--color-text-primary)', marginTop: '20px', fontSize: '1.2rem' }}>2. Product Information & Pricing</h3>
        <p>
          We strive to provide accurate product descriptions and pricing. However, errors may occur. We reserve the right to correct any errors, inaccuracies, or omissions, and to change or update information or cancel orders if any information is inaccurate at any time without prior notice.
        </p>

        <h3 style={{ color: 'var(--color-text-primary)', marginTop: '20px', fontSize: '1.2rem' }}>3. Order Acceptance & Cancellation</h3>
        <p>
          Your receipt of an electronic or other form of order confirmation does not signify our acceptance of your order, nor does it constitute confirmation of our offer to sell. We reserve the right at any time after receipt of your order to accept or decline your order for any reason.
        </p>

        <h3 style={{ color: 'var(--color-text-primary)', marginTop: '20px', fontSize: '1.2rem' }}>4. Shipping & Delivery</h3>
        <p>
          We offer FREE shipping across Pakistan. Delivery times are estimates and commence from the date of shipping, rather than the date of order. We are not responsible for any delays caused by the courier service.
        </p>

        <h3 style={{ color: 'var(--color-text-primary)', marginTop: '20px', fontSize: '1.2rem' }}>5. Returns & Refunds</h3>
        <p>
          We offer a 15-day easy return policy. To be eligible for a return, your item must be unused, in the same condition that you received it, and in its original packaging. Please refer to our Refund Policy for detailed instructions.
        </p>

        <h3 style={{ color: 'var(--color-text-primary)', marginTop: '20px', fontSize: '1.2rem' }}>6. Intellectual Property</h3>
        <p>
          All content on this site, including text, graphics, logos, images, and software, is the property of Anti Luxury Fragrances and is protected by international copyright laws.
        </p>

        <h3 style={{ color: 'var(--color-text-primary)', marginTop: '20px', fontSize: '1.2rem' }}>7. Changes to Terms</h3>
        <p>
          We reserve the right to update, change, or replace any part of these Terms & Conditions by posting updates and/or changes to our website. It is your responsibility to check this page periodically for changes.
        </p>
      </div>
    </div>
  );
};

export default Terms;
