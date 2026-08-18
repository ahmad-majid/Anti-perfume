import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="container" style={{ padding: '60px 0', maxWidth: '800px', minHeight: '80vh' }}>
      <h1 className="serif-title-medium" style={{ color: 'var(--color-burgundy)', marginBottom: '30px' }}>Privacy Policy</h1>
      
      <div style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', fontSize: '1rem', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <p>
          At <strong>Anti Luxury Fragrances</strong>, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy outlines how we collect, use, and safeguard your data when you visit our website or make a purchase.
        </p>

        <h3 style={{ color: 'var(--color-text-primary)', marginTop: '20px', fontSize: '1.2rem' }}>1. Information We Collect</h3>
        <p>
          When you make a purchase or create an account, we collect personal information such as your name, email address, shipping address, and phone number. We also collect data about your browsing behavior to improve your shopping experience.
        </p>

        <h3 style={{ color: 'var(--color-text-primary)', marginTop: '20px', fontSize: '1.2rem' }}>2. How We Use Your Information</h3>
        <p>
          The information we collect is used to:
        </p>
        <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
          <li>Process and fulfill your orders, including sending order confirmations and shipping updates.</li>
          <li>Communicate with you regarding customer support inquiries.</li>
          <li>Send promotional offers and newsletters (only if you have opted in).</li>
          <li>Improve our website functionality and product offerings.</li>
        </ul>

        <h3 style={{ color: 'var(--color-text-primary)', marginTop: '20px', fontSize: '1.2rem' }}>3. Data Protection</h3>
        <p>
          We implement a variety of security measures to maintain the safety of your personal information. Your payment information is processed securely, and we do not store your credit card details on our servers.
        </p>

        <h3 style={{ color: 'var(--color-text-primary)', marginTop: '20px', fontSize: '1.2rem' }}>4. Third-Party Services</h3>
        <p>
          We may share your information with trusted third-party service providers (such as shipping partners) strictly for the purpose of fulfilling your order. We do not sell or trade your personal information to outside parties.
        </p>

        <h3 style={{ color: 'var(--color-text-primary)', marginTop: '20px', fontSize: '1.2rem' }}>5. Your Rights</h3>
        <p>
          You have the right to access, update, or request the deletion of your personal information at any time. If you wish to exercise these rights, please contact us at support@anti-fragrances.com.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
