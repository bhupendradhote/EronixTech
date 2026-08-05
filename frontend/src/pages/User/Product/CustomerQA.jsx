import React from 'react';

const defaultQaData = [
  {
    q: 'Does this laptop support charging via Type-C?',
    a: 'Yes, it supports 130W Type-C fast charging through the Thunderbolt 4 ports.',
  },
  {
    q: 'Is the RAM upgradable?',
    a: 'Yes, it features 2x SO-DIMM slots allowing upgrades up to 64GB DDR5.',
  },
  {
    q: 'Does it come with MS Office pre-installed?',
    a: 'Yes, Microsoft Office Home & Student 2021 is included with lifetime validity.',
  },
];

const CustomerQA = ({ qaData = defaultQaData }) => {
  return (
    <div className="pdp-section" style={{ marginTop: '20px' }}>
      <h2 className="pdp-section-title">Customer Questions & Answers</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {qaData.map((qa, index) => (
          <div
            key={index}
            style={{
              padding: '16px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              background: '#fff',
            }}
          >
            <div
              style={{
                fontWeight: 600,
                fontSize: '15px',
                color: '#0f172a',
                marginBottom: '8px',
                display: 'flex',
                gap: '8px',
              }}
            >
              <span style={{ color: '#3b82f6' }}>Q:</span> {qa.q}
            </div>
            <div style={{ fontSize: '14px', color: '#475569', display: 'flex', gap: '8px' }}>
              <span style={{ color: '#10b981', fontWeight: 600 }}>A:</span> {qa.a}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerQA;