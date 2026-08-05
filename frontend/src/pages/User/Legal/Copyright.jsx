import React from 'react';
import Layout from '../../../components/layout/Layout';
import './Legal.css';

const Copyright = () => {
  return (
    <Layout>
      <div className="legal-page-wrapper">
        <section className="legal-hero">
          <h1>Copyright & Intellectual Property</h1>
          <p>Last Updated: October 2026</p>
        </section>

        <main className="legal-content-container">
          <div className="legal-content">
            <h2>1. Ownership of Content</h2>
            <p>
              All content included on this website, such as text, graphics, logos, button icons, images, audio clips, digital downloads, data compilations, and software, is the property of EronixTech or its content suppliers and protected by international copyright laws.
            </p>

            <h2>2. Trademarks</h2>
            <p>
              EronixTech's trademarks and trade dress may not be used in connection with any product or service that is not EronixTech's, in any manner that is likely to cause confusion among customers, or in any manner that disparages or discredits EronixTech. All other trademarks not owned by EronixTech that appear on this site are the property of their respective owners.
            </p>

            <h2>3. Notice of Infringement (DMCA)</h2>
            <p>
              If you believe that your intellectual property rights have been infringed upon by our website content or a third-party seller on our platform, please notify us immediately. Your notice should include:
            </p>
            <ul>
              <li>A physical or electronic signature of the person authorized to act on behalf of the owner of the copyright interest.</li>
              <li>A description of the copyrighted work that you claim has been infringed.</li>
              <li>A description of where the material that you claim is infringing is located on the site.</li>
              <li>Your address, telephone number, and email address.</li>
            </ul>

            <h2>4. License and Site Access</h2>
            <p>
              We grant you a limited license to access and make personal use of this site and not to download (other than page caching) or modify it, or any portion of it, except with express written consent of EronixTech.
            </p>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default Copyright;