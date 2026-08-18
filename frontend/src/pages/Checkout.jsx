import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Tag, CheckCircle, Upload, ShieldCheck, ShoppingBag, ArrowLeft, Building, AlertCircle } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Checkout = () => {
  const { cartItems, cartSubtotal, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Contact & Shipping Form State
  const [emailOrPhone, setEmailOrPhone] = useState(user?.email || '');
  const [emailDiscounts, setEmailDiscounts] = useState(true);
  const [country, setCountry] = useState('Pakistan');
  const [firstName, setFirstName] = useState(user?.username?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(user?.username?.split(' ')[1] || '');
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [saveInfo, setSaveInfo] = useState(true);

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery (COD)');
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [billingAddress, setBillingAddress] = useState({ address: '', city: '', postalCode: '', country: 'Pakistan' });

  // Bank Transfer Proof
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptUrl, setReceiptUrl] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Site Config Bank Details
  const [siteConfig, setSiteConfig] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/shop');
      return;
    }

    fetch('http://localhost:5000/api/site-config')
      .then((r) => r.json())
      .then((data) => setSiteConfig(data))
      .catch(() => {});
  }, [cartItems, navigate]);

  const bankDetails = siteConfig?.bankDetails || {
    bankName: 'Meezan Bank',
    accountTitle: 'Anti Luxury Fragrances',
    accountNumber: '02880110596741',
    iban: 'PK64MEZN0002880110596741',
    discountPercent: 5,
    supportPhone: '0314-1774008',
  };

  // Calculations
  const subtotal = cartSubtotal;
  const couponDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const subtotalAfterCoupon = Math.max(0, subtotal - couponDiscount);
  const bankDiscount = paymentMethod === 'Bank Transfer'
    ? (subtotalAfterCoupon * (bankDetails.discountPercent || 5)) / 100
    : 0;
  const finalTotal = Math.max(0, subtotalAfterCoupon - bankDiscount);

  // Apply Coupon Code
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    try {
      const res = await fetch('http://localhost:5000/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: user ? `Bearer ${user.token}` : '',
        },
        body: JSON.stringify({ code: couponCode.trim(), subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Invalid coupon code.');
      } else {
        setAppliedCoupon({ code: data.couponCode, discountAmount: data.discountAmount });
        toast.success(`Coupon applied! Saved $${data.discountAmount.toFixed(2)}`);
        setCouponCode('');
      }
    } catch {
      toast.error('Could not validate coupon code.');
    } finally {
      setValidatingCoupon(false);
    }
  };

  // Upload Payment Screenshot
  const handleReceiptUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setReceiptFile(file);
    setUploadingReceipt(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setReceiptUrl(data.url);
        toast.success('Payment receipt uploaded successfully!');
      } else {
        toast.error(data.message || 'Failed to upload receipt image.');
      }
    } catch {
      toast.error('Error uploading payment receipt.');
    } finally {
      setUploadingReceipt(false);
    }
  };

  // Submit Order
  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.info('Please log in or register to complete your order.');
      navigate('/login?redirect=checkout');
      return;
    }

    if (!address || !city) {
      toast.error('Please fill in complete delivery address and city.');
      return;
    }

    setSubmitting(true);

    try {
      const orderData = {
        orderItems: cartItems.map((item) => ({
          product: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          size: item.size || '100ml',
          imageUrl: item.imageUrl,
        })),
        contactInfo: {
          emailOrPhone,
          emailDiscounts,
        },
        shippingAddress: {
          firstName,
          lastName,
          address,
          apartment,
          city,
          postalCode,
          country,
          phone: phone || emailOrPhone,
        },
        billingAddress: {
          sameAsShipping,
          address: sameAsShipping ? address : billingAddress.address,
          city: sameAsShipping ? city : billingAddress.city,
          postalCode: sameAsShipping ? postalCode : billingAddress.postalCode,
          country: sameAsShipping ? country : billingAddress.country,
        },
        paymentMethod,
        paymentProof: {
          screenshotUrl: receiptUrl,
          transactionId,
          note: paymentMethod === 'Bank Transfer' ? 'Submitted bank transfer proof' : 'COD Order',
        },
        couponCode: appliedCoupon?.code || null,
      };

      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to place order.');
      }

      clearCart();
      toast.success('Your order has been placed successfully!');
      navigate(`/success?orderId=${data._id}`);
    } catch (err) {
      console.error('Order submission error:', err);
      toast.error(err.message || 'Failed to complete order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#FAF9F6', minHeight: '100vh', paddingBottom: 60 }}>
      {/* Brand Header */}
      <div
        style={{
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          backgroundColor: 'white',
          padding: '20px 0',
          textAlign: 'center',
          marginBottom: 30,
        }}
      >
        <Link
          to="/"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.8rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--color-burgundy)',
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Anti
        </Link>
      </div>

      <div className="container">
        <form onSubmit={handleSubmitOrder}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.15fr 0.85fr',
              gap: 50,
              alignItems: 'flex-start',
            }}
            className="checkout-container-grid"
          >
            {/* ── LEFT COLUMN: Contact, Delivery, Payment ────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

              {/* 1. Contact */}
              <div style={{ background: 'white', padding: 28, borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Contact</h3>
                  {!user && (
                    <Link to="/login?redirect=checkout" style={{ fontSize: '0.84rem', color: 'var(--color-burgundy)', fontWeight: 600 }}>
                      Sign in
                    </Link>
                  )}
                </div>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Email or mobile phone number"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  style={{ width: '100%', padding: '14px 16px' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
                  <input
                    type="checkbox"
                    id="emailDiscounts"
                    checked={emailDiscounts}
                    onChange={(e) => setEmailDiscounts(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: 'var(--color-burgundy)' }}
                  />
                  <label htmlFor="emailDiscounts" style={{ fontSize: '0.86rem', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                    Email me discounts and exclusive fragrance drops
                  </label>
                </div>
              </div>

              {/* 2. Delivery Address */}
              <div style={{ background: 'white', padding: 28, borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 18 }}>
                  Delivery Address
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Country */}
                  <div>
                    <label style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: 4, display: 'block' }}>
                      Country / Region
                    </label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="form-input"
                      style={{ width: '100%', padding: '14px 16px' }}
                    >
                      <option value="Pakistan">Pakistan</option>
                      <option value="United States">United States</option>
                      <option value="United Arab Emirates">United Arab Emirates</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Saudi Arabia">Saudi Arabia</option>
                    </select>
                  </div>

                  {/* Name row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      style={{ padding: '14px 16px' }}
                    />
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      style={{ padding: '14px 16px' }}
                    />
                  </div>

                  {/* Address */}
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Street address, house number, area"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{ padding: '14px 16px' }}
                  />

                  {/* Apartment */}
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Apartment, suite, unit (optional)"
                    value={apartment}
                    onChange={(e) => setApartment(e.target.value)}
                    style={{ padding: '14px 16px' }}
                  />

                  {/* City and Postal code */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 14 }}>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      style={{ padding: '14px 16px' }}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Postal code (optional)"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      style={{ padding: '14px 16px' }}
                    />
                  </div>

                  {/* Phone */}
                  <input
                    type="tel"
                    required
                    className="form-input"
                    placeholder="Phone number for courier contact"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ padding: '14px 16px' }}
                  />

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                    <input
                      type="checkbox"
                      id="saveInfo"
                      checked={saveInfo}
                      onChange={(e) => setSaveInfo(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: 'var(--color-burgundy)' }}
                    />
                    <label htmlFor="saveInfo" style={{ fontSize: '0.86rem', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                      Save this information for next time
                    </label>
                  </div>
                </div>
              </div>

              {/* 3. Shipping Method */}
              <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 14 }}>
                  Shipping method
                </h3>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 20px',
                    borderRadius: 10,
                    border: '1.5px solid var(--color-burgundy)',
                    background: 'rgba(89,53,48,0.03)',
                  }}
                >
                  <span style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.92rem' }}>
                    Free Express Shipping
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--color-success)', fontSize: '0.92rem' }}>
                    FREE
                  </span>
                </div>
              </div>

              {/* 4. Payment Options (COD vs Bank Transfer 5% Off) */}
              <div style={{ background: 'white', padding: 28, borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)' }}>
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    Payment
                  </h3>
                  <p style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                    All transactions are secure and encrypted.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Option 1: Cash on Delivery */}
                  <div
                    onClick={() => setPaymentMethod('Cash on Delivery (COD)')}
                    style={{
                      padding: 18,
                      borderRadius: 12,
                      border: paymentMethod === 'Cash on Delivery (COD)' ? '2px solid var(--color-burgundy)' : '1px solid rgba(0,0,0,0.12)',
                      background: paymentMethod === 'Cash on Delivery (COD)' ? 'rgba(89,53,48,0.02)' : 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'Cash on Delivery (COD)'}
                      onChange={() => setPaymentMethod('Cash on Delivery (COD)')}
                      style={{ width: 18, height: 18, accentColor: 'var(--color-burgundy)', cursor: 'pointer' }}
                    />
                    <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
                      Cash on Delivery (COD)
                    </span>
                  </div>

                  {/* Option 2: Bank Transfer — Get 5% Off */}
                  <div
                    onClick={() => setPaymentMethod('Bank Transfer')}
                    style={{
                      padding: 18,
                      borderRadius: 12,
                      border: paymentMethod === 'Bank Transfer' ? '2px solid var(--color-burgundy)' : '1px solid rgba(0,0,0,0.12)',
                      background: paymentMethod === 'Bank Transfer' ? 'rgba(89,53,48,0.02)' : 'white',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'Bank Transfer'}
                        onChange={() => setPaymentMethod('Bank Transfer')}
                        style={{ width: 18, height: 18, accentColor: 'var(--color-burgundy)', cursor: 'pointer' }}
                      />
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-burgundy)' }}>
                        Bank Transfer — Get {bankDetails.discountPercent || 5}% Off
                      </span>
                    </div>

                    {/* Bank Details Dropdown / Instruction Box matching reference */}
                    {paymentMethod === 'Bank Transfer' && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          marginTop: 18,
                          padding: 20,
                          backgroundColor: '#FAF9F6',
                          borderRadius: 10,
                          border: '1px solid rgba(106,91,83,0.15)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 14,
                          fontSize: '0.88rem',
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        <p style={{ fontWeight: 700, color: 'var(--color-burgundy)' }}>
                          Skip the Cash — Save {bankDetails.discountPercent || 5}% with Bank Transfer
                        </p>

                        <div style={{ padding: '10px 14px', background: 'white', borderRadius: 8, border: '1px solid rgba(0,0,0,0.06)' }}>
                          <p style={{ fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                            STEP 1 — 5% Discount Automatic
                          </p>
                          <p style={{ color: 'var(--color-success)', fontWeight: 700 }}>
                            ✓ Extra Rs. {Math.round(bankDiscount).toLocaleString()} discount deducted on total.
                          </p>
                        </div>

                        <div style={{ padding: '14px 16px', background: 'white', borderRadius: 8, border: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <p style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                            STEP 2 — Transfer the amount to our bank:
                          </p>
                          <p><strong>Bank:</strong> {bankDetails.bankName}</p>
                          <p><strong>Account Title:</strong> {bankDetails.accountTitle}</p>
                          <p><strong>Account:</strong> {bankDetails.accountNumber}</p>
                          {bankDetails.iban && <p><strong>IBAN:</strong> {bankDetails.iban}</p>}
                        </div>

                        {/* Step 3: Receipt Upload */}
                        <div style={{ padding: '14px 16px', background: 'white', borderRadius: 8, border: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <p style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                            STEP 3 — Upload payment screenshot or enter transaction ID:
                          </p>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <label
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                padding: '12px',
                                border: '2px dashed rgba(89,53,48,0.3)',
                                borderRadius: 8,
                                cursor: 'pointer',
                                background: receiptUrl ? 'rgba(110,138,115,0.08)' : 'transparent',
                              }}
                            >
                              <Upload size={16} color="var(--color-burgundy)" />
                              <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--color-burgundy)' }}>
                                {uploadingReceipt ? 'Uploading receipt...' : receiptUrl ? '✓ Receipt Uploaded (Click to change)' : 'Upload Transfer Screenshot'}
                              </span>
                              <input type="file" accept="image/*" onChange={handleReceiptUpload} style={{ display: 'none' }} />
                            </label>

                            <input
                              type="text"
                              className="form-input"
                              placeholder="Or Enter Transaction Reference ID"
                              value={transactionId}
                              onChange={(e) => setTransactionId(e.target.value)}
                              style={{ padding: '10px 14px' }}
                            />
                          </div>

                          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                            WhatsApp Support: {bankDetails.supportPhone || '0314-1774008'}
                          </p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                          <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 2 }} />
                          <span>
                            Please Note: Your order will be confirmed and shipped once payment is verified within 24 Hours.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 5. Billing Address */}
              <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 14 }}>
                  Billing address
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: 16,
                      borderRadius: 10,
                      border: sameAsShipping ? '2px solid var(--color-burgundy)' : '1px solid rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="billing"
                      checked={sameAsShipping}
                      onChange={() => setSameAsShipping(true)}
                      style={{ width: 16, height: 16, accentColor: 'var(--color-burgundy)' }}
                    />
                    <span style={{ fontSize: '0.92rem', fontWeight: 500 }}>Same as shipping address</span>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: 16,
                      borderRadius: 10,
                      border: !sameAsShipping ? '2px solid var(--color-burgundy)' : '1px solid rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="billing"
                      checked={!sameAsShipping}
                      onChange={() => setSameAsShipping(false)}
                      style={{ width: 16, height: 16, accentColor: 'var(--color-burgundy)' }}
                    />
                    <span style={{ fontSize: '0.92rem', fontWeight: 500 }}>Use a different billing address</span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: 18,
                  fontSize: '1.05rem',
                  letterSpacing: '0.08em',
                  boxShadow: '0 8px 24px rgba(89,53,48,0.25)',
                }}
              >
                {submitting ? 'Placing Order...' : 'Complete order'}
              </button>

              {/* Policy Footer Links matching screenshot */}
              <div
                style={{
                  display: 'flex',
                  gap: 18,
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  fontSize: '0.78rem',
                  color: 'var(--color-text-muted)',
                  borderTop: '1px solid rgba(0,0,0,0.08)',
                  paddingTop: 20,
                }}
              >
                <Link to="/#about">Refund policy</Link>
                <Link to="/#about">Shipping</Link>
                <Link to="/#about">Privacy policy</Link>
                <Link to="/#about">Terms of service</Link>
                <Link to="/#about">Contact</Link>
              </div>

            </div>

            {/* ── RIGHT COLUMN: Order Summary & Discount Code ─────────── */}
            <div
              style={{
                background: 'white',
                padding: 32,
                borderRadius: 20,
                border: '1px solid rgba(0,0,0,0.06)',
                position: 'sticky',
                top: 100,
              }}
            >
              {/* Product items list with badges */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 26, maxHeight: 300, overflowY: 'auto' }}>
                {cartItems.map((item) => (
                  <div key={`${item._id}-${item.size}`} style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: 56, height: 56, borderRadius: 10, overflow: 'hidden', backgroundColor: 'var(--bg-secondary)', flexShrink: 0, border: '1px solid rgba(0,0,0,0.08)' }}>
                      <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <span
                        style={{
                          position: 'absolute',
                          top: -3,
                          right: -3,
                          background: 'var(--color-burgundy)',
                          color: 'white',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {item.quantity}
                      </span>
                    </div>
                    <div style={{ flexGrow: 1 }}>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {item.name}
                      </h4>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                        {item.size || '100ml'}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      Rs. {Math.round(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon / Promo Code Input */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 26 }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Discount code or gift card"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApplyCoupon())}
                  style={{ flex: 1, padding: '12px 14px' }}
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={validatingCoupon || !couponCode.trim()}
                  className="btn btn-secondary"
                  style={{ padding: '12px 20px', whiteSpace: 'nowrap' }}
                >
                  {validatingCoupon ? '...' : 'Apply'}
                </button>
              </div>

              {/* Applied Coupon Tag */}
              {appliedCoupon && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: 'rgba(110,138,115,0.1)',
                    marginBottom: 20,
                  }}
                >
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-success)' }}>
                    ✓ {appliedCoupon.code} applied (−Rs. {Math.round(appliedCoupon.discountAmount).toLocaleString()})
                  </span>
                  <button
                    type="button"
                    onClick={() => setAppliedCoupon(null)}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Price Breakdown */}
              <div
                style={{
                  borderTop: '1px solid rgba(0,0,0,0.08)',
                  paddingTop: 18,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  fontSize: '0.92rem',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal</span>
                  <span style={{ fontWeight: 600 }}>Rs. {Math.round(subtotal).toLocaleString()}</span>
                </div>

                {appliedCoupon && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)' }}>
                    <span>Coupon Discount</span>
                    <span>−Rs. {Math.round(couponDiscount).toLocaleString()}</span>
                  </div>
                )}

                {paymentMethod === 'Bank Transfer' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-burgundy)', fontWeight: 600 }}>
                    <span>Bank Transfer ({bankDetails.discountPercent || 5}% Off)</span>
                    <span>−Rs. {Math.round(bankDiscount).toLocaleString()}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Shipping</span>
                  <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>FREE</span>
                </div>

                {/* Total */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    borderTop: '1px solid rgba(0,0,0,0.08)',
                    paddingTop: 18,
                    marginTop: 6,
                  }}
                >
                  <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    Total
                  </span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginRight: 6 }}>PKR</span>
                    <span style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-burgundy)' }}>
                      Rs. {Math.round(finalTotal).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </form>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .checkout-container-grid { grid-template-columns: 1fr !important; gap: 30px !important; }
        }
      `}</style>
    </div>
  );
};

export default Checkout;
